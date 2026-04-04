/**
 * 生成 web-antdv-next（Vben + Ant Design Vue + requestClient）API 文件
 */
function javaToTs(javaType: string): string {
  switch (javaType) {
    case 'Number':
    case 'Integer':
    case 'Long':
    case 'Double':
    case 'BigDecimal':
      return 'number';
    default:
      return 'string';
  }
}

export function apiVbenTemplate(options: any): string {
  const { BusinessName, businessName, moduleName, functionName, primaryKey, columns } = options;

  const queryFields = (columns as any[]).filter((c) => c.isQuery === '1');

  const rowFields = (columns as any[]).map((c) => `  ${c.javaField}?: ${javaToTs(c.javaType)};`).join('\n');

  const queryIfaces = queryFields
    .map((c) => {
      const ts = javaToTs(c.javaType);
      if (c.htmlType === 'datetime' && c.queryType === 'BETWEEN') {
        return `  ${c.javaField}?: [string, string];`;
      }
      return `  ${c.javaField}?: ${ts};`;
    })
    .join('\n');

  const pkTs = javaToTs(
    (columns as any[]).find((c) => c.javaField === primaryKey)?.javaType || 'String',
  );

  return `/**
 * ${functionName} — 由代码生成器生成（Vben / web-antdv-next）
 * 合并步骤：将本文件放到 apps/web-antdv-next/src/api/${moduleName}/
 * 并在同目录 index.ts 中增加：export * from './${businessName}';
 */
import { requestClient } from '#/api/request';

export interface ${BusinessName}Row {
${rowFields}
}

export interface List${BusinessName}Query {
  pageNum?: number;
  pageSize?: number;
${queryIfaces ? `${queryIfaces}\n` : ''}}

export async function list${BusinessName}(query: List${BusinessName}Query) {
  return requestClient.get<{ list: ${BusinessName}Row[]; total: number }>(
    '/${moduleName}/${businessName}/list',
    { params: query },
  );
}

export async function get${BusinessName}(${primaryKey}: ${pkTs}) {
  return requestClient.get<${BusinessName}Row>(\`/${moduleName}/${businessName}/\${${primaryKey}}\`);
}

export async function add${BusinessName}(data: Partial<${BusinessName}Row>) {
  return requestClient.post(\`/${moduleName}/${businessName}/\`, data);
}

export async function update${BusinessName}(data: Partial<${BusinessName}Row> & { ${primaryKey}: ${pkTs} }) {
  return requestClient.put(\`/${moduleName}/${businessName}/\`, data);
}

export async function del${BusinessName}(pk: ${pkTs} | ${pkTs}[]) {
  const idStr = Array.isArray(pk) ? pk.join(',') : String(pk);
  return requestClient.delete(\`/${moduleName}/${businessName}/\${idStr}\`);
}
`;
}
