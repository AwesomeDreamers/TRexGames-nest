import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: any, host: ArgumentsHost) {
    const status = exception.getStatus();
    const message = exception.message;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.NOT_FOUND ||
      status === HttpStatus.CONFLICT
    ) {
      this.logger.warn(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    } else {
      this.logger.error(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    }
    response.status(status).json({
      statusCode: status,
      message: message,
      path: request.url,
    });
  }
}
