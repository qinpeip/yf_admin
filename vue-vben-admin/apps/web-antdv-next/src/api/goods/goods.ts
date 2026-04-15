import { requestClient } from '#/api/request';

// 计价方式：1-平方计价，2-普通计价
export enum GOODS_PRICE_TYPE {
  NORMAL = '2',
  SQUARE = '1',
}

// 状态：10-上架中，20-下架
export enum GOODS_STATUS {
  OFF_SALE = '20',
  ON_SALE = '10',
}

// 运费类型 1-固定运费， 2-运费模板
export enum GOODS_SHIPPING_TYPE {
  FIXED = '1',
  TEMPLATE = '2',
}

// 上传类型(card:卡片,photo:照片,roll:条幅)
export enum GOODS_UPLOAD_TYPE {
  CARD = 'card',
  PHOTO = 'photo',
  ROLL = 'roll',
}

// 工艺价格类型：1-普通计价，2-按平方计价
export enum GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE {
  NORMAL = '1',
  SQUARE = '2',
}

export interface GoodsRow {
  goodsId?: number;
  name?: string;
  description?: string;
  image?: string;
  weight?: number;
  volume?: number;
  bleedRange?: number;
  priceType?: GOODS_PRICE_TYPE;
  shippingFee?: number;
  shippingAddress?: string;
  shippingType?: GOODS_SHIPPING_TYPE;
  shippingTemplateIds?: number[];
  basePackingFee?: number;
  isCustomization?: boolean;
  showPrice?: number;
  uploadType?: GOODS_UPLOAD_TYPE;
  categoryId?: number;
  classId?: number;
  deptId?: number;
  craftsmanship?: GoodsWithCraftsmanshipRow[];
  attrs?: GoodsAttrsRow[];
  skus?: GoodsSku[];
}
export interface GoodsWithCraftsmanshipRow {
  goodsWithCraftsmanshipId?: number;
  goodsId?: number;
  craftsmanshipId?: number;
  priceType?: GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE;
  childCraftsmanship?: GoodsChildCraftsmanshipRow[];
}
export interface GoodsChildCraftsmanshipRow {
  goodsChildCraftsmanshipId?: number;
  goodsWithCraftsmanshipId?: number;
  name?: string;
  price?: number;
}
export interface GoodsAttrsRow {
  goodsAttrsId?: number;
  attrName?: string;
  joinNormalPrice?: boolean;
  joinSquarePrice?: boolean;
  key?: string;
  customValue?: boolean;
  hasImg?: boolean;
  attrsOptions?: GoodsAttrsOptionsRow[];
}
export interface GoodsAttrsOptionsRow {
  goodsAttrsOptionsId?: number;
  optionName?: string;
  imgUrl?: string;
  remark?: string;
  price?: number;
  num1?: number;
  num2?: number;
}

export interface ListGoodsQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
}

export interface GoodsSku {
  sortOrder: number;
  spec: GoodsSkuSpec[];
  price: number;
  stock: number;
  specFingerprint: string;
  skuCode: string;
}

export interface GoodsSkuSpec {
  key: string;
  optionName: string;
  imgUrl?: string;
  price?: number;
  num1?: number;
  num2?: number;
  remark?: string;
}

export enum GOODS_PUBLIC_STATUS {
  // 已上架
  ON_SALE = '20',
  // 待审核
  PENDING = '10',
  // 驳回
  REJECTED = '30',
}

export async function listGoods(query: ListGoodsQuery) {
  return requestClient.get<{ list: GoodsRow[]; total: number }>('/goods/list', { params: query });
}

export async function addGoods(data: GoodsRow) {
  return requestClient.post<{ goodsId: number }>('/goods', data);
}

export async function updateGoods(data: GoodsRow) {
  return requestClient.put<{ goodsId: number }>('/goods', data);
}

export async function deleteGoods(goodsId: number) {
  return requestClient.delete<{ goodsId: number }>(`/goods/${goodsId}`);
}

export async function getGoods(goodsId: number) {
  return requestClient.get<GoodsRow>(`/goods/${goodsId}`);
}

export async function getGoodsSku(goodsId: number) {
  return requestClient.get<GoodsSku[]>(`/goods/skus/${goodsId}`);
}