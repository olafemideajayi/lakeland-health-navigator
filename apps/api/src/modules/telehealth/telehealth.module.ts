import { Module } from '@nestjs/common';
import { TelehealthController } from './telehealth.controller';
import { StaffDoctorsController } from './staff-doctors.controller';
import { TelehealthService } from './telehealth.service';
import { DailyService } from './daily.service';

@Module({
  controllers: [TelehealthController, StaffDoctorsController],
  providers: [TelehealthService, DailyService],
  exports: [DailyService],
})
export class TelehealthModule {}
