<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'antdv-next';

import { customRef, ref } from 'vue';

import { generateUUID } from '@vben/utils';

import { DeleteOutlined, EyeFilled, LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Space } from 'antdv-next';
import { Button, message, Modal, Upload } from 'antdv-next';

import { singleFileUpload } from '#/api/upload';

const props = withDefaults(
  defineProps<{
    path?: string;
    size?: string;
  }>(),
  {
    path: '',
    size: '102px',
  },
);

const modelValue = defineModel<string>({ required: true });
const fileList = customRef((track, trigger) => ({
  get() {
    track();
    if (modelValue.value) {
      return [
        {
          uid: generateUUID(),
          url: modelValue.value,
          status: 'done' as UploadFile['status'],
          name: modelValue.value.split('/').pop() || '',
        },
      ];
    }
    return [];
  },
  set() {
    trigger();
  },
}));

const isHover = ref(false);

const loading = ref(false);
const handleChange = (info: UploadChangeParam) => {
  switch (info.file.status) {
    case 'done': {
      loading.value = false;
      break;
    }
    case 'error': {
      loading.value = false;
      message.error('上传失败');
      break;
    }
    case 'uploading': {
      loading.value = true;
      break;
    }
    default: {
      loading.value = false;
    }
  }
};

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (error) => reject(error));
  });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    const raw = file.originFileObj as File | undefined;
    if (!raw) return;
    file.preview = (await getBase64(raw)) as string;
  }
  previewImage.value = file.url || file.preview || '';
  previewVisible.value = true;
  const url = file.url || '';
  previewTitle.value = file.name || url.slice(Math.max(0, url.lastIndexOf('/') + 1));
};

const handleBeforeUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    message.error('只能上传图片');
    return false;
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    message.error('图片大小不能超过5MB');
    return false;
  }
  return file;
};

const handleCustomRequest = ({ file }: any) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', props.path ?? '');
  singleFileUpload(formData)
    .then((res) => {
      modelValue.value = res.url;
      loading.value = false;
    })
    .catch((error) => {
      console.error('error', error);
      message.error(error.msg || '上传失败');
      loading.value = false;
    });
};

const handleDelete = () => {
  modelValue.value = '';
};
const handlePreviewImage = () => {
  handlePreview(fileList.value[0] as UploadFile);
};
</script>
<template>
  <div
    class="clearfix relative"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
    :style="{ width: size, height: size }"
  >
    <Upload
      :max-count="1"
      v-model:file-list="fileList"
      action="#"
      list-type="picture-card"
      @preview="handlePreview"
      accept=".png, .jpg, .jpeg"
      :custom-request="handleCustomRequest"
      :before-upload="handleBeforeUpload"
      :show-upload-list="false"
      @change="handleChange"
      :disabled="loading"
      class="common-img-uploader"
    >
      <img v-if="modelValue" :src="modelValue" alt="avatar" />
      <div class="flex flex-col items-center justify-center" v-else>
        <LoadingOutlined v-if="loading" />
        <PlusOutlined v-else />
        <Button type="link" size="small" :disabled="loading">上传</Button>
      </div>
    </Upload>
    <div
      v-if="modelValue && isHover"
      class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-black/30"
    >
      <Space class="text-white">
        <EyeFilled class="text-[18px] text-white cursor-zoom-in" @click.stop="handlePreviewImage" />
        <DeleteOutlined class="text-[18px] text-white cursor-pointer" @click.stop="handleDelete" />
      </Space>
    </div>
    <Modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </Modal>
  </div>
</template>
<style lang="scss">
.common-img-uploader {
  .ant-upload {
    width: v-bind(size) !important;
    height: v-bind(size) !important;
    overflow: hidden;
  }
}
</style>
