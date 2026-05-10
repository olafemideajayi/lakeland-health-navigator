import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class WaitReportService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async submitReport(clinicId: string, minutesWaited: number, visitReason?: string) {
    const report = await this.prisma.patientWaitReport.create({
      data: { clinicId, minutesWaited, visitReason },
    });

    const dynamicWait = await this.calculateDynamicWait(clinicId);

    const payload = JSON.stringify({
      clinicId,
      minutes: dynamicWait.minutes,
      patientsWaiting: dynamicWait.reportCount,
      capacity: 12,
      updatedAt: new Date().toISOString(),
      source: 'patient_reports',
    });

    await this.redis.publish('wait-times', payload);
    await this.redis.set(`wait-time:${clinicId}`, payload, 300);

    return { report, dynamicWait };
  }

  async calculateDynamicWait(clinicId: string) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentReports = await this.prisma.patientWaitReport.findMany({
      where: { clinicId, reportedAt: { gte: twoHoursAgo } },
      orderBy: { reportedAt: 'desc' },
      take: 20,
    });

    const staffUpdate = await this.prisma.waitTime.findFirst({
      where: { clinicId, createdAt: { gte: twoHoursAgo } },
      orderBy: { createdAt: 'desc' },
    });

    if (recentReports.length === 0 && !staffUpdate) {
      return { minutes: 0, reportCount: 0, source: 'none' as const };
    }

    if (recentReports.length === 0 && staffUpdate) {
      return { minutes: staffUpdate.minutes, reportCount: 0, source: 'staff' as const };
    }

    // Weighted average: more recent reports count more
    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    for (const report of recentReports) {
      const ageMinutes = (now - report.reportedAt.getTime()) / 60000;
      const weight = Math.max(0.1, 1 - ageMinutes / 120);
      weightedSum += report.minutesWaited * weight;
      totalWeight += weight;
    }

    // Blend with staff update if recent (within 30 min)
    if (staffUpdate) {
      const staffAge = (now - staffUpdate.createdAt.getTime()) / 60000;
      if (staffAge < 30) {
        const staffWeight = Math.max(0.2, 1 - staffAge / 30) * 2;
        weightedSum += staffUpdate.minutes * staffWeight;
        totalWeight += staffWeight;
      }
    }

    const minutes = Math.round(weightedSum / totalWeight);
    return { minutes, reportCount: recentReports.length, source: 'blended' as const };
  }

  async getRecentReports(clinicId: string) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return this.prisma.patientWaitReport.findMany({
      where: { clinicId, reportedAt: { gte: twoHoursAgo } },
      orderBy: { reportedAt: 'desc' },
      take: 10,
    });
  }
}
