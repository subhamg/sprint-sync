import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { requestContext } from './request-context';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const reqCtx = requestContext.getStore();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const errorBody: any = {
      message: exception instanceof HttpException ? (exception.getResponse() as any)?.message ?? exception.message : 'Internal server error',
      requestId: reqCtx?.requestId,
    };

    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error({ requestId: reqCtx?.requestId, status, stack }, 'unhandled_exception');

    response.status(status).json(errorBody);
  }
}
