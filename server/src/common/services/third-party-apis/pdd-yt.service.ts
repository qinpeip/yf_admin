import { Injectable } from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { MD5 } from 'src/common/utils';
import qs from 'qs';
import { PddYt } from './pdd-yt';

export interface IlogisticsOnlineResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class PddYtService {
  private base_uri = 'http://pdd.api.dongmingwangluo.com';
  private app_key = 'YT6HO4BRAD';
  private app_secret = 'YHGFAQTR8AEQE9KAB1UMUWFIR0OMMOZI';
  constructor() {}

  /**
   * 订单发货
   * @param body 订单发货参数
   * @returns 订单发货返回数据
   */
  async logisticsOnline(body: PddYt.IlogisticsOnlineParams[]): Promise<PddYt.IlogisticsOnlineResponse[]> {
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
    };
    const url = `${this.base_uri}/api/v1/order/logisticsOnline?${qs.stringify(params)}`;
    const { data } = await axios.post(
      url,
      {
        params: JSON.stringify(body),
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (data.code === 10000) {
      return data.result;
    }
    throw new Error(data.message);
  }

  /**
   * 获取面单号
   * @param body 获取面单号参数
   * @returns 获取面单号返回数据
   */
  async getWaybillCode(body: PddYt.IGetWaybillCodeParams): Promise<PddYt.IGetWaybillCodeResponse[]> {
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
    };
    const url = `${this.base_uri}/api/v1/waybill/getWaybillCodeNew?${qs.stringify(params)}`;
    const { data } = await axios.post(
      url,
      {
        params: JSON.stringify(body),
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (data.code === 10000) {
      return data.result;
    }
    throw new Error(data.message);
  }

  /**
   * 获取商品列表
   * @param query 获取商品列表参数
   * @returns 获取商品列表返回数据
   */
  async getGoodsList(query: PddYt.IGetGoodsListQuery = { page: 1, pageSize: 10 }): Promise<PddYt.IGetGoodsListResponse> {
    const { page, pageSize, isOnsale = 1 } = query;
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
      page,
      pageSize,
      isOnsale,
    };
    const url = `${this.base_uri}/api/v1/goods/list?${qs.stringify(params)}`;
    const { data } = await axios.get(url);
    if (data.code === 10000) {
      return data.result;
    }
    throw new Error(data.message);
  }

  /**
   * 获取售后列表
   * @param query 获取售后列表参数
   * @returns 获取售后列表返回数据
   */
  async getRefundList(query: PddYt.IGetRefundListQuery): Promise<PddYt.IGetRefundListResponse> {
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
      ...query,
    };
    const url = `${this.base_uri}/api/v1/refund/list?${qs.stringify(params)}`;
    const { data } = await axios.get(url);
    if (data.code === 10000) {
      return data.result?.refund_increment_get_response as PddYt.IGetRefundListResponse;
    }
    throw new Error(data.message);
  }
  /**
   * 获取订单列表
   * @param query 获取售后详情参数
   * @returns 获取售后详情返回数据
   */
  async getOrderList(query: PddYt.IGetOrderListQuery): Promise<PddYt.IGetOrderListResponse> {
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
      ...query,
    };
    const url = `${this.base_uri}/api/v1/order/getOrders?${qs.stringify(params)}`;
    const { data } = await axios.get(url);
    if (data.code === 10000) {
      return data.result as PddYt.IGetOrderListResponse;
    }
    throw new Error(data.message);
  }
  /**
   * 更新订单备注
   * @param body 更新订单备注参数
   * @returns 更新订单备注返回数据
   */
  async noteUpdate(body: PddYt.INoteUpdateBody): Promise<PddYt.INoteUpdateResponse> {
    const sendTime = dayjs().unix();
    const sign = MD5(`${sendTime}${this.app_secret}`.toUpperCase());
    const params = {
      appKey: this.app_key,
      sendTime,
      sign,
    };
    const url = `${this.base_uri}/api/v1/order/noteUpdate?${qs.stringify(params)}`;
    const { data } = await axios({
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      data: qs.stringify(body),
    });
    if (data.code === 10000) {
      return data.result as PddYt.INoteUpdateResponse;
    }
    throw new Error(data.message);
  }
}
