import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class WaitTimesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async update(clinicId: string, minutes: number, patientsWaiting: number, capacity: number, updatedBy: string) {
    const waitTime = await this.prisma.waitTime.create({
      data: { clinicId, minutes, patientsWaiting, capacity, updatedBy },
    });

    const payload = JSON.stringify({
      clinicId,
      minutes,
      patientsWaiting,
      capacity,
      updatedAt: waitTime.createdAt.toISOString(),
    });

    await this.redis.publish('wait-times', payload);
    await this.redis.set(`wait-time:${clinicId}`, payload, 300);

    return waitTime;
  }

  async getCurrent(clinicId: string) {
    const cached = await this.redis.get(`wait-time:${clinicId}`);
    if (cached) return JSON.parse(cached);

    const latest = await this.prisma.waitTime.findFirst({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });
    return latest;
  }
}
