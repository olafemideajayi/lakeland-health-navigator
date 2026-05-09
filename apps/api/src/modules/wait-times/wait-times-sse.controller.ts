import { Controller, Sse } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisService } from '../../common/redis.service';

interface MessageEvent {
  data: string;
}

@Controller('sse')
export class WaitTimesSseController {
  private waitTimeSubject = new Subject<string>();

  constructor(private redis: RedisService) {
    this.redis.subscribe('wait-times', (message) => {
      this.waitTimeSubject.next(message);
    });
  }

  @Sse('wait-times')
  waitTimes(): Observable<MessageEvent> {
    return this.waitTimeSubject.asObservable().pipe(
      map((data) => ({ data })),
    );
  }
}
