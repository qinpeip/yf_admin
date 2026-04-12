import type { IExpress } from '#/global';

import { requestClient } from '#/api/request';

export enum SHIPPING_TEMPLATE_FEE_TYPE {
  weight = 'weight',
}

export interface ShippingTemplateRow {
  shippingTemplateId?: number;
  shippingTemplateName?: string;
  feeType?: SHIPPING_TEMPLATE_FEE_TYPE;
  sort?: number;
  express_id?: number;
  rules?: ShippingTemplateRuleRow[];
}

export interface ShippingTemplateRuleRow {
  ruleId?: number;
  cityIds?: number[];
  firstWeight?: number;
  firstWeightPrice?: number;
  additionalWeight?: number;
  additionalWeightPrice?: number;
  isRemote?: boolean;
  template?: ShippingTemplateRow;
}

export interface ListShippingTemplateQuery {
  pageNum?: number;
  pageSize?: number;
  shippingTemplateName?: string;
}

export async function listShippingTemplate(query: ListShippingTemplateQuery) {
  return requestClient.get<{ expressList: IExpress[]; list: ShippingTemplateRow[]; total: number }>(
    '/system/shipping-template/list',
    { params: query },
  );
}
/** 获取运费模板选项 */
export async function listShippingTemplateOptions() {
  return requestClient.get<{ label: string; value: number }[]>('/system/shipping-template/enums');
}
export async function getShippingTemplate(shippingTemplateId: number) {
  return requestClient.get<ShippingTemplateRow & { express: IExpress }>(
    `/system/shipping-template/${shippingTemplateId}`,
  );
}

export async function addShippingTemplate(data: Partial<ShippingTemplateRow>) {
  return requestClient.post('/system/shipping-template', data);
}

export async function updateShippingTemplate(
  data: Partial<ShippingTemplateRow> & { shippingTemplateId: number },
) {
  return requestClient.put('/system/shipping-template', data);
}

export async function delShippingTemplate(shippingTemplateId: number) {
  return requestClient.delete(`/system/shipping-template/${shippingTemplateId}`);
}
