import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TelehealthService } from './telehealth.service';
import { DailyService } from './daily.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class TelehealthController {
  constructor(
    private telehealthService: TelehealthService,
    private dailyService: DailyService,
  ) {}

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
  @Post('appointments/:id/join')
  async joinAppointment(@Request() req: any, @Param('id') id: string) {
    const appointment = await this.telehealthService.getAppointmentById(id);
    if (!appointment) throw new Error('Appointment not found');

    let roomUrl = appointment.dailyRoomUrl;

    // Create room if not already created
    if (!roomUrl) {
      const room = await this.dailyService.createRoom(id);
      roomUrl = room.url;
      await this.telehealthService.setRoomUrl(id, roomUrl);
    }

    const roomName = `appt-${id}`;
    const isDoctor = req.user.sub !== appointment.patientId;
    const token = await this.dailyService.createMeetingToken(
      roomName,
      isDoctor ? appointment.doctor.name : 'Patient',
      isDoctor,
    );

    return { roomUrl, token };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('appointments/:id/cancel')
  async cancelAppointment(@Request() req: any, @Param('id') id: string) {
    return this.telehealthService.cancelAppointment(id, req.user.sub);
  }
}
