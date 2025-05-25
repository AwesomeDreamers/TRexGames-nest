import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS_MESSAGE_METADATA } from 'src/common/decorator/message.decorator';
import { Api } from './api.interface';

@Injectable()
export class ApiInterceptor<T> implements NestInterceptor<T, Api<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Api<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const successMessage = this.reflector.get<string>(
          SUCCESS_MESSAGE_METADATA,
          context.getHandler(),
        );

        return {
          statusCode: response.statusCode || HttpStatus.OK,
          message: successMessage || 'Success',
          body: data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
