import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperlogRecordService } from 'src/module/monitor/operlog/operlog-record.service';
import { OperlogConfig } from 'src/common/decorators/operlog.decorator';

const API_OPERATION_METADATA = 'swagger/apiOperation';

@Injectable()
export class GlobalOperlogInterceptor implements NestInterceptor {
  constructor(
    private readonly operlogRecordService: OperlogRecordService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    if (this.operlogRecordService.shouldSkip(req)) {
      return next.handle();
    }

    const handler = context.getHandler();
    const controller = context.getClass();
    const apiOp = this.reflector.getAllAndOverride<Record<string, string>>(API_OPERATION_METADATA, [handler, controller]);
    const logConfig = this.reflector.get<OperlogConfig>('operlog', handler);
    const title = apiOp?.summary || apiOp?.description || `${req.method} ${req.route?.path || req.path}`;
    const businessType = logConfig?.businessType ?? this.operlogRecordService.inferBusinessType(req.method);
    const handlerName = `${controller.name}.${handler.name}`;

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const costTime = Date.now() - startedAt;
          let status: '0' | '1' = '0';
          let errorMsg = '';
          if (data && typeof data === 'object' && data !== null && 'code' in data) {
            const code = (data as { code?: number }).code;
            if (code !== undefined && code !== 200) {
              status = '1';
              errorMsg = String((data as { msg?: string }).msg || '操作失败');
            }
          }
          void this.operlogRecordService.recordFromRequest(req, {
            costTime,
            title,
            handlerName,
            businessType,
            resultData: data,
            errorMsg,
            status,
          });
        },
        error: (err: unknown) => {
          const costTime = Date.now() - startedAt;
          const errorMsg = this.formatException(err);
          void this.operlogRecordService.recordFromRequest(req, {
            costTime,
            title,
            handlerName,
            businessType,
            resultData: undefined,
            errorMsg,
            status: '1',
          });
        },
      }),
    );
  }

  private formatException(err: unknown): string {
    if (err == null) return '';
    if (typeof err === 'string') return err;
    const e = err as Record<string, unknown>;
    const resp = e?.response;
    if (typeof resp === 'string') return resp;
    if (resp && typeof resp === 'object' && resp !== null) {
      const r = resp as Record<string, unknown>;
      if (typeof r.message === 'string') return r.message;
      if (Array.isArray(r.message)) return r.message.join('; ');
    }
    if (typeof e.message === 'string') return e.message;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  }
}
