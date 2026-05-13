import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TelehealthService } from './telehealth.service';
import { DailyService } from './daily.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import * as crypto from 'crypto';

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
    const appointment = await this.telehealthService.bookAppointment(
      req.user.sub,
      body.doctorId,
      new Date(body.startTime),
      body.notes,
    );

    // Create Daily.co room immediately so we have a link to share
    try {
      const room = await this.dailyService.createRoom(appointment.id);
      await this.telehealthService.setRoomUrl(appointment.id, room.url);

      // Generate a doctor access token (simple hash — not auth, just link security)
      const doctorToken = crypto
        .createHash('sha256')
        .update(`${appointment.id}-${process.env.JWT_SECRET || 'salt'}`)
        .digest('hex')
        .slice(0, 16);
      await this.telehealthService.setDoctorToken(appointment.id, doctorToken);

      return { ...appointment, dailyRoomUrl: room.url, doctorToken };
    } catch {
      // If Daily.co isn't configured, return appointment without room
      return appointment;
    }
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
  @Post('appointments/connect-now')
  async connectNow(
    @Request() req: any,
    @Body() body: { doctorId: string; reason?: string },
  ) {
    // Verify doctor is on-call
    const doctor = await this.telehealthService.getDoctorById(body.doctorId);
    if (!doctor || !doctor.onDuty || !doctor.telehealth) {
      throw new NotFoundException('Doctor is not available for on-call telehealth');
    }

    // Create instant appointment (starts now)
    const now = new Date();
    const appointment = await this.telehealthService.bookAppointment(
      req.user.sub,
      body.doctorId,
      now,
      body.reason || 'On-call consultation',
    );

    // Mark as in-progress immediately
    await this.telehealthService.updateAppointmentStatus(appointment.id, 'IN_PROGRESS');

    // Create Daily.co room
    const room = await this.dailyService.createRoom(appointment.id);
    await this.telehealthService.setRoomUrl(appointment.id, room.url);

    // Generate doctor access token
    const doctorToken = crypto
      .createHash('sha256')
      .update(`${appointment.id}-${process.env.JWT_SECRET || 'salt'}`)
      .digest('hex')
      .slice(0, 16);
    await this.telehealthService.setDoctorToken(appointment.id, doctorToken);

    // Generate patient meeting token
    const roomName = `appt-${appointment.id}`;
    const patientMeetingToken = await this.dailyService.createMeetingToken(
      roomName,
      'Patient',
      false,
    );

    return {
      appointment: { ...appointment, dailyRoomUrl: room.url, doctorToken },
      roomUrl: room.url,
      token: patientMeetingToken,
      doctorLink: `/join/${appointment.id}?token=${doctorToken}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('appointments/:id/cancel')
  async cancelAppointment(@Request() req: any, @Param('id') id: string) {
    return this.telehealthService.cancelAppointment(id, req.user.sub);
  }

  // Public endpoint — doctor clicks link with token to get a Daily meeting token
  @Post('appointments/:id/doctor-join')
  async doctorJoin(
    @Param('id') id: string,
    @Body() body: { token: string },
  ) {
    const appointment = await this.telehealthService.getAppointmentById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!appointment.dailyRoomUrl) throw new NotFoundException('Video room not ready');

    // Verify the doctor token
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${id}-${process.env.JWT_SECRET || 'salt'}`)
      .digest('hex')
      .slice(0, 16);

    if (body.token !== expectedToken) {
      throw new ForbiddenException('Invalid access link');
    }

    const roomName = `appt-${id}`;
    const meetingToken = await this.dailyService.createMeetingToken(
      roomName,
      appointment.doctor.name,
      true, // doctor is room owner
    );

    return {
      roomUrl: appointment.dailyRoomUrl,
      token: meetingToken,
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime,
        notes: appointment.notes,
        doctorName: appointment.doctor.name,
      },
    };
  }
}
