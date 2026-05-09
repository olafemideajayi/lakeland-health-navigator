import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { DailySummaryController } from './daily-summary.controller';

@Module({
  controllers: [QueueController, DailySummaryController],
  providers: [QueueService],
})
export class QueueModule {}
