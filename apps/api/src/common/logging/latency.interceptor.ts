import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { requestContext } from "./request-context";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class LatencyLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();

    return next.handle().pipe(
      tap({
        next: () => this.log(req, http.getResponse()),
        error: () => this.log(req, http.getResponse(), true),
      }),
    );
  }

  private log(req: any, res: any, isError = false) {
    const ctx = requestContext.getStore();
    const latencyMs = ctx ? Date.now() - ctx.startedAt : undefined;
    const userId = req?.user?.sub;

    const payload = {
      requestId: ctx?.requestId,
      method: req?.method,
      path: req?.originalUrl || req?.url,
      userId,
      statusCode: res?.statusCode,
      latencyMs,
    };

    if (isError) this.logger.error(payload, "request_error");
    else this.logger.info(payload, "request_complete");
  }
}
