import { ConsoleLogger, Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class ContextFileLoggerService implements LoggerService {
  private readonly logDir: string;
  private readonly rotateMaxSize: string | number | undefined;
  private readonly rotateMaxFiles: string | number | undefined;
  private readonly fileLoggers = new Map<string, winston.Logger>();
  private readonly consoleLogger = new ConsoleLogger();

  constructor(private readonly configService: ConfigService) {
    const configured = this.configService.get<string>('app.logger.dir') ?? 'logs';
    this.logDir = this.resolveLogDirUnderCwd(configured);
    this.rotateMaxSize = this.normalizeWinstonMaxSize(this.configService.get<string | number>('app.logger.maxSize') ?? '1m');
    this.rotateMaxFiles = this.configService.get<string | number>('app.logger.maxFiles') ?? '14d';
    mkdirSync(this.logDir, { recursive: true });
    // 使用 console：此时全局 Logger 可能尚未挂上本服务，避免用户找不到落盘目录
    console.log(`[ContextFileLogger] 文件日志目录: ${path.resolve(this.logDir)}`);
  }

  /** 相对路径一律解析在 process.cwd() 之下；含 .. 逃出 cwd 时回退为 cwd/logs */
  private resolveLogDirUnderCwd(configured: string): string {
    const cwd = process.cwd();
    if (path.isAbsolute(configured)) {
      return configured;
    }
    const resolved = path.resolve(cwd, configured);
    const rel = path.relative(cwd, resolved);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
      return path.join(cwd, 'logs');
    }
    return resolved;
  }

  /**
   * winston-daily-rotate-file 只接受数字字节或后缀为单个 k/m/g 的字符串（如 1m），写 1mb 会匹配失败等同未启用按大小轮转。
   * @see https://github.com/winstonjs/winston-daily-rotate-file#getmaxsize
   */
  private normalizeWinstonMaxSize(value: string | number | undefined): string | number | undefined {
    if (value == null || value === '') return undefined;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/^(\d+(?:\.\d+)?)([kmg])b$/i, '$1$2');
  }

  private safeFileBase(context: string): string {
    return context.replace(/[/\\:*?"<>|]/g, '_').slice(0, 120) || 'Application';
  }

  private stringify(message: unknown): string {
    if (typeof message === 'string') return message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private getFileLogger(context: string): winston.Logger {
    let logger = this.fileLoggers.get(context);
    if (!logger) {
      const base = this.safeFileBase(context);
      logger = winston.createLogger({
        transports: [
          new DailyRotateFile({
            dirname: this.logDir,
            filename: `${base}-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxFiles: this.rotateMaxFiles,
            maxSize: this.rotateMaxSize,
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
              winston.format.printf((info) => {
                const { timestamp, level, message, stack } = info;
                return stack ? `${timestamp} [${level}] ${message}\n${stack}` : `${timestamp} [${level}] ${message}`;
              }),
            ),
          }),
        ],
      });
      this.fileLoggers.set(context, logger);
    }
    return logger;
  }

  private writeFile(level: 'info' | 'warn' | 'error' | 'debug' | 'verbose', message: unknown, context: string, stack?: string): void {
    const text = this.stringify(message);
    const fileLogger = this.getFileLogger(context);
    const payload: winston.LogEntry = { level, message: text };
    if (stack) payload.stack = stack;
    fileLogger.log(payload);
  }

  setLogLevels(levels: LogLevel[]): void {
    this.consoleLogger.setLogLevels(levels);
  }

  log(message: any, context?: string): void {
    const ctx = context ?? 'Application';
    this.consoleLogger.log(message, ctx);
    this.writeFile('info', message, ctx);
  }

  error(message: any, stack?: string, context?: string): void {
    const ctx = context ?? 'Application';
    if (stack) {
      this.consoleLogger.error(message, stack, ctx);
    } else {
      this.consoleLogger.error(message, ctx);
    }
    this.writeFile('error', message, ctx, stack);
  }

  warn(message: any, context?: string): void {
    const ctx = context ?? 'Application';
    this.consoleLogger.warn(message, ctx);
    this.writeFile('warn', message, ctx);
  }

  debug(message: any, context?: string): void {
    const ctx = context ?? 'Application';
    this.consoleLogger.debug?.(message, ctx);
    this.writeFile('debug', message, ctx);
  }

  verbose(message: any, context?: string): void {
    const ctx = context ?? 'Application';
    this.consoleLogger.verbose?.(message, ctx);
    this.writeFile('verbose', message, ctx);
  }

  fatal(message: any, context?: string): void {
    const ctx = context ?? 'Application';
    this.consoleLogger.fatal?.(message, ctx);
    this.writeFile('error', message, ctx);
  }
}
