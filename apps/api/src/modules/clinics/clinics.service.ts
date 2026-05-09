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

    const withWaitTimes = await Promise.all(
      clinics.map(async (clinic) => {
        const latestWait = await this.prisma.waitTime.findFirst({
          where: { clinicId: clinic.id },
          orderBy: { createdAt: 'desc' },
        });
        return {
          ...clinic,
          currentWait: latestWait
            ? {
                minutes: latestWait.minutes,
                patientsWaiting: latestWait.patientsWaiting,
                capacity: latestWait.capacity,
                updatedAt: latestWait.createdAt.toISOString(),
              }
            : null,
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
