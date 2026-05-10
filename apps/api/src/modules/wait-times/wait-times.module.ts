import { Module } from '@nestjs/common';
import { WaitTimesController } from './wait-times.controller';
import { WaitTimesService } from './wait-times.service';
import { WaitTimesSseController } from './wait-times-sse.controller';
import { WaitReportController } from './wait-report.controller';
import { WaitReportService } from './wait-report.service';

@Module({
  controllers: [WaitTimesController, WaitTimesSseController, WaitReportController],
  providers: [WaitTimesService, WaitReportService],
})
export class WaitTimesModule {}
