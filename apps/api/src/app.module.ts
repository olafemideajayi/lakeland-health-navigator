import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { WaitTimesModule } from './modules/wait-times/wait-times.module';
import { TriageModule } from './modules/triage/triage.module';
import { TelehealthModule } from './modules/telehealth/telehealth.module';
import { QueueModule } from './modules/queue/queue.module';
import { PrismaModule } from './common/prisma.module';
import { RedisModule } from './common/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    ClinicsModule,
    WaitTimesModule,
    TriageModule,
    TelehealthModule,
    QueueModule,
  ],
})
export class AppModule {}
