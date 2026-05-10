import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const clinics = await this.prisma.clinic.findMany({
      include: {
        doctors: { where: { onDuty: true }, select: { id: true, name: true, specialty: true } },
      },
    });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const withWaitTimes = await Promise.all(
      clinics.map(async (clinic) => {
        const [latestStaffUpdate, recentReports] = await Promise.all([
          this.prisma.waitTime.findFirst({
            where: { clinicId: clinic.id },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.patientWaitReport.findMany({
            where: { clinicId: clinic.id, reportedAt: { gte: twoHoursAgo } },
            orderBy: { reportedAt: 'desc' },
            take: 20,
          }),
        ]);

        let minutes = 0;
        let source = 'none';

        if (recentReports.length > 0) {
          const now = Date.now();
          let weightedSum = 0;
          let totalWeight = 0;
          for (const report of recentReports) {
            const ageMin = (now - report.reportedAt.getTime()) / 60000;
            const weight = Math.max(0.1, 1 - ageMin / 120);
            weightedSum += report.minutesWaited * weight;
            totalWeight += weight;
          }
          if (latestStaffUpdate) {
            const staffAge = (now - latestStaffUpdate.createdAt.getTime()) / 60000;
            if (staffAge < 30) {
              const staffWeight = Math.max(0.2, 1 - staffAge / 30) * 2;
              weightedSum += latestStaffUpdate.minutes * staffWeight;
              totalWeight += staffWeight;
            }
          }
          minutes = Math.round(weightedSum / totalWeight);
          source = 'blended';
        } else if (latestStaffUpdate) {
          minutes = latestStaffUpdate.minutes;
          source = 'staff';
        }

        return {
          ...clinic,
          currentWait: {
            minutes,
            patientsWaiting: latestStaffUpdate?.patientsWaiting || recentReports.length,
            capacity: latestStaffUpdate?.capacity || 12,
            updatedAt: recentReports[0]?.reportedAt.toISOString() ||
              latestStaffUpdate?.createdAt.toISOString() || new Date().toISOString(),
            source,
            reportCount: recentReports.length,
          },
        };
      }),
    );

    return withWaitTimes;
  }

  async findBySlug(slug: string) {
    return this.prisma.clinic.findUnique({
      where: { slug },
      include: {
        doctors: true,
      },
    });
  }

  async findById(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: { doctors: true },
    });
    if (!clinic) return null;
    const waitTimes = await this.prisma.waitTime.findMany({
      where: { clinicId: id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    return { ...clinic, waitTimes };
  }
}
