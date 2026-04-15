import { requestClient } from '#/api/request';

export async function singleFileUpload(data: FormData) {
  return requestClient.post('/common/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
