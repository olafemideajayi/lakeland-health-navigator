import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('staff/queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF' as any, 'ADMIN' as any)
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get()
  async getQueue(@Query('clinicId') clinicId: string) {
    return this.queueService.getQueue(clinicId);
  }

  @Get('stats')
  async getStats(@Query('clinicId') clinicId: string) {
    return this.queueService.getStats(clinicId);
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.queueService.updateStatus(id, body.status);
  }
}
