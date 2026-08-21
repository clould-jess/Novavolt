import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientInitializationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with the same unique value already exists';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'The referenced record does not exist or is still in use';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2034':
          status = HttpStatus.CONFLICT;
          message = 'Concurrent update detected; please retry';
          break;
      }
    } else {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database is temporarily unavailable';
    }

    response.status(status).json({
      statusCode: status,
      message,
      requestId: response.getHeader('x-request-id'),
      timestamp: new Date().toISOString(),
    });
  }
}
