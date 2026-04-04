<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { useAuthStore } from '#/store';
import dayjs from 'dayjs';
import { computed, reactive, ref } from 'vue';

import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Radio,
  RadioGroup,
  Row,
  TabPane,
  Tabs,
  Upload,
} from 'antdv-next';

import {
  getUserProfile,
  updateProfilePwd,
  updateUserProfile,
  uploadProfileAvatar,
} from '#/api';
import { useDict } from '#/composables/use-dict';

defineOptions({ name: 'MigratedUserProfile' });

const { sys_user_sex } = useDict('sys_user_sex');
const sexRadios = computed(() => {
  const list = sys_user_sex?.value ?? [];
  return [...list].toSorted(
    (a, b) => (a.dictSort ?? 0) - (b.dictSort ?? 0),
  );
});

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const authStore = useAuthStore();

const activeTab = ref('userinfo');
const loading = ref(false);
const user = reactive<Record<string, any>>({});

const avatarSrc = computed(() => {
  const a = user.avatar as string | undefined;
  if (!a) return '';
  if (a.startsWith('http') || a.startsWith('//')) return a;
  const base = apiURL?.replace(/\/$/, '') ?? '';
  return `${base}${a.startsWith('/') ? '' : '/'}${a}`;
});

async function load() {
  loading.value = true;
  try {
    const data = await getUserProfile();
    Object.assign(user, data ?? {});
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (!user.nickName?.trim()) {
    message.warning('请填写昵称');
    return;
  }
  const allowed = new Set(sexRadios.value.map((o) => o.value));
  let sex = user.sex;
  if (allowed.size && (sex == null || sex === '' || !allowed.has(String(sex)))) {
    message.warning('请选择性别');
    return;
  }
  if (!allowed.size) {
    sex = user.sex ?? '0';
  }
  await updateUserProfile({
    nickName: user.nickName,
    email: user.email,
    phonenumber: user.phonenumber,
    sex: sex as string,
  });
  message.success('保存成功');
  await authStore.fetchUserInfo();
}

const pwd = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

async function savePwd() {
  if (!pwd.oldPassword || !pwd.newPassword) {
    message.warning('请填写完整');
    return;
  }
  if (pwd.newPassword !== pwd.confirmPassword) {
    message.warning('两次新密码不一致');
    return;
  }
  await updateProfilePwd(pwd.oldPassword, pwd.newPassword);
  message.success('密码已修改');
  pwd.oldPassword = '';
  pwd.newPassword = '';
  pwd.confirmPassword = '';
}

async function onAvatarUpload(options: any) {
  const file = options.file as File;
  const res = await uploadProfileAvatar(file);
  const imgUrl = (res as any)?.imgUrl ?? (res as any)?.data?.imgUrl;
  if (!imgUrl) {
    message.error('上传失败');
    return;
  }
  const allowed = new Set(sexRadios.value.map((o) => o.value));
  const sex =
    allowed.size && user.sex != null && allowed.has(String(user.sex))
      ? String(user.sex)
      : (sexRadios.value[0]?.value ?? '0');
  await updateUserProfile({
    nickName: user.nickName,
    email: user.email,
    phonenumber: user.phonenumber,
    sex,
    avatar: imgUrl,
  });
  user.avatar = imgUrl;
  message.success('头像已更新');
  await authStore.fetchUserInfo();
}

load();
</script>

<template>
  <Page auto-content-height>
    <Row :gutter="16">
      <Col :xs="24" :lg="6">
        <Card title="个人信息" :loading="loading">
          <div class="mb-4 flex justify-center">
            <Upload :show-upload-list="false" accept="image/*" :custom-request="onAvatarUpload">
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0">
                <Avatar :src="avatarSrc || undefined" :size="96">
                  {{ (user.nickName || user.userName || '?').slice(0, 1) }}
                </Avatar>
              </button>
            </Upload>
          </div>
          <div class="space-y-2 border border-border/60 p-3 text-sm">
            <div>用户账号：{{ user.userName }}</div>
            <div>手机号码：{{ user.phonenumber || '—' }}</div>
            <div>邮箱：{{ user.email || '—' }}</div>
            <div>部门：{{ user.dept?.deptName || '—' }}</div>
            <div>
              角色：{{
                Array.isArray(user.roles)
                  ? user.roles.map((r: any) => r.roleName || r).join('、') || '—'
                  : '—'
              }}
            </div>
            <div>
              创建日期：{{
                user.createTime ? dayjs(user.createTime).format('YYYY-MM-DD HH:mm:ss') : '—'
              }}
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :lg="18">
        <Card title="基本资料">
          <Tabs v-model:active-key="activeTab">
            <TabPane key="userinfo" tab="基本资料">
              <Form layout="vertical" class="max-w-xl">
                <FormItem label="用户昵称" required>
                  <Input v-model:value="user.nickName" :maxlength="30" />
                </FormItem>
                <FormItem label="手机号码" required>
                  <Input v-model:value="user.phonenumber" :maxlength="11" />
                </FormItem>
                <FormItem label="邮箱" required>
                  <Input v-model:value="user.email" :maxlength="50" />
                </FormItem>
                <FormItem label="性别">
                  <RadioGroup v-model:value="user.sex">
                    <Radio
                      v-for="o in sexRadios"
                      :key="o.value"
                      :value="o.value"
                    >
                      {{ o.label }}
                    </Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem>
                  <Button type="primary" @click="saveProfile">保存</Button>
                </FormItem>
              </Form>
            </TabPane>
            <TabPane key="resetPwd" tab="修改密码">
              <Form layout="vertical" class="max-w-xl">
                <FormItem label="旧密码">
                  <InputPassword v-model:value="pwd.oldPassword" />
                </FormItem>
                <FormItem label="新密码">
                  <InputPassword v-model:value="pwd.newPassword" />
                </FormItem>
                <FormItem label="确认密码">
                  <InputPassword v-model:value="pwd.confirmPassword" />
                </FormItem>
                <FormItem>
                  <Button type="primary" @click="savePwd">保存</Button>
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  </Page>
</template>
