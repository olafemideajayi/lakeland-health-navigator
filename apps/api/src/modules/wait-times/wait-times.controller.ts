import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WaitTimesService } from './wait-times.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('staff/wait-times')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF' as any, 'ADMIN' as any)
export class WaitTimesController {
  constructor(private waitTimesService: WaitTimesService) {}

  @Post()
  async update(
    @Body() body: { clinicId: string; minutes: number; patientsWaiting: number; capacity: number },
  ) {
    return this.waitTimesService.update(
      body.clinicId,
      body.minutes,
      body.patientsWaiting,
      body.capacity,
      'staff',
    );
  }
}
