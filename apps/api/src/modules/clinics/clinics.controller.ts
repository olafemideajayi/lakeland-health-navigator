import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClinicsService } from './clinics.service';

@Controller('clinics')
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Get()
  async findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const byId = await this.clinicsService.findById(idOrSlug);
    if (byId) return byId;
    return this.clinicsService.findBySlug(idOrSlug);
  }
}
