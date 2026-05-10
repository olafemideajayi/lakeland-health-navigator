import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WaitReportService } from './wait-report.service';

@Controller('wait-reports')
export class WaitReportController {
  constructor(private waitReportService: WaitReportService) {}

  @Post()
  async submitReport(
    @Body() body: { clinicId: string; minutesWaited: number; visitReason?: string },
  ) {
    return this.waitReportService.submitReport(
      body.clinicId,
      body.minutesWaited,
      body.visitReason,
    );
  }

  @Get()
  async getRecentReports(@Query('clinicId') clinicId: string) {
    return this.waitReportService.getRecentReports(clinicId);
  }

  @Get('dynamic')
  async getDynamicWait(@Query('clinicId') clinicId: string) {
    return this.waitReportService.calculateDynamicWait(clinicId);
  }
}
