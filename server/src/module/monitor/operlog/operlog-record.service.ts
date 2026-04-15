import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { SysOperlogEntity } from './entities/operlog.entity';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { BusinessType } from 'src/common/constant/business.constant';

const SENSITIVE_KEYS = new Set(['password', 'oldPassword', 'newPassword', 'confirmPassword']);

export type RecordOperlogOptions = {
  costTime: number;
  title: string;
  handlerName: string;
  businessType: number;
  resultData?: unknown;
  errorMsg?: string;
  status: '0' | '1';
};

@Injectable()
export class OperlogRecordService {
  private readonly logger = new Logger(OperlogRecordService.name);

  constructor(
    @InjectRepository(SysOperlogEntity)
    private readonly operLogEntityRep: Repository<SysOperlogEntity>,
    private readonly axiosService: AxiosService,
  ) {}

  /**
   * 根据 HTTP 方法推断业务类型（无 @Operlog 时使用）
   */
  inferBusinessType(method: string): number {
    const m = method.toUpperCase();
    if (m === 'POST') return BusinessType.INSERT;
    if (m === 'PUT' || m === 'PATCH') return BusinessType.UPDATE;
    if (m === 'DELETE') return BusinessType.DELETE;
    return BusinessType.OTHER;
  }

  shouldSkip(req: Request): boolean {
    if (req.method === 'OPTIONS') return true;
    const url = req.originalUrl || req.url || '';
    if (url.includes('swagger-ui') || url.includes('/swagger') || url.includes('/monitor/operlog')) return true;
    return false;
  }

  private truncate(str: string, max: number): string {
    if (!str || str.length <= max) return str || '';
    return `${str.slice(0, max)}...`;
  }

  private sanitizeOperParam(body: Record<string, unknown>, query: Record<string, unknown>): string {
    const merged: Record<string, unknown> = { ...query, ...body };
    for (const k of SENSITIVE_KEYS) {
      if (k in merged) merged[k] = '******';
    }
    try {
      return this.truncate(JSON.stringify(merged), 2000);
    } catch {
      return '';
    }
  }

  private stringifyResult(data: unknown): string {
    if (data === undefined || data === null) return '';
    try {
      return this.truncate(JSON.stringify(data), 2000);
    } catch {
      return '';
    }
  }

  private resolveUser(req: Request & { user?: any }) {
    const session = req.user;
    if (!session) {
      return {
        operName: '',
        deptName: '',
        tenantId: 1,
        deptId: null as number | null,
        ownerUserId: null as number | null,
      };
    }
    const inner = session.user;
    const operName = inner?.nickName || session.userName || '';
    const deptName = inner?.dept?.deptName || (inner as Record<string, string | undefined>)?.deptName || '';
    return {
      operName,
      deptName,
      tenantId: session.tenantId ?? inner?.tenantId ?? 1,
      deptId: session.deptId ?? inner?.deptId ?? null,
      ownerUserId: session.userId ?? inner?.userId ?? null,
    };
  }

  async recordFromRequest(req: Request & { user?: any }, opts: RecordOperlogOptions): Promise<void> {
    try {
      const { originalUrl, method, body, query } = req;
      const ip = (req as Request & { ip?: string }).ip || req.ip || '';
      // const operLocation = await this.axiosService.getIpAddress(ip).catch(() => '');
      const u = this.resolveUser(req);

      const row: Partial<SysOperlogEntity> = {
        tenantId: u.tenantId,
        deptId: u.deptId ?? undefined,
        ownerUserId: u.ownerUserId ?? undefined,
        title: this.truncate(opts.title || '', 300),
        businessType: opts.businessType,
        method: opts.handlerName,
        requestMethod: method.toUpperCase(),
        operatorType: '1',
        operName: this.truncate(u.operName, 300),
        deptName: this.truncate(u.deptName, 300),
        operUrl: this.truncate(originalUrl || '', 500),
        operIp: this.truncate(ip, 255),
        operLocation: '',
        operParam: this.sanitizeOperParam((body || {}) as Record<string, unknown>, (query || {}) as Record<string, unknown>),
        jsonResult: this.stringifyResult(opts.resultData),
        errorMsg: opts.status === '1' ? this.truncate(opts.errorMsg || '', 2000) : '',
        status: opts.status,
        costTime: opts.costTime,
      };

      await this.operLogEntityRep.save(row);
    } catch (e) {
      this.logger.warn(`操作日志写入失败: ${e instanceof Error ? e.message : e}`);
    }
  }
}
