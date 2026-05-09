import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TriageLevel } from '@lhn/db';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getQueue(clinicId: string) {
    return this.prisma.queueEntry.findMany({
      where: { clinicId, status: 'waiting' },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ triageLevel: 'asc' }, { checkedInAt: 'asc' }],
    });
  }

  async addToQueue(clinicId: string, patientId: string, triageLevel: TriageLevel, reason: string) {
    return this.prisma.queueEntry.create({
      data: { clinicId, patientId, triageLevel, reason },
    });
  }

  async updateStatus(id: string, status: string) {
    const data: any = { status };
    if (status === 'seen') data.seenAt = new Date();
    return this.prisma.queueEntry.update({ where: { id }, data });
  }

  async getStats(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [patientsSeenToday, telehealthRedirects, erDiversions] = await Promise.all([
      this.prisma.queueEntry.count({
        where: { clinicId, seenAt: { gte: today } },
      }),
      this.prisma.triageSession.count({
        where: { result: TriageLevel.TELEHEALTH, createdAt: { gte: today } },
      }),
      this.prisma.triageSession.count({
        where: { result: { in: [TriageLevel.WALK_IN, TriageLevel.SELF_CARE] }, createdAt: { gte: today } },
      }),
    ]);

    return { patientsSeenToday, telehealthRedirects, erDiversions };
  }
}
