import { GenConstants } from 'src/common/constant/gen.constant';

function labelComment(column: { columnComment?: string }): string {
  const c = column.columnComment || '';
  const i = c.indexOf('（');
  return i !== -1 ? c.substring(0, i) : c;
}

function uniqueDictTypes(columns: any[]): string[] {
  const s = new Set<string>();
  for (const c of columns) {
    if (c.dictType) s.add(c.dictType);
  }
  return [...s];
}

/** 查询区表单项 */
function buildSearchFormItems(columns: any[]): string {
  let html = '';
  for (const item of columns) {
    if (item.isQuery !== '1') continue;
    const lab = labelComment(item);
    const f = item.javaField;
    if (item.htmlType === 'input') {
      html += `
            <FormItem name="${f}" label="${lab}" class="!mb-0">
              <Input v-model:value="query.${f}" allow-clear placeholder="请输入${lab}" @press-enter="doSearch" />
            </FormItem>`;
    } else if (item.htmlType === 'select' || item.htmlType === 'radio') {
      if (item.dictType) {
        html += `
            <FormItem name="${f}" label="${lab}" class="!mb-0">
              <Select
                v-model:value="query.${f}"
                allow-clear
                placeholder="请选择${lab}"
                class="w-full"
                :options="${item.dictType}"
                :field-names="{ label: 'label', value: 'value' }"
              />
            </FormItem>`;
      } else {
        html += `
            <FormItem name="${f}" label="${lab}" class="!mb-0">
              <Select v-model:value="query.${f}" allow-clear placeholder="请配置字典 ${lab}" class="w-full" :options="[]" />
            </FormItem>`;
      }
    } else if (item.htmlType === 'datetime' && item.queryType === GenConstants.QUERY_BETWEEN) {
      html += `
            <FormItem name="${f}" label="${lab}" class="!mb-0">
              <DatePicker.RangePicker v-model:value="query.${f}" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>`;
    } else if (item.htmlType === 'datetime') {
      html += `
            <FormItem name="${f}" label="${lab}" class="!mb-0">
              <Input v-model:value="query.${f}" allow-clear placeholder="请输入${lab}" @press-enter="doSearch" />
            </FormItem>`;
    }
  }
  return html;
}

/** 列表列定义（computed 内数组片段） */
function buildColumnsArrayItems(columns: any[], _primaryKey: string): string {
  const parts: string[] = [];
  for (const item of columns) {
    if (item.isList !== '1' && item.isPk !== '1') continue;
    const lab = labelComment(item);
    const f = item.javaField;
    const w = item.isPk === '1' ? ', width: 90' : '';
    parts.push(`  { title: '${lab}', dataIndex: '${f}'${w} },`);
  }
  parts.push(`  { title: '操作', key: 'action', width: 200 },`);
  return parts.join('\n');
}

/** 编辑弹窗表单项 */
function buildEditFormItems(columns: any[]): string {
  let html = '';
  for (const item of columns) {
    if (item.isEdit !== '1' || item.isPk === '1') continue;
    const lab = labelComment(item);
    const f = item.javaField;
    const htmlType = item.htmlType;
    if (htmlType === 'textarea') {
      html += `
        <FormItem label="${lab}">
          <TextArea v-model:value="(editForm as any).${f}" :rows="3" placeholder="请输入${lab}" />
        </FormItem>`;
    } else if (htmlType === 'input' || htmlType === 'imageUpload' || htmlType === 'fileUpload' || htmlType === 'editor') {
      const ph =
        htmlType === 'imageUpload'
          ? '图片地址'
          : htmlType === 'fileUpload'
            ? '文件地址'
            : htmlType === 'editor'
              ? '内容（可改为富文本）'
              : `请输入${lab}`;
      html += `
        <FormItem label="${lab}">
          <Input v-model:value="(editForm as any).${f}" placeholder="${ph}" />
        </FormItem>`;
    } else if (htmlType === 'select' || htmlType === 'radio') {
      if (item.dictType) {
        html += `
        <FormItem label="${lab}">
          <Select
            v-model:value="(editForm as any).${f}"
            allow-clear
            placeholder="请选择${lab}"
            class="w-full"
            :options="${item.dictType}"
            :field-names="{ label: 'label', value: 'value' }"
          />
        </FormItem>`;
      } else {
        html += `
        <FormItem label="${lab}">
          <Input v-model:value="(editForm as any).${f}" placeholder="请配置字典" />
        </FormItem>`;
      }
    } else if (htmlType === 'checkbox') {
      html += `
        <FormItem label="${lab}">
          <Input v-model:value="(editForm as any).${f}" placeholder="多选可存逗号分隔字符串" />
        </FormItem>`;
    } else if (htmlType === 'datetime') {
      html += `
        <FormItem label="${lab}">
          <Input v-model:value="(editForm as any).${f}" placeholder="YYYY-MM-DD 或带时间" />
        </FormItem>`;
    } else if (item.javaType === 'Number' || item.javaType === 'Integer' || item.javaType === 'Long') {
      html += `
        <FormItem label="${lab}">
          <InputNumber v-model:value="(editForm as any).${f}" class="w-full" placeholder="${lab}" />
        </FormItem>`;
    } else {
      html += `
        <FormItem label="${lab}">
          <Input v-model:value="(editForm as any).${f}" placeholder="请输入${lab}" />
        </FormItem>`;
    }
  }
  return html;
}

/** query 初始字段（reactive） */
function buildQueryReactiveFields(columns: any[]): string {
  const lines = ['  pageNum: 1,', '  pageSize: 10,'];
  for (const item of columns) {
    if (item.isQuery !== '1') continue;
    const f = item.javaField;
    if (item.htmlType === 'datetime' && item.queryType === GenConstants.QUERY_BETWEEN) {
      lines.push(`  ${f}: undefined as [string, string] | undefined,`);
    } else if (item.javaType === 'Number' || item.javaType === 'Integer' || item.javaType === 'Long') {
      lines.push(`  ${f}: undefined as number | undefined,`);
    } else {
      lines.push(`  ${f}: '',`);
    }
  }
  return lines.join('\n');
}

/** list 请求参数展开 */
function buildListParamsSpread(columns: any[]): string {
  const queryFields = columns.filter((c) => c.isQuery === '1');
  const lines: string[] = [];
  for (const c of queryFields) {
    const f = c.javaField;
    if (c.htmlType === 'datetime' && c.queryType === GenConstants.QUERY_BETWEEN) {
      lines.push(
        `    ...(query.${f}?.[0] && query.${f}?.[1] ? { ${f}: query.${f} } : {}),`,
      );
    } else if (c.javaType === 'Number' || c.javaType === 'Integer' || c.javaType === 'Long') {
      lines.push(`    ${f}: query.${f},`);
    } else {
      lines.push(`    ${f}: query.${f} || undefined,`);
    }
  }
  return lines.join('\n');
}

/** resetQuery 赋值 */
function buildResetQueryAssignments(columns: any[]): string {
  const lines = [
    '  query.pageNum = 1;',
    '  query.pageSize = 10;',
  ];
  for (const c of columns) {
    if (c.isQuery !== '1') continue;
    const f = c.javaField;
    if (c.htmlType === 'datetime' && c.queryType === GenConstants.QUERY_BETWEEN) {
      lines.push(`  query.${f} = undefined;`);
    } else if (c.javaType === 'Number' || c.javaType === 'Integer' || c.javaType === 'Long') {
      lines.push(`  query.${f} = undefined;`);
    } else {
      lines.push(`  query.${f} = '';`);
    }
  }
  return lines.join('\n');
}

/** bodyCell 分支 */
function buildBodyCellBranches(columns: any[]): string {
  let branches = '';
  for (const item of columns) {
    if (item.isList !== '1' && item.isPk !== '1') continue;
    const f = item.javaField;
    if (item.htmlType === 'datetime') {
      branches += `
          <template v-else-if="column.dataIndex === '${f}'">
            <span>{{ asRow(record).${f} ?? '—' }}</span>
          </template>`;
    } else if (item.dictType) {
      branches += `
          <template v-else-if="column.dataIndex === '${f}'">
            <Tag>{{ optLabel(${item.dictType}, asRow(record).${f}) }}</Tag>
          </template>`;
    } else if (item.htmlType === 'imageUpload') {
      branches += `
          <template v-else-if="column.dataIndex === '${f}'">
            <a v-if="asRow(record).${f}" :href="String(asRow(record).${f})" target="_blank" rel="noreferrer">查看</a>
            <span v-else>—</span>
          </template>`;
    }
  }
  return branches;
}

export function indexVbenVue(options: any): string {
  const { BusinessName, businessName, moduleName, functionName, primaryKey, columns } = options;
  const dictTypes = uniqueDictTypes(columns);
  const queryCols = columns.filter((c: any) => c.isQuery === '1');
  const hasDatePicker = queryCols.some(
    (c: any) => c.htmlType === 'datetime' && c.queryType === GenConstants.QUERY_BETWEEN,
  );
  const hasInputNumber = columns.some(
    (c: any) =>
      c.isEdit === '1' &&
      (c.javaType === 'Number' || c.javaType === 'Integer' || c.javaType === 'Long') &&
      c.htmlType !== 'datetime',
  );

  const dictImport = dictTypes.length
    ? `\nimport { useDict } from '#/composables/use-dict';\nimport type { DictOption } from '#/composables/use-dict';`
    : '';

  const dictSetup = dictTypes.length
    ? `const { ${dictTypes.join(', ')} } = useDict(${dictTypes.map((t) => `'${t}'`).join(', ')});\n\nfunction optLabel(options: DictOption[] | undefined, val: unknown) {\n  const v = String(val ?? '');\n  const label = (options ?? []).find((o) => o.value === v)?.label;\n  return label ?? (v === '' ? '—' : v);\n}\n\n`
    : '';

  const antImports = [
    'Button',
    'Form',
    'FormItem',
    'Input',
    'message',
    'Modal',
    'Select',
    'Table',
    'Tag',
    'TextArea',
  ];
  if (hasDatePicker) antImports.push('DatePicker');
  if (hasInputNumber) antImports.push('InputNumber');
  antImports.sort();

  return `<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { computed, reactive, ref } from 'vue';
${dictImport}

import { SystemProShell } from '#/components/system-pro';

import { ${antImports.join(', ')} } from 'antdv-next';

import {
  add${BusinessName},
  del${BusinessName},
  get${BusinessName},
  list${BusinessName},
  update${BusinessName},
  type ${BusinessName}Row,
} from '#/api/${moduleName}/${businessName}';

/** ${functionName} */
type Row = ${BusinessName}Row;

function asRow(x: unknown): Row {
  return x as Row;
}

${dictSetup}const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);

const query = reactive({
${buildQueryReactiveFields(columns)}
});

const selectedRowKeys = ref<(string | number)[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys;
  },
}));

async function fetchList() {
  loading.value = true;
  try {
    const data = await list${BusinessName}({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
${buildListParamsSpread(columns)}
    });
    rows.value = (data?.list ?? []) as Row[];
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
${buildResetQueryAssignments(columns)}
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onBatchDelete() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的数据');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: \`是否确认删除选中的 \${selectedRowKeys.value.length} 条记录？\`,
    async onOk() {
      await del${BusinessName}(selectedRowKeys.value as any);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function onDelete(row: Row) {
  Modal.confirm({
    title: '确认删除',
    content: '是否确认删除该条记录？',
    async onOk() {
      await del${BusinessName}(row.${primaryKey} as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<Partial<Row>>({});

function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
${columns
  .filter((c: any) => c.isInsert === '1' && c.isPk === '0')
  .map((c: any) => {
    const def =
      c.javaType === 'Number' || c.javaType === 'Integer' || c.javaType === 'Long'
        ? 'undefined'
        : "''";
    return `  (editForm as any).${c.javaField} = ${def};`;
  })
  .join('\n')}
  editOpen.value = true;
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await get${BusinessName}(row.${primaryKey} as any);
  Object.assign(editForm, detail as object);
  editOpen.value = true;
}

async function submitEdit() {
  if (editForm.${primaryKey}) {
    await update${BusinessName}(editForm as any);
  } else {
    await add${BusinessName}(editForm as any);
  }
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
${buildColumnsArrayItems(columns, primaryKey)}
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="${functionName}"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
${buildSearchFormItems(columns)}
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增
        </Button>
        <Button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">删除</Button>
      </template>

      <Table
        row-key="${primaryKey}"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :pagination="{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => \`共 \${t} 条\`,
          onChange: (page, pageSize) => {
            query.pageNum = page;
            query.pageSize = pageSize;
            fetchList();
          },
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asRow(record))">删除</Button>
            </div>
          </template>
${buildBodyCellBranches(columns)}
        </template>
      </Table>
    </SystemProShell>

    <Modal
      v-model:open="editOpen"
      :title="editForm.${primaryKey} ? '修改${functionName}' : '新增${functionName}'"
      @ok="submitEdit"
    >
      <Form layout="vertical">
${buildEditFormItems(columns)}
      </Form>
    </Modal>
  </Page>
</template>
`;
}
