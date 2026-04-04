<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';

import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
} from 'antdv-next';

import { getCaptchaImage } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  code: '',
  rememberMe: false,
});

const uuid = ref('');
const captchaEnabled = ref(true);
/** 后端返回 SVG 标签时用 v-html 渲染 */
const captchaSvgHtml = ref('');
/** Base64 / data URL / 远程图时用 img */
const captchaImgSrc = ref('');
const captchaLoading = ref(false);

function applyCaptchaImg(raw: string) {
  const s = raw.trim();
  captchaSvgHtml.value = '';
  captchaImgSrc.value = '';
  if (!s) return;
  if (s.startsWith('<')) {
    captchaSvgHtml.value = s;
    return;
  }
  if (s.startsWith('data:')) {
    captchaImgSrc.value = s;
    return;
  }
  if (/^https?:\/\//i.test(s)) {
    captchaImgSrc.value = s;
    return;
  }
  captchaImgSrc.value = `data:image/gif;base64,${s}`;
}

async function refreshCaptcha() {
  captchaLoading.value = true;
  try {
    const data = await getCaptchaImage();
    captchaEnabled.value = data?.captchaEnabled !== false;
    uuid.value = data?.uuid || '';
    if (data?.img) {
      applyCaptchaImg(data.img);
    }
  } catch {
    message.error('验证码加载失败');
  } finally {
    captchaLoading.value = false;
  }
}

onMounted(() => {
  void refreshCaptcha();
});

async function handleSubmit() {
  if (!form.username?.trim() || !form.password) {
    message.warning('请输入账号和密码');
    return;
  }
  if (captchaEnabled.value && !form.code?.trim()) {
    message.warning('请输入验证码');
    return;
  }

  try {
    await authStore.authLogin(
      {
        username: form.username.trim(),
        password: form.password,
        code: form.code,
        uuid: uuid.value,
      },
      async () => {
        const redirect = route.query?.redirect as string | undefined;
        const path = redirect
          ? decodeURIComponent(redirect)
          : preferences.app.defaultHomePath;
        await router.push(path);
      },
    );
  } catch {
    await refreshCaptcha();
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ preferences.app.name }}
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">若依后端登录（账号密码 + 验证码）</p>
    </div>

    <Form layout="vertical" class="space-y-1" :model="form" @finish="handleSubmit">
      <FormItem
        label="账号"
        name="username"
        :rules="[{ required: true, message: '请输入账号', whitespace: true }]"
      >
        <Input
          v-model:value="form.username"
          size="large"
          autocomplete="username"
          placeholder="用户名"
          @press-enter="handleSubmit"
        />
      </FormItem>
      <FormItem label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
        <InputPassword
          v-model:value="form.password"
          size="large"
          autocomplete="current-password"
          placeholder="密码"
          @press-enter="handleSubmit"
        />
      </FormItem>
      <!-- 验证码与按钮并排时，必须用 no-style 子项只包住 Input，否则校验无法关联控件、@finish 永不触发 -->
      <FormItem v-if="captchaEnabled" label="验证码">
        <div class="flex gap-3">
          <FormItem
            name="code"
            no-style
            class="!mb-0 min-w-0 flex-1"
            :rules="[{ required: true, message: '请输入验证码', whitespace: true }]"
          >
            <Input
              v-model:value="form.code"
              size="large"
              :maxlength="6"
              placeholder="验证码"
              @press-enter="handleSubmit"
            />
          </FormItem>
          <button
            class="flex h-10 min-w-[120px] shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted/30 px-1"
            type="button"
            :disabled="captchaLoading"
            @click="refreshCaptcha"
          >
            <div
              v-if="captchaSvgHtml"
              class="flex max-h-9 w-full items-center justify-center [&_svg]:max-h-9 [&_svg]:max-w-full [&_svg]:shrink-0"
              v-html="captchaSvgHtml"
            />
            <img
              v-else-if="captchaImgSrc"
              :src="captchaImgSrc"
              alt="验证码"
              class="max-h-9 w-auto max-w-full object-contain"
            />
            <span v-else class="text-xs text-muted-foreground">点击刷新</span>
          </button>
        </div>
      </FormItem>
      <FormItem>
        <Checkbox v-model:checked="form.rememberMe">记住密码（仅前端，若依原版为 Cookie）</Checkbox>
      </FormItem>
      <FormItem>
        <Button
          block
          html-type="submit"
          size="large"
          type="primary"
          :loading="authStore.loginLoading"
        >
          登录
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
