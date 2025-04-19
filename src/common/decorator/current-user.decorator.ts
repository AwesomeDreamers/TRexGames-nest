import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from '../utils/type';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): Promise<Payload> => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request['user'];
  },
);
