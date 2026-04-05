<script setup lang="ts">
import { IconPicker, Page } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { computed, reactive, ref, watch } from 'vue';

import { SystemProShell } from '#/components/system-pro';
import { normalizeMenuIconToIconify } from '#/utils/menu-icon';

import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  Select,
  Table,
  TreeSelect,
} from 'antdv-next';

import { addMenu, delMenu, getMenu, listMenu, menuTreeSelect, updateMenu } from '#/api';

type MenuRow = {
  menuId: number;
  parentId: number;
  menuName: string;
  orderNum?: number;
  path?: string;
  component?: string;
  perms?: string;
  menuType?: string;
  status?: string;
  icon?: string;
  children?: MenuRow[];
};

function asMenuRow(x: any): MenuRow {
  return x as MenuRow;
}

const loading = ref(false);
/** 接口返回的扁平列表 */
const menuFlatList = ref<MenuRow[]>([]);

const query = reactive({
  menuName: '',
  status: undefined as undefined | '0' | '1',
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

const expandAll = ref(true);
/** 切换「全部展开/折叠」时强制重挂载表格，使 defaultExpandAllRows 生效 */
const tableRenderKey = ref(0);

watch(expandAll, () => {
  tableRenderKey.value += 1;
});

/** 与 RuoYi handleTree 一致：扁平列表 → children 嵌套（供 Table 树形展示） */
function handleMenuTree<T extends Record<string, any>>(
  data: T[],
  idKey: keyof T = 'menuId' as keyof T,
  parentKey: keyof T = 'parentId' as keyof T,
  childrenKey: keyof T = 'children' as keyof T,
): T[] {
  if (!data?.length) return [];
  const childrenListMap: Record<string, T[]> = {};
  const nodeIds: Record<string, T> = {};

  for (const d of data) {
    const pid = String(d[parentKey] as string | number);
    if (childrenListMap[pid] == null) childrenListMap[pid] = [];
    nodeIds[String(d[idKey] as string | number)] = d;
    childrenListMap[pid].push(d);
  }

  const tree: T[] = [];
  for (const d of data) {
    const pid = String(d[parentKey] as string | number);
    if (nodeIds[pid] == null) {
      tree.push(d);
    }
  }

  function adapt(o: T) {
    const id = String(o[idKey] as string | number);
    const list = childrenListMap[id];
    if (list != null && list.length > 0) {
      (o as any)[childrenKey] = list;
      for (const c of list) adapt(c);
    } else {
      delete (o as any)[childrenKey];
    }
  }
  for (const t of tree) adapt(t);
  return tree;
}

const menuTreeData = computed(() => handleMenuTree([...menuFlatList.value]));

// --- add/edit dialog ---
const dialogOpen = ref(false);
const dialogLoading = ref(false);
const menuOptions = ref<any[]>([]);
const menuTypeOptions = [
  { label: '目录', value: 'M' },
  { label: '菜单', value: 'C' },
  { label: '按钮', value: 'F' },
];
const statusOptions2 = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

const form = reactive<any>({
  menuId: undefined,
  parentId: 0,
  menuName: '',
  icon: '',
  menuType: 'M',
  orderNum: 0,
  isFrame: '1',
  path: '',
  component: '',
  perms: '',
  query: '',
  isCache: '0',
  visible: '0',
  status: '0',
});

async function loadMenuOptions() {
  const tree = await menuTreeSelect();
  // 后端返回 ListToTree 的树：{ id,label,children }
  menuOptions.value = [{ id: 0, label: '主类目', children: tree || [] }];
}

function resetForm() {
  Object.assign(form, {
    menuId: undefined,
    parentId: 0,
    menuName: '',
    icon: '',
    menuType: 'M',
    orderNum: 0,
    isFrame: '1',
    path: '',
    component: '',
    perms: '',
    query: '',
    isCache: '0',
    visible: '0',
    status: '0',
  });
}

async function openAdd(parent?: MenuRow) {
  resetForm();
  dialogOpen.value = true;
  dialogLoading.value = true;
  try {
    await loadMenuOptions();
    if (parent?.menuId) form.parentId = parent.menuId;
  } finally {
    dialogLoading.value = false;
  }
}

async function openEditFull(row: MenuRow) {
  dialogOpen.value = true;
  dialogLoading.value = true;
  try {
    await loadMenuOptions();
    const data = await getMenu(row.menuId);
    Object.assign(form, data || {});
  } finally {
    dialogLoading.value = false;
  }
}

async function submitForm() {
  const payload: any = { ...form };
  // 后端 DTO 要求 query/perms/status 等字段存在
  payload.query = payload.query ?? '';
  payload.perms = payload.perms ?? '';
  payload.status = payload.status ?? '0';
  payload.visible = payload.visible ?? '0';
  payload.isCache = payload.isCache ?? '0';
  payload.isFrame = payload.isFrame ?? '1';
  payload.menuType = payload.menuType ?? 'M';
  payload.orderNum = Number(payload.orderNum ?? 0);
  payload.parentId = Number(payload.parentId ?? 0);

  dialogLoading.value = true;
  try {
    if (payload.menuId) await updateMenu(payload);
    else await addMenu(payload);
    message.success('保存成功');
    dialogOpen.value = false;
    await fetchList();
  } finally {
    dialogLoading.value = false;
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listMenu({
      menuName: query.menuName || undefined,
      status: query.status,
    });
    menuFlatList.value = Array.isArray(data) ? ((data ?? []) as MenuRow[]) : [];
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.menuName = '';
  query.status = undefined;
  fetchList();
}

function doSearch() {
  fetchList();
}

async function onDelete(row: MenuRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除菜单「${row.menuName}」？`,
    async onOk() {
      await delMenu(row.menuId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

// 先留一个极简“快速编辑名称/状态”的弹窗
const editOpen = ref(false);
const editForm = reactive<{ menuId?: number; menuName: string; status: '0' | '1' }>(
  {
    menuId: undefined,
    menuName: '',
    status: '0',
  },
);

// quick edit removed (full form covers it)

async function submitEdit() {
  if (!editForm.menuId) return;
  await updateMenu({
    menuId: editForm.menuId,
    menuName: editForm.menuName,
    status: editForm.status,
  });
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const colModalOpen = ref(false);
const colVisibility = reactive({
  menuName: true,
  icon: true,
  orderNum: true,
  perms: true,
  path: true,
  component: true,
  status: true,
  createTime: true,
  action: true,
});

const allColumns = computed(() => [
  { title: '菜单名称', dataIndex: 'menuName', width: 220, ellipsis: true },
  { title: '图标', dataIndex: 'icon', width: 72, align: 'center' as const },
  { title: '排序', dataIndex: 'orderNum', width: 72 },
  { title: '权限标识', dataIndex: 'perms', width: 200, ellipsis: true },
  { title: '路由地址', dataIndex: 'path', width: 160, ellipsis: true },
  { title: '组件路径', dataIndex: 'component', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 88 },
  { title: '创建时间', dataIndex: 'createTime', width: 172, ellipsis: true },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
]);

const columns = computed(() =>
  allColumns.value.filter((c: any) => {
    const k = c.key || c.dataIndex;
    return colVisibility[k as keyof typeof colVisibility] !== false;
  }),
);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="菜单列表"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
      @column-setting="colModalOpen = true"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="menuName" label="菜单名称" class="!mb-0">
              <Input v-model:value="query.menuName" allow-clear placeholder="请输入菜单名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="菜单状态" class="w-full" :options="statusOptions" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd()">
          <Plus class="mr-1 inline size-4" />
          新增
        </Button>
        <Button @click="expandAll = !expandAll">{{ expandAll ? '折叠' : '展开' }}</Button>
      </template>

      <Table
        :key="tableRenderKey"
        row-key="menuId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="menuTreeData"
        size="middle"
        :pagination="false"
        :default-expand-all-rows="expandAll"
        :scroll="{ x: 1320 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'icon'">
            <div v-if="asMenuRow(record).icon" class="flex items-center gap-2">
              <IconifyIcon
                :icon="normalizeMenuIconToIconify(asMenuRow(record).icon)"
                class="size-4 shrink-0 text-foreground"
              />
              <span
                class="inline-block max-w-[6rem] truncate font-mono text-xs text-foreground/70"
                :title="asMenuRow(record).icon || ''"
              >
                {{ asMenuRow(record).icon }}
              </span>
            </div>
            <span v-else class="text-muted-foreground">—</span>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span
              v-if="asMenuRow(record).status === '0' || asMenuRow(record).status == null"
              class="text-primary"
            >正常</span>
            <span v-else class="text-destructive">停用</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEditFull(asMenuRow(record))">修改</Button>
              <Button type="link" size="small" class="!px-1" @click="openAdd(asMenuRow(record))">新增</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asMenuRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="colModalOpen" title="列设置" @ok="colModalOpen = false">
      <div class="flex flex-col gap-2">
        <Checkbox v-model:checked="colVisibility.menuName">菜单名称</Checkbox>
        <Checkbox v-model:checked="colVisibility.icon">图标</Checkbox>
        <Checkbox v-model:checked="colVisibility.orderNum">排序</Checkbox>
        <Checkbox v-model:checked="colVisibility.perms">权限标识</Checkbox>
        <Checkbox v-model:checked="colVisibility.path">路由地址</Checkbox>
        <Checkbox v-model:checked="colVisibility.component">组件路径</Checkbox>
        <Checkbox v-model:checked="colVisibility.status">状态</Checkbox>
        <Checkbox v-model:checked="colVisibility.createTime">创建时间</Checkbox>
      </div>
    </Modal>

    <Modal v-model:open="editOpen" title="编辑菜单（简化版）" @ok="submitEdit">
      <Form layout="vertical">
        <FormItem label="菜单名称">
          <Input v-model:value="editForm.menuName" placeholder="请输入菜单名称" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="editForm.status" :options="statusOptions" />
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model:open="dialogOpen"
      :title="form.menuId ? '修改菜单' : '新增菜单'"
      width="860px"
      :confirm-loading="dialogLoading"
      @ok="submitForm"
    >
      <Form layout="vertical">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormItem label="上级菜单">
            <TreeSelect
              v-model:value="form.parentId"
              :tree-data="menuOptions"
              :field-names="{ value: 'id', label: 'label', children: 'children' }"
              tree-default-expand-all
              allow-clear
              placeholder="选择上级菜单"
            />
          </FormItem>

          <FormItem label="菜单类型">
            <RadioGroup v-model:value="form.menuType" :options="menuTypeOptions" option-type="button" />
          </FormItem>

          <FormItem label="菜单名称">
            <Input v-model:value="form.menuName" placeholder="请输入菜单名称" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'F'" label="菜单图标">
            <div class="flex flex-col gap-2">
              <IconPicker v-model="form.icon" prefix="lucide" class="w-full max-w-md" />
              <span class="text-xs text-foreground/60">
                与侧栏一致使用 Iconify（默认 lucide）。可直接输入如
                <code class="rounded bg-muted px-1">ant-design:user-outlined</code>
                ；若依旧短名（如 user）保存后也会自动映射。
              </span>
            </div>
          </FormItem>

          <FormItem label="显示排序">
            <InputNumber v-model:value="(form.orderNum as any)" :min="0" style="width: 100%" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'F'" label="是否外链">
            <RadioGroup v-model:value="form.isFrame" :options="[{ label: '是', value: '0' }, { label: '否', value: '1' }]" option-type="button" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'F'" label="路由地址">
            <Input v-model:value="form.path" placeholder="如：user 或 http(s)://xxx" />
          </FormItem>

          <FormItem v-if="form.menuType === 'C'" label="组件路径">
            <Input v-model:value="form.component" placeholder="如：system/user/index（views 下）" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'M'" label="权限字符">
            <Input v-model:value="form.perms" placeholder="如：system:user:list" />
          </FormItem>

          <FormItem v-if="form.menuType === 'C'" label="路由参数">
            <Input v-model:value="form.query" placeholder='如：{"id":1}' />
          </FormItem>

          <FormItem v-if="form.menuType === 'C'" label="是否缓存">
            <RadioGroup v-model:value="form.isCache" :options="[{ label: '缓存', value: '0' }, { label: '不缓存', value: '1' }]" option-type="button" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'F'" label="显示状态">
            <RadioGroup v-model:value="form.visible" :options="[{ label: '显示', value: '0' }, { label: '隐藏', value: '1' }]" option-type="button" />
          </FormItem>

          <FormItem v-if="form.menuType !== 'F'" label="菜单状态">
            <RadioGroup v-model:value="form.status" :options="statusOptions2" option-type="button" />
          </FormItem>
        </div>
      </Form>
    </Modal>
  </Page>
</template>

