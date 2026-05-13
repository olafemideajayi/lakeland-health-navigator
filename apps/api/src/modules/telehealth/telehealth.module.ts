import { Module } from '@nestjs/common';
import { TelehealthController } from './telehealth.controller';
import { StaffDoctorsController } from './staff-doctors.controller';
import { DoctorInviteController } from './doctor-invite.controller';
import { TelehealthService } from './telehealth.service';
import { DailyService } from './daily.service';
import { DoctorInviteService } from './doctor-invite.service';

@Module({
  controllers: [TelehealthController, StaffDoctorsController, DoctorInviteController],
  providers: [TelehealthService, DailyService, DoctorInviteService],
  exports: [DailyService],
})
export class TelehealthModule {}
