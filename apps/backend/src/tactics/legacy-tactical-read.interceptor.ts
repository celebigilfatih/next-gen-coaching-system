import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { assertLegacyTacticalRead } from './tactical-persistence';

@Injectable()
export class LegacyTacticalReadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{ method: string }>();
    return next
      .handle()
      .pipe(
        map((value: unknown) =>
          request.method === 'GET' ? assertLegacyTacticalRead(value) : value,
        ),
      );
  }
}
