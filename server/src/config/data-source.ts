import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// 读取配置文件
const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV || 'development';
const configFile = configFileNameObj[env] || 'dev';
const config = yaml.load(readFileSync(join(__dirname, `./${configFile}.yml`), 'utf8')) as Record<string, any>;
const dbConfig = config?.db?.mysql || {};

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: dbConfig.host || '127.0.0.1',
  port: dbConfig.port || 3306,
  username: dbConfig.username || 'yifeng-ruoyi',
  password: dbConfig.password || '8BRbCTcpe5M2dSAe',
  database: dbConfig.database || 'yifeng-ruoyi',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
  timezone: '+08:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
