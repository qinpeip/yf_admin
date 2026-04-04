<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Button,
  Card,
  Checkbox,
  Form,
  FormItem,
  Input,
  message,
  Radio,
  RadioGroup,
  Select,
  Table,
  TabPane,
  Tabs,
  TreeSelect,
} from 'antdv-next';

import { getGenTable, updateGenTable } from '#/api';
import { optionselectDictType } from '#/api/system/dict';
import { menuTreeSelect } from '#/api/system/menu';

defineOptions({ name: 'MigratedToolGenEdit' });

const route = useRoute();
const router = useRouter();

const activeTab = ref('basic');
const loading = ref(false);
const submitting = ref(false);
const info = reactive<Record<string, any>>({});
const columns = ref<any[]>([]);
const tables = ref<any[]>([]);
const dictOptions = ref<{ dictName: string; dictType: string }[]>([]);
const menuTree = ref<any[]>([]);

const javaTypeOptions = [
  { label: 'Number', value: 'Number' },
  { label: 'String', value: 'String' },
  { label: 'BigInt', value: 'BigInt' },
  { label: 'Date', value: 'Date' },
  { label: 'Boolean', value: 'Boolean' },
];

const queryTypeOptions = [
  { label: '=', value: 'EQ' },
  { label: '!=', value: 'NE' },
  { label: '>', value: 'GT' },
  { label: '>=', value: 'GTE' },
  { label: '<', value: 'LT' },
  { label: '<=', value: 'LTE' },
  { label: 'LIKE', value: 'LIKE' },
  { label: 'BETWEEN', value: 'BETWEEN' },
];

const htmlTypeOptions = [
  { label: '文本框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期控件', value: 'datetime' },
  { label: '图片上传', value: 'imageUpload' },
  { label: '文件上传', value: 'fileUpload' },
  { label: '富文本', value: 'editor' },
];

const colTableCols = [
  { title: '列名', dataIndex: 'columnName', width: 120 },
  { title: '描述', dataIndex: 'columnComment', width: 140 },
  { title: 'Java类型', key: 'javaType', width: 120 },
  { title: 'Java属性', key: 'javaField', width: 120 },
  { title: '插入', key: 'isInsert', width: 70 },
  { title: '编辑', key: 'isEdit', width: 70 },
  { title: '列表', key: 'isList', width: 70 },
  { title: '查询', key: 'isQuery', width: 70 },
  { title: '查询方式', key: 'queryType', width: 110 },
  { title: '必填', key: 'isRequired', width: 70 },
  { title: '显示类型', key: 'htmlType', width: 120 },
  { title: '字典', key: 'dictType', width: 140 },
];

async function load() {
  const tableId = Number(route.params.tableId);
  if (!tableId) {
    message.error('无效的表编号');
    return;
  }
  loading.value = true;
  try {
    const raw = await getGenTable(tableId);
    const pack = (raw as any)?.data ?? raw;
    const inf = pack?.info ?? pack;
    Object.keys(info).forEach((k) => delete (info as any)[k]);
    Object.assign(info, inf);
    columns.value = (inf?.columns ?? []) as any[];
    tables.value = (pack?.tables ?? []) as any[];

    const dictRaw = await optionselectDictType();
    dictOptions.value = Array.isArray(dictRaw) ? dictRaw : [];

    const menuRaw = await menuTreeSelect();
    menuTree.value = Array.isArray(menuRaw) ? menuRaw : [];
  } catch {
    message.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function mapMenuNodes(nodes: any[]): any[] {
  return (nodes ?? []).map((n) => {
    const id = n.id ?? n.menuId;
    return {
      title: n.label ?? n.menuName ?? String(id),
      value: id,
      key: String(id),
      children: n.children ? mapMenuNodes(n.children) : undefined,
    };
  });
}

async function submit() {
  if (!info.tableName || !info.className) {
    message.warning('请填写表名称与实体类名');
    return;
  }
  submitting.value = true;
  try {
    const payload = { ...info, columns: columns.value, tables: tables.value };
    await updateGenTable(payload);
    message.success('保存成功');
    router.push('/tool/gen');
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/tool/gen');
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <Card :loading="loading">
      <Tabs v-model:active-key="activeTab">
        <TabPane key="basic" tab="基本信息">
          <Form layout="vertical" class="max-w-4xl">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem label="表名称" required>
                <Input v-model:value="info.tableName" />
              </FormItem>
              <FormItem label="表描述" required>
                <Input v-model:value="info.tableComment" />
              </FormItem>
              <FormItem label="实体类名称" required>
                <Input v-model:value="info.className" />
              </FormItem>
              <FormItem label="作者" required>
                <Input v-model:value="info.functionAuthor" />
              </FormItem>
            </div>
            <FormItem label="备注">
              <Input v-model:value="info.remark" type="textarea" :rows="3" />
            </FormItem>
          </Form>
        </TabPane>
        <TabPane key="columnInfo" tab="字段信息">
          <Table
            row-key="columnId"
            size="small"
            :scroll="{ x: 1600 }"
            :pagination="false"
            :data-source="columns"
            :columns="colTableCols"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'columnComment'">
                <Input v-model:value="record.columnComment" size="small" />
              </template>
              <template v-else-if="column.key === 'javaType'">
                <Select v-model:value="record.javaType" size="small" class="w-full" :options="javaTypeOptions" />
              </template>
              <template v-else-if="column.key === 'javaField'">
                <Input v-model:value="record.javaField" size="small" />
              </template>
              <template v-else-if="column.key === 'isInsert'">
                <Checkbox
                  :checked="record.isInsert === '1'"
                  @change="(e: any) => (record.isInsert = e.target.checked ? '1' : '0')"
                />
              </template>
              <template v-else-if="column.key === 'isEdit'">
                <Checkbox
                  :checked="record.isEdit === '1'"
                  @change="(e: any) => (record.isEdit = e.target.checked ? '1' : '0')"
                />
              </template>
              <template v-else-if="column.key === 'isList'">
                <Checkbox
                  :checked="record.isList === '1'"
                  @change="(e: any) => (record.isList = e.target.checked ? '1' : '0')"
                />
              </template>
              <template v-else-if="column.key === 'isQuery'">
                <Checkbox
                  :checked="record.isQuery === '1'"
                  @change="(e: any) => (record.isQuery = e.target.checked ? '1' : '0')"
                />
              </template>
              <template v-else-if="column.key === 'queryType'">
                <Select v-model:value="record.queryType" size="small" class="w-full" :options="queryTypeOptions" />
              </template>
              <template v-else-if="column.key === 'isRequired'">
                <Checkbox
                  :checked="record.isRequired === '1'"
                  @change="(e: any) => (record.isRequired = e.target.checked ? '1' : '0')"
                />
              </template>
              <template v-else-if="column.key === 'htmlType'">
                <Select v-model:value="record.htmlType" size="small" class="w-full" :options="htmlTypeOptions" />
              </template>
              <template v-else-if="column.key === 'dictType'">
                <Select
                  v-model:value="record.dictType"
                  size="small"
                  allow-clear
                  show-search
                  class="w-full min-w-[120px]"
                  :options="dictOptions.map((d) => ({ label: `${d.dictName} (${d.dictType})`, value: d.dictType }))"
                />
              </template>
            </template>
          </Table>
        </TabPane>
        <TabPane key="genInfo" tab="生成信息">
          <Form layout="vertical" class="max-w-4xl">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem label="生成模板">
                <Select
                  v-model:value="info.tplCategory"
                  :options="[
                    { label: '单表（增删改查）', value: 'crud' },
                    { label: '树表（增删改查）', value: 'tree' },
                    { label: '主子表（增删改查）', value: 'sub' },
                  ]"
                />
              </FormItem>
              <FormItem label="前端类型">
                <Select
                  v-model:value="info.tplWebType"
                  :options="[
                    { label: 'Vue3 Element Plus', value: 'element-plus' },
                    { label: 'Vue2 Element UI', value: 'element-ui' },
                  ]"
                />
              </FormItem>
              <FormItem label="生成包路径" required>
                <Input v-model:value="info.packageName" />
              </FormItem>
              <FormItem label="生成模块名" required>
                <Input v-model:value="info.moduleName" />
              </FormItem>
              <FormItem label="生成业务名" required>
                <Input v-model:value="info.businessName" />
              </FormItem>
              <FormItem label="生成功能名" required>
                <Input v-model:value="info.functionName" />
              </FormItem>
              <FormItem label="生成方式">
                <RadioGroup v-model:value="info.genType">
                  <Radio value="0">zip压缩包</Radio>
                  <Radio value="1">自定义路径</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="上级菜单">
                <TreeSelect
                  v-model:value="info.parentMenuId"
                  allow-clear
                  show-search
                  tree-default-expand-all
                  class="w-full"
                  :tree-data="mapMenuNodes(menuTree)"
                  placeholder="请选择"
                />
              </FormItem>
            </div>
            <FormItem v-if="info.genType === '1'" label="自定义路径">
              <Input v-model:value="info.genPath" placeholder="磁盘绝对路径" />
            </FormItem>
            <template v-if="info.tplCategory === 'tree'">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormItem label="树编码字段">
                  <Select
                    v-model:value="info.treeCode"
                    allow-clear
                    :options="columns.map((c) => ({ label: `${c.columnName}：${c.columnComment}`, value: c.columnName }))"
                  />
                </FormItem>
                <FormItem label="树父编码字段">
                  <Select
                    v-model:value="info.treeParentCode"
                    allow-clear
                    :options="columns.map((c) => ({ label: `${c.columnName}：${c.columnComment}`, value: c.columnName }))"
                  />
                </FormItem>
                <FormItem label="树名称字段">
                  <Select
                    v-model:value="info.treeName"
                    allow-clear
                    :options="columns.map((c) => ({ label: `${c.columnName}：${c.columnComment}`, value: c.columnName }))"
                  />
                </FormItem>
              </div>
            </template>
          </Form>
        </TabPane>
      </Tabs>
      <div class="mt-6 flex justify-center gap-3">
        <Button type="primary" :loading="submitting" @click="submit">提交</Button>
        <Button @click="goBack">返回</Button>
      </div>
    </Card>
  </Page>
</template>
