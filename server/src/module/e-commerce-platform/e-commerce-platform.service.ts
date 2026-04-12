import { Injectable } from '@nestjs/common';
import { PLATFORM_TYPE } from 'src/common/constant';
import { PddYt } from 'src/common/services/third-party-apis/pdd-yt';
import { PddYtService } from 'src/common/services/third-party-apis/pdd-yt.service';
import { ECommercePlatform } from './e-commerce-platform';

@Injectable()
export class ECommercePlatformService {
  constructor(private readonly pddService: PddYtService) {}

  /**
   * 获取订单列表
   * @param query 查询参数
   * @param platformType 平台类型
   * @returns 订单列表返回数据
   */
  async getOrderList(query: ECommercePlatform.IGetOrderListQuery, platformType: PLATFORM_TYPE): Promise<ECommercePlatform.IGetOrderListResponse> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.getOrderList(query);
      default:
        throw new Error('Unsupported platform type');
    }
  }

  /**
   * 更新订单备注
   * @param body 更新订单备注参数
   * @param platformType 平台类型
   * @returns 更新订单备注返回数据
   */
  async noteUpdate(body: ECommercePlatform.INoteUpdateBody, platformType: PLATFORM_TYPE): Promise<ECommercePlatform.INoteUpdateResponse> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.noteUpdate(body);
      default:
        throw new Error('Unsupported platform type');
    }
  }
  /**
   * 订单发货
   * @param body 订单发货参数
   * @param platformType 平台类型
   * @returns 订单发货返回数据
   */
  async logisticsOnline(body: ECommercePlatform.IlogisticsOnlineBody[], platformType: PLATFORM_TYPE): Promise<ECommercePlatform.IlogisticsOnlineResponse[]> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.logisticsOnline(body);
      default:
        throw new Error('Unsupported platform type');
    }
  }

  /**
   * 获取面单号
   * @param body 获取面单号参数
   * @param platformType 平台类型
   * @returns 获取面单号返回数据
   */
  async getWaybillCode(body: ECommercePlatform.IGetWaybillCodeBody, platformType: PLATFORM_TYPE): Promise<ECommercePlatform.IGetWaybillCodeResponse[]> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.getWaybillCode(body);
      default:
        throw new Error('Unsupported platform type');
    }
  }

  /**
   * 获取售后列表
   * @param body 获取售后列表参数
   * @param platformType 平台类型
   * @returns 获取售后列表返回数据
   */
  async getRefundList(body: ECommercePlatform.IGetRefundListBody, platformType: PLATFORM_TYPE): Promise<ECommercePlatform.IGetRefundListResponse> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.getRefundList(body);
      default:
        throw new Error('Unsupported platform type');
    }
  }

  /**
   * 获取商品列表
   * @param body 获取商品列表参数
   * @param platformType 平台类型
   * @returns 获取商品列表返回数据
   */
  async getGoodsList(body: ECommercePlatform.IGetGoodsListBody = { page: 1, pageSize: 10 }, platformType: PLATFORM_TYPE): Promise<ECommercePlatform.IGetGoodsListResponse> {
    switch (platformType) {
      case PLATFORM_TYPE.PDD:
        return this.pddService.getGoodsList(body);
      default:
        throw new Error('Unsupported platform type');
    }
  }
}
