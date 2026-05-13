import { Controller, Get, Post, Body, Param, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DoctorInviteService } from './doctor-invite.service';

@Controller('doctor-invites')
export class DoctorInviteController {
  constructor(private inviteService: DoctorInviteService) {}

  // Admin: Send a single invite
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any, 'STAFF' as any)
  async createInvite(
    @Body()
    body: {
      email: string;
      phone?: string;
      name: string;
      specialty: string;
      clinicName?: string;
    },
  ) {
    const invite = await this.inviteService.createInvite(body);
    const baseUrl = process.env.APP_URL || 'https://lakeland-health.vercel.app';
    const emailContent = this.inviteService.generateEmailContent(invite, baseUrl);
    const smsContent = this.inviteService.generateSmsContent(invite, baseUrl);
    const inviteUrl = this.inviteService.generateInviteUrl(invite.token, baseUrl);

    return {
      invite,
      inviteUrl,
      emailContent,
      smsContent,
    };
  }

  // Admin: Send bulk invites
  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any, 'STAFF' as any)
  async createBulkInvites(
    @Body()
    body: {
      invites: Array<{
        email: string;
        phone?: string;
        name: string;
        specialty: string;
        clinicName?: string;
      }>;
    },
  ) {
    const invites = await this.inviteService.createBulkInvites(body.invites);
    const baseUrl = process.env.APP_URL || 'https://lakeland-health.vercel.app';

    return invites.map((invite) => ({
      invite,
      inviteUrl: this.inviteService.generateInviteUrl(invite.token, baseUrl),
      emailContent: this.inviteService.generateEmailContent(invite, baseUrl),
    }));
  }

  // Admin: List all invites
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any, 'STAFF' as any)
  async listInvites() {
    return this.inviteService.getAllInvites();
  }

  // Public: Get invite details (for the onboarding page)
  @Get('verify/:token')
  async verifyInvite(@Param('token') token: string) {
    const invite = await this.inviteService.getInviteByToken(token);
    if (!invite) throw new NotFoundException('Invalid invitation link');
    if (invite.status !== 'pending')
      throw new BadRequestException('This invitation has already been used');
    if (new Date() > invite.expiresAt)
      throw new BadRequestException('This invitation has expired');

    return {
      name: invite.name,
      email: invite.email,
      specialty: invite.specialty,
      clinicName: invite.clinicName,
    };
  }

  // Public: Accept invite and complete onboarding
  @Post('accept/:token')
  async acceptInvite(
    @Param('token') token: string,
    @Body()
    body: {
      bio: string;
      licenseNumber: string;
      clinicId: string;
    },
  ) {
    try {
      const doctor = await this.inviteService.acceptInvite(token, body);
      return { success: true, doctor };
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
