import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class TelehealthService {
  constructor(private prisma: PrismaService) {}

  async getDoctors(specialty?: string) {
    return this.prisma.doctor.findMany({
      where: {
        telehealth: true,
        ...(specialty ? { specialty } : {}),
      },
      orderBy: { rating: 'desc' },
    });
  }

  async bookAppointment(patientId: string, doctorId: string, startTime: Date, notes?: string) {
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        startTime,
        endTime,
        type: 'telehealth',
        status: 'SCHEDULED',
        notes,
      },
      include: { doctor: true },
    });

    return appointment;
  }

  async getAppointments(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async cancelAppointment(id: string, patientId: string) {
    return this.prisma.appointment.updateMany({
      where: { id, patientId },
      data: { status: 'CANCELLED' },
    });
  }

  async getAppointmentById(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });
  }

  async setRoomUrl(id: string, roomUrl: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { dailyRoomUrl: roomUrl },
    });
  }
}
