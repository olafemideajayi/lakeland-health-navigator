import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TriageLevel } from '@lhn/db';

interface TriageAnswers {
  concern: string;
  duration: string;
  severity: string;
}

@Injectable()
export class TriageService {
  constructor(private prisma: PrismaService) {}

  assess(answers: TriageAnswers): { level: TriageLevel; recommendation: string } {
    const { concern, duration, severity } = answers;

    if (severity === 'severe') {
      return {
        level: TriageLevel.EMERGENCY,
        recommendation: 'Visit your nearest emergency department for prompt evaluation.',
      };
    }

    if (severity === 'moderate' && duration === 'hours') {
      return {
        level: TriageLevel.URGENT,
        recommendation: 'Visit urgent care within the next few hours.',
      };
    }

    if (concern === 'mental' || concern === 'chronic') {
      return {
        level: TriageLevel.TELEHEALTH,
        recommendation: 'A telehealth consultation with a specialist is recommended.',
      };
    }

    if (severity === 'moderate') {
      return {
        level: TriageLevel.TELEHEALTH,
        recommendation: 'Your concern can likely be addressed through a video consultation.',
      };
    }

    return {
      level: TriageLevel.WALK_IN,
      recommendation: 'A walk-in clinic visit is appropriate for your symptoms.',
    };
  }

  async saveSession(answers: TriageAnswers, disclaimerAcked: boolean) {
    const { level, recommendation } = this.assess(answers);

    const session = await this.prisma.triageSession.create({
      data: {
        sessionData: answers as any,
        result: level,
        recommendation,
        disclaimerAcked,
      },
    });

    return { ...session, level, recommendation };
  }
}
