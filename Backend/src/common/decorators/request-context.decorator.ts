import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestContext } from '../types/auth-user';

export const CurrentRequestContext = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestContext => {
    const request = context.switchToHttp().getRequest<Request>();
    return {
      ipAddress: request.ip,
      requestId: String(request.headers['x-request-id'] ?? ''),
      userAgent: request.headers['user-agent'],
    };
  },
);
