import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../common/prisma.service';

@Controller('staff/daily-summary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF' as any, 'ADMIN' as any)
export class DailySummaryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getSummary(@Query('clinicId') clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waitTimes = await this.prisma.waitTime.findMany({
      where: { clinicId, createdAt: { gte: today } },
      orderBy: { createdAt: 'asc' },
    });

    if (waitTimes.length === 0) {
      return { avgWaitTime: 0, peakHour: 'N/A', peakWait: 0 };
    }

    const avg = Math.round(
      waitTimes.reduce((sum: number, wt) => sum + wt.minutes, 0) / waitTimes.length,
    );

    const peak = waitTimes.reduce((max, wt) => (wt.minutes > max.minutes ? wt : max), waitTimes[0]);
    const peakDate = new Date(peak.createdAt);
    const peakHour = peakDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return {
      avgWaitTime: avg,
      peakHour,
      peakWait: peak.minutes,
    };
  }
}
