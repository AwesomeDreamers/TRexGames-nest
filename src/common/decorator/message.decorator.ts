import { SetMetadata } from '@nestjs/common';
import { ResponseMessage } from '../enum/response-message.enum';

export const SUCCESS_MESSAGE_METADATA = 'success_message';

export const Message = (message: ResponseMessage) =>
  SetMetadata(SUCCESS_MESSAGE_METADATA, message);
