import { Module } from '@nestjs/common';
import { TelehealthController } from './telehealth.controller';
import { TelehealthService } from './telehealth.service';
import { DailyService } from './daily.service';

@Module({
  controllers: [TelehealthController],
  providers: [TelehealthService, DailyService],
  exports: [DailyService],
})
export class TelehealthModule {}
