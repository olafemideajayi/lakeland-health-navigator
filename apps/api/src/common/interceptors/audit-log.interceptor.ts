import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET') return next.handle();

    const userId = request.user?.sub || null;
    const action = `${method} ${request.route?.path || request.url}`;
    const resource = context.getClass().name;
    const ipAddress = request.ip || request.connection?.remoteAddress;

    return next.handle().pipe(
      tap(() => {
        this.prisma.auditLog
          .create({
            data: {
              userId,
              action,
              resource,
              metadata: { body: this.sanitizeBody(request.body), params: request.params },
              ipAddress,
            },
          })
          .catch(() => {});
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    const sensitive = ['password', 'passwordHash', 'token', 'apiKey', 'secret'];
    for (const key of sensitive) {
      if (key in sanitized) sanitized[key] = '[REDACTED]';
    }
    return sanitized;
  }
}
