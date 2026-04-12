import { PT_REFUND_AFTER_SALES_STATUS, PT_REFUND_AFTER_SALES_TYPE } from 'src/module/e-commerce-platform/entities/e-commerce-platform-refund.entity';

declare namespace PddYt {
  /** 订单发货参数 */
  interface IlogisticsOnlineParams {
    /**
     * 拼多多订单号
     */
    orderSn: string;
    /**
     * 订单所在店铺 id（非取号店铺id）
     */
    ownerId: string;
    /**
     * 面单号
     */
    waybillCode: string;
    /**
     * 快递编号，类似 SF， STO
     */
    wpCode: string;
  }
  // 订单发货返回数据
  interface IlogisticsOnlineResponse {
    code: number;
    errorMsg: string;
    orderSn: string;
    waybillCode: string;
  }
  /**
   * 获取面单号参数
   */
  interface IGetWaybillCodeParams {
    /**
     * 1 自由订单或者非云兔订单   2 云兔订单
     */
    orderChannel: number;
    /**
     * 取号订单列表，最多 50 个 详情请看下方注释
     */
    orderList: IGetWaybillCodeOrder[];
    /**
     * 单号来源店铺 id
     */
    ownerId: string;
    /**
     * 网点发货市
     */
    senderCity: string;
    /**
     * 网点发货详细地址
     */
    senderDetail: string;
    /**
     * 发件人手机号码
     */
    senderMobile: string;
    /**
     * 发件人姓名
     */
    senderName: string;
    /**
     * 网点发货省
     */
    senderProvince: string;
    /**
     * 网点发货区
     */
    senderTown: string;
    /**
     * 店铺代码，在云兔打单软件->店铺管理列表获取
     */
    shopCode: string;
    /**
     * 面单类型 1:一联单，2:二联单,3:其他
     */
    waybillType: number;
    /**
     * 快递编号，类似 SF，STO
     */
    wpCode: string;
  }

  /**
   * 获取面单号订单
   */
  interface IGetWaybillCodeOrder {
    /**
     * 加密收货人详细地址， 如果传了优先使用
     */
    addressEncrypt?: string;
    /**
     * 收货人城市
     */
    city: string;
    /**
     * 产品类型，"{“TIMED-DELIVERY”: {“value”: “X”}"   X对应枚举类
     */
    LogisticsServices?: string;
    /**
     * 加密收货人姓名， 如果传了优先使用
     */
    nameEncrypt?: string;
    /**
     * 订单号， 如果orderChannel等于2 一定要传拼多多订单号
     */
    orderSn: string;
    /**
     * 加密收货人手机号， 如果传了优先使用
     */
    phoneEncrypt?: string;
    /**
     * 收货人省
     */
    province: string;
    /**
     * 收货人详细地址
     */
    receiverAddress: string;
    /**
     * 收货人姓名
     */
    receiverName: string;
    /**
     * 收货人手机号码
     */
    receiverPhone: string;
    /**
     * 收货人区、镇
     */
    town: string;
  }

  /**
   * 获取面单号返回数据
   */
  interface IGetWaybillCodeResponse {
    code: number;
    errorMsg: string;
    orderSn: string;
    waybillCode: string;
    parentWaybillCode: string;
    printData: {
      encryptedData: string;
      signature: string;
      templateUrl: string;
      ver: string;
    };
  }

  /**
   * 获取商品列表参数
   */
  interface IGetGoodsListQuery {
    page: number;
    pageSize: number;
    isOnsale?: 0 | 1;
  }
  /**
   * 获取商品列表返回数据
   */
  interface IGetGoodsListResponse {
    total_count: number;
    goods_list: IGoods[];
  }

  interface IGoods {
    created_at: number;
    goods_id: number;
    goods_name: string;
    goods_quantity: number;
    goods_reserve_quantity: number;
    image_url: string;
    is_more_sku: 0 | 1;
    is_onsale: 0 | 1;
    outer_goods_id: string;
    thumb_url: string;
    sku_list: ISku[];
  }
  interface ISku {
    is_sku_onsale: 0 | 1;
    outer_id: string;
    reserve_quantity: number;
    sku_id: number;
    sku_quantity: number;
    spec: string;
    spec_details: ISpec[];
  }
  interface ISpec {
    parent_id: number;
    parent_name: string;
    spec_id: number;
    spec_name: string;
    spec_note: string;
  }

  /**
   * 获取售后列表参数
   */
  interface IGetRefundListQuery {
    ownerId: number;
    afterSalesStatus: PT_REFUND_AFTER_SALES_STATUS;
    afterSalesType: PT_REFUND_AFTER_SALES_TYPE;
    startUpdatedAt: number;
    endUpdatedAt: number;
    page?: number;
    pageSize?: number;
    orderSn?: string;
  }

  /**
   * 获取售后列表返回数据
   */
  interface IGetRefundListResponse {
    total_count: number;
    refund_list: IRefund[];
  }
  interface IRefund {
    /**
     * 售后原因
     */
    after_sale_reason: string;
    /**
     * 售后状态，0：无售后 2：买家申请退款，待商家处理 3：退货退款，待商家处理 4：商家同意退款，退款中 5：平台同意退款，退款中 6：驳回退款，待买家处理
     * 7：已同意退货退款,待用户发货 8：平台处理中 9：平台拒绝退款，退款关闭 10：退款成功 11：买家撤销 12：买家逾期未处理，退款失败 13：买家逾期，超过有效期
     * 14：换货补寄待商家处理 15：换货补寄待用户处理 16：换货补寄成功 17：换货补寄失败 18：换货补寄待用户确认完成 21：待商家同意维修 22：待用户确认发货
     * 24：维修关闭 25：维修成功 27：待用户确认收货 31：已同意拒收退款，待用户拒收 32：补寄待商家发货
     */
    after_sales_status: PT_REFUND_AFTER_SALES_STATUS;
    /**
     * 售后类型
     */
    after_sales_type: PT_REFUND_AFTER_SALES_TYPE;
    /**
     * 成团时间
     */
    confirm_time: string;
    /**
     * 创建时间
     */
    created_time: string;
    /**
     * 订单折扣金额（元）
     */
    discount_amount: string;
    /**
     * 1纠纷退款 0非纠纷退款
     */
    dispute_refund_status: 0 | 1;
    /**
     * 商品图片
     */
    good_image: string;
    /**
     * 商品编码
     */
    goods_id: string;
    /**
     * 商品名称
     */
    goods_name: string;
    /**
     * 商品数量
     */
    goods_number: string;
    /**
     * 商品单价
     */
    goods_price: string;
    /**
     * 售后编号
     */
    id: string;
    /**
     * 订单金额（元）
     */
    order_amount: string;
    /**
     * 订单编号
     */
    order_sn: string;
    /**
     * 商家外部编码（商品）
     */
    outer_goods_id: string;
    /**
     * 商家外部编码（sku）
     */
    outer_id: string;
    /**
     * 退款金额（元）
     */
    refund_amount: string;
    /**
     * 同意退款操作人角色，0:"默认",1:"用户",2:"商家",3:"平台",4:"系统",5:"团长",6:"司机",7:"代理人"
     */
    refund_operator_role: string;
    /**
     * 退货物流公司名称
     */
    shipping_name: string;
    /**
     * 商品规格ID
     */
    sku_id: string;
    /**
     * 极速退款标志位，1：极速退款，0：非极速退款
     */
    speed_refund_flag: number;
    /**
     * 极速退款状态，"1"：有极速退款资格，"2"：极速退款失败, "3" 表示极速退款成功，其他表示非极速退款
     */
    speed_refund_status: string;
    /**
     * 快递运单号
     */
    tracking_number: string;
    /**
     * 更新时间
     */
    updated_time: string;
    /**
     * 0-未勾选 1-消费者选择的收货状态为未收到货 2-消费者选择的收货状态为已收到货
     */
    user_shipping_status: '0' | '1' | '2';
  }

  /**
   * 获取订单列表参数
   */
  interface IGetOrderListQuery {
    /**
     * 传了 并且是1 会返回加密地址和收件人姓名、电话
     */
    ciphertext?: string;
    /**
     * 成团结束时间
     */
    endTime?: string;
    /**
     * 订单状态 1待发货 3已发货
     */
    orderStatus?: number;
    /**
     * 店铺 id
     */
    ownerId: string;
    /**
     * 页数，默认 0，（页数从0开始，第一页是0）
     */
    page: number;
    /**
     * 每页数量 最大1000
     */
    pageSize: number;
    /**
     * 售后状态 1无售后
     */
    refundStatus?: number;
    /**
     * 订单备注，模糊搜索
     */
    remark?: string;
    /**
     * 拼多多标记 1-5
     */
    remarkTag?: number;
    /**
     * 成团开始时间
     */
    startTime: string;
  }

  /**
   * 获取订单列表返回数据
   */
  interface IGetOrderListResponse {
    content: IOrder[];
    page: number;
    pageSize: number;
    totalElements: number;
  }
  interface IOrder {
    /**
     * 市
     */
    city: string;
    /**
     * 确认时间，mock: 1614958979000
     */
    confirmTime: number;
    goodsInfo: IOrderGoodsInfo[];
    /**
     * 是否预售，mock: false
     */
    isPreSale: boolean;
    /**
     * mock: 1614958979000
     */
    lastShipTime: number;
    /**
     * 订单号，mock: 210305-028089222180000
     */
    orderSn: string;
    /**
     * 订单状态
     */
    orderStatus: number;
    /**
     * 支付金额
     */
    payAmount: number;
    /**
     * 省
     */
    province: string;
    /**
     * 详细地址，mock: 阳逻中央花园城C*
     */
    receiverAddress: string;
    /**
     * 加密收件人详细地址（云兔的订单可以不传）
     */
    receiverAddressEncrypt: string;
    /**
     * 收货人姓名，mock: 吴*
     */
    receiverName: string;
    /**
     * 加密收件人姓名（云兔的订单可以不传
     */
    receiverNameEncrypt: string;
    /**
     * 收货人手机号，mock: 17*******32
     */
    receiverPhone: string;
    /**
     * 加密收件人手机号（云兔的订单可以不传）
     */
    receiverPhoneEncrypt: string;
    refundStatus: number;
    /**
     * 备注
     */
    remark: string;
    /**
     * 备注旗帜
     */
    remarkTag: number;
    /**
     * 备注旗帜名称
     */
    remarkTagName: string;
    /**
     * 区\街道
     */
    town: string;
    /**
     * 城市ID
     */
    townId: number;
  }

  interface IOrderGoodsInfo {
    goodsCount: number;
    goodsId: string;
    goodsImg: string;
    goodsName: string;
    goodsPrice: number;
    goodsSpec: string;
    outerGoodsId: string;
    outerId: string;
    skuId: string;
  }

  /**
   * 更新订单备注参数
   */
  interface INoteUpdateBody {
    /**
     * 订单备注
     */
    note: string;
    /**
     * 订单号
     */
    orderSn: string;
    /**
     * 店铺id
     */
    ownerId: string;
    /**
     * 1,2,3,4,5[备注标记：1-红色，2-黄色，3-绿色，4-蓝色，5-紫色，tag与tag_name关联]
     */
    tag?: string;
  }
  /**
   * 更新订单备注返回数据
   */
  interface INoteUpdateResponse {
    error_code: number;
    error_msg: string;
    success: boolean;
  }
}
