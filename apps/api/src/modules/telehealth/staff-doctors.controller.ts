import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TelehealthService } from './telehealth.service';

@Controller('staff/doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF' as any, 'ADMIN' as any)
export class StaffDoctorsController {
  constructor(private telehealthService: TelehealthService) {}

  @Get()
  async getClinicDoctors(@Query('clinicId') clinicId: string) {
    return this.telehealthService.getClinicDoctors(clinicId);
  }

  @Patch(':id/toggle-oncall')
  async toggleOnCall(@Param('id') id: string) {
    return this.telehealthService.toggleDoctorOnCall(id);
  }
}
