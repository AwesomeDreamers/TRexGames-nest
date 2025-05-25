// http-exception.filter.ts (수정된 버전)
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { ErrorCodeMap } from '../enum/error-code.enum';
import { ApiException } from '../error/api.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const message = exception.message;

    if (
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.NOT_FOUND ||
      status === HttpStatus.CONFLICT ||
      status === HttpStatus.BAD_REQUEST
    ) {
      this.logger.warn(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    } else {
      this.logger.error(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    }

    let responseBody: any = {
      statusCode: status,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof ApiException) {
      const customErrorCode = exception.getErrorCode();
      const enumDetail = ErrorCodeMap[customErrorCode];
      responseBody.message =
        message || (enumDetail ? enumDetail.message : '알 수 없는 에러');
      responseBody.code = customErrorCode;
    }
    response.status(status).json(responseBody);
  }
}
