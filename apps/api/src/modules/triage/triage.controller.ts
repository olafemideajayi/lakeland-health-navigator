import { Controller, Post, Body } from '@nestjs/common';
import { TriageService } from './triage.service';

@Controller('triage')
export class TriageController {
  constructor(private triageService: TriageService) {}

  @Post()
  async assess(
    @Body() body: { answers: { concern: string; duration: string; severity: string }; disclaimerAcked: boolean },
  ) {
    return this.triageService.saveSession(body.answers, body.disclaimerAcked);
  }
}
