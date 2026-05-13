import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class DoctorInviteService {
  constructor(private prisma: PrismaService) {}

  async createInvite(data: {
    email: string;
    phone?: string;
    name: string;
    specialty: string;
    clinicName?: string;
  }) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return this.prisma.doctorInvite.create({
      data: {
        ...data,
        token,
        expiresAt,
      },
    });
  }

  async createBulkInvites(
    invites: Array<{
      email: string;
      phone?: string;
      name: string;
      specialty: string;
      clinicName?: string;
    }>,
  ) {
    const results = [];
    for (const invite of invites) {
      const result = await this.createInvite(invite);
      results.push(result);
    }
    return results;
  }

  async getInviteByToken(token: string) {
    return this.prisma.doctorInvite.findUnique({ where: { token } });
  }

  async getAllInvites() {
    return this.prisma.doctorInvite.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvite(
    token: string,
    data: {
      bio: string;
      licenseNumber: string;
      clinicId: string;
    },
  ) {
    const invite = await this.prisma.doctorInvite.findUnique({
      where: { token },
    });

    if (!invite) throw new Error('Invalid invitation');
    if (invite.status !== 'pending') throw new Error('Invitation already used');
    if (new Date() > invite.expiresAt) throw new Error('Invitation expired');

    // Create doctor profile
    const doctor = await this.prisma.doctor.create({
      data: {
        name: invite.name,
        email: invite.email,
        phone: invite.phone,
        specialty: invite.specialty,
        bio: data.bio,
        licenseNumber: data.licenseNumber,
        clinicId: data.clinicId,
        telehealth: true,
        onDuty: false,
        rating: 0,
        ratingCount: 0,
      },
    });

    // Update invite status
    await this.prisma.doctorInvite.update({
      where: { token },
      data: {
        status: 'accepted',
        agreementSigned: true,
        signedAt: new Date(),
        doctorId: doctor.id,
      },
    });

    return doctor;
  }

  generateInviteUrl(token: string, baseUrl: string) {
    return `${baseUrl}/doctor-onboard?token=${token}`;
  }

  generateEmailContent(invite: {
    name: string;
    specialty: string;
    token: string;
  }, baseUrl: string) {
    const url = this.generateInviteUrl(invite.token, baseUrl);
    return {
      subject: 'Invitation to Join Lakeland Health Navigator — Telehealth Platform',
      text: `Dear ${invite.name},

You are invited to join the Lakeland Health Navigator as a telehealth provider.

Lakeland Health Navigator connects patients in Cold Lake, Bonnyville, Lac La Biche, and St. Paul with specialists via secure video consultations — eliminating the 3-hour drive to Edmonton for routine specialist care.

As a ${invite.specialty} specialist, you would provide virtual consultations to patients in rural Alberta directly from your office or home.

How it works:
- Patients book appointments or connect instantly when you're on-call
- You receive a secure video link — no app install needed
- Consultations are 30 minutes via browser-based video
- Covered under Alberta Health billing

To join, please review and sign our Physician Telehealth Agreement:
${url}

This link expires in 30 days.

If you have questions, please contact us at admin@lakelandhealth.ca

Thank you for supporting rural healthcare access in Alberta.

Lakeland Health Navigator
Cold Lake, Alberta`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a56db; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">Lakeland Health Navigator</h1>
    <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Telehealth for Rural Alberta</p>
  </div>
  <div style="background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">
    <p>Dear <strong>${invite.name}</strong>,</p>
    <p>You are invited to join the Lakeland Health Navigator as a <strong>${invite.specialty}</strong> telehealth provider.</p>
    <p>Our platform connects patients in Cold Lake, Bonnyville, Lac La Biche, and St. Paul with specialists via secure video consultations &mdash; eliminating the 3-hour drive to Edmonton.</p>

    <div style="background: #f0f7ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #1a56db;">How it works:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
        <li>Patients book or connect instantly when you're on-call</li>
        <li>You receive a secure video link &mdash; no app install needed</li>
        <li>30-minute consultations via browser-based video</li>
        <li>Covered under Alberta Health billing</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="display: inline-block; background: #1a56db; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">Review Agreement &amp; Join</a>
    </div>

    <p style="font-size: 13px; color: #6b7280;">This invitation expires in 30 days. If you have questions, contact us at <a href="mailto:admin@lakelandhealth.ca">admin@lakelandhealth.ca</a></p>
  </div>
  <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">Lakeland Health Navigator &bull; Cold Lake, Alberta</p>
</body>
</html>`,
    };
  }

  generateSmsContent(invite: {
    name: string;
    token: string;
  }, baseUrl: string) {
    const url = this.generateInviteUrl(invite.token, baseUrl);
    return `Dr. ${invite.name.split(' ').pop()}, you're invited to join Lakeland Health Navigator for telehealth. Review & sign: ${url}`;
  }
}
