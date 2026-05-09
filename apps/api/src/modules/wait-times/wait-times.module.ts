import { Module } from '@nestjs/common';
import { WaitTimesController } from './wait-times.controller';
import { WaitTimesService } from './wait-times.service';
import { WaitTimesSseController } from './wait-times-sse.controller';

@Module({
  controllers: [WaitTimesController, WaitTimesSseController],
  providers: [WaitTimesService],
})
export class WaitTimesModule {}
