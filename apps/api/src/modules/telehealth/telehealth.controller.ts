import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TelehealthService } from './telehealth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class TelehealthController {
  constructor(private telehealthService: TelehealthService) {}

  @Get('doctors')
  async getDoctors(@Query('specialty') specialty?: string) {
    return this.telehealthService.getDoctors(specialty);
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointments')
  async bookAppointment(
    @Request() req: any,
    @Body() body: { doctorId: string; startTime: string; notes?: string },
  ) {
    return this.telehealthService.bookAppointment(
      req.user.sub,
      body.doctorId,
      new Date(body.startTime),
      body.notes,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('appointments')
  async getAppointments(@Request() req: any) {
    return this.telehealthService.getAppointments(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('appointments/:id/cancel')
  async cancelAppointment(@Request() req: any, @Param('id') id: string) {
    return this.telehealthService.cancelAppointment(id, req.user.sub);
  }
}
