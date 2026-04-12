import { BaseEntity } from 'src/common/entities/base';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

// 0：无售后 2：买家申请退款，待商家处理 3：退货退款，待商家处理 4：商家同意退款，退款中 5：平台同意退款，退款中 6：驳回退款，待买家处理 7：已同意退货退款,待用户发货 8：平台处理中 9：平台拒绝退款，退款关闭 10：退款成功 11：买家撤销 12：买家逾期未处理，退款失败 13：买家逾期，超过有效期 14：换货补寄待商家处理 15：换货补寄待用户处理 16：换货补寄成功 17：换货补寄失败 18：换货补寄待用户确认完成 21：待商家同意维修 22：待用户确认发货 24：维修关闭 25：维修成功 27：待用户确认收货 31：已同意拒收退款，待用户拒收 32：补寄待商家发货 33：待商家召回
export enum PT_REFUND_AFTER_SALES_STATUS {
  // 无售后
  NO_AFTER_SALES = '0',
  // 买家申请退款，待商家处理
  BUYER_APPLY_REFUND = '2',
  // 退货退款，待商家处理
  RETURN_GOODS_REFUND = '3',
  // 商家同意退款，退款中
  SELLER_AGREE_REFUND = '4',
  // 平台同意退款，退款中
  PLATFORM_AGREE_REFUND = '5',
  // 驳回退款，待买家处理
  REJECT_REFUND = '6',
  // 已同意退货退款,待用户发货
  AGREED_RETURN_GOODS_REFUND = '7',
  // 平台处理中
  PLATFORM_PROCESSING = '8',
  // 平台拒绝退款，退款关闭
  PLATFORM_REFUSE_REFUND = '9',
  // 退款成功
  REFUND_SUCCESS = '10',
  // 买家撤销
  BUYER_CANCEL = '11',
  // 买家逾期未处理，退款失败
  BUYER_EXPIRED = '12',
  // 买家逾期，超过有效期
  BUYER_EXPIRED_OVER = '13',
  // 换货补寄待商家处理
  REPLACEMENT_GOODS_REPLACEMENT = '14',
  // 换货补寄待用户处理
  REPLACEMENT_GOODS_REPLACEMENT_USER = '15',
  // 换货补寄成功
  REPLACEMENT_GOODS_REPLACEMENT_SUCCESS = '16',
  // 换货补寄失败
  REPLACEMENT_GOODS_REPLACEMENT_FAIL = '17',
  // 换货补寄待用户确认完成
  REPLACEMENT_GOODS_REPLACEMENT_USER_CONFIRM_COMPLETE = '18',
  // 待商家同意维修
  REPAIR_AGREE = '21',
  // 待用户确认发货
  REPAIR_USER_CONFIRM_SHIP = '22',
  // 维修关闭
  REPAIR_CLOSE = '24',
  // 维修成功
  REPAIR_SUCCESS = '25',
  // 待用户确认收货
  REPAIR_USER_CONFIRM_RECEIVE = '27',
  // 已同意拒收退款，待用户拒收
  REJECT_RECEIVE_REFUND = '31',
  // 补寄待商家发货
  REPLACEMENT_GOODS_REPLACEMENT_SELLER_SHIP = '32',
  // 待商家召回
  REPLACEMENT_GOODS_REPLACEMENT_SELLER_RECALL = '33',
}

// 1：全部 2：仅退款 3：退货退款 4：换货 5：缺货补寄 6：维修
export enum PT_REFUND_AFTER_SALES_TYPE {
  // 全部
  ALL = '1',
  // 仅退款
  ONLY_REFUND = '2',
  // 退货退款
  RETURN_GOODS_REFUND = '3',
  // 换货
  REPLACEMENT_GOODS = '4',
  // 缺货补寄
  OUT_OF_STOCK_REPLACEMENT = '5',
  // 维修
  REPAIR = '6',
}

@Entity('e_commerce_platform_refund', {
  comment: '电商平台售后',
})
export class ECommercePlatformRefundEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '售后ID' })
  id: number;
  // 售后原因
  @Column({ type: 'varchar', name: 'after_sale_reason', length: 255, comment: '售后原因', nullable: true, default: '' })
  after_sale_reason: string;

  // 售后状态
  @Column({ type: 'int', name: 'after_sales_status', comment: '售后状态', nullable: true, default: 0 })
  after_sales_status: number;

  // 售后类型
  @Column({ type: 'int', name: 'after_sales_type', comment: '售后类型', nullable: true, default: 0 })
  after_sales_type: number;

  // 确认时间
  @Column({ type: 'datetime', name: 'confirm_time', comment: '确认时间', nullable: true, default: null })
  confirm_time: Date;

  // 创建时间
  @Column({ type: 'datetime', name: 'created_time', comment: '创建时间', nullable: true, default: null })
  created_time: Date;

  // 优惠金额
  @Column({ type: 'decimal', name: 'discount_amount', precision: 10, scale: 2, comment: '优惠金额', nullable: true, default: 0 })
  discount_amount: number;

  // 争议退款状态
  @Column({ type: 'int', name: 'dispute_refund_status', comment: '争议退款状态', nullable: true, default: 0 })
  dispute_refund_status: number;

  // 商品图片
  @Column({ type: 'varchar', name: 'good_image', length: 255, comment: '商品图片', nullable: true, default: '' })
  good_image: string;

  // 商品ID
  @Column({ type: 'bigint', name: 'goods_id', comment: '商品ID', nullable: true, default: 0 })
  goods_id: string;

  // 商品名称
  @Column({ type: 'varchar', name: 'goods_name', length: 255, comment: '商品名称', nullable: true, default: '' })
  goods_name: string;

  // 商品数量
  @Column({ type: 'int', name: 'goods_number', comment: '商品数量', nullable: true, default: 0 })
  goods_number: number;

  // 商品价格
  @Column({ type: 'decimal', name: 'goods_price', precision: 10, scale: 2, comment: '商品价格', nullable: true, default: 0 })
  goods_price: number;

  // 平台售后id
  @Column({ type: 'int', name: 'platform_after_sales_id', comment: '平台售后ID', nullable: true, default: 0 })
  platform_after_sales_id: number;

  // 订单金额
  @Column({ type: 'decimal', name: 'order_amount', precision: 10, scale: 2, comment: '订单金额', nullable: true, default: 0 })
  order_amount: number;

  // 订单号
  @Column({ type: 'varchar', name: 'order_sn', length: 255, comment: '订单号', nullable: true, default: '' })
  order_sn: string;

  // 外部商品ID
  @Column({ type: 'varchar', name: 'outer_goods_id', length: 255, comment: '外部商品ID', nullable: true, default: '' })
  outer_goods_id: string;

  // 外部ID
  @Column({ type: 'varchar', name: 'outer_id', length: 255, comment: '外部ID', nullable: true, default: '' })
  outer_id: string;

  // 退款金额
  @Column({ type: 'decimal', name: 'refund_amount', precision: 10, scale: 2, comment: '退款金额', nullable: true, default: 0 })
  refund_amount: number;

  // 退款操作人角色
  @Column({ type: 'int', name: 'refund_operator_role', comment: '退款操作人角色', nullable: true, default: 0 })
  refund_operator_role: number;

  // 物流公司名称
  @Column({ type: 'varchar', name: 'shipping_name', length: 255, comment: '物流公司名称', nullable: true, default: '' })
  shipping_name: string;

  // SKU ID
  @Column({ type: 'varchar', name: 'sku_id', length: 50, comment: 'SKU ID', nullable: true, default: '' })
  sku_id: string;

  // 极速退款标记
  @Column({ type: 'int', name: 'speed_refund_flag', comment: '极速退款标记', nullable: true, default: 0 })
  speed_refund_flag: number;

  // 极速退款状态
  @Column({ type: 'varchar', name: 'speed_refund_status', length: 50, comment: '极速退款状态', nullable: true, default: '' })
  speed_refund_status: string;

  // 物流单号
  @Column({ type: 'varchar', name: 'tracking_number', length: 50, comment: '物流单号', nullable: true, default: '' })
  tracking_number: string;

  // 更新时间
  @Column({ type: 'datetime', name: 'updated_time', comment: '更新时间', nullable: true, default: null })
  updated_time: Date;

  // 用户寄件状态
  @Column({ type: 'varchar', name: 'user_shipping_status', length: 10, comment: '用户寄件状态', nullable: true, default: '' })
  user_shipping_status: string;

  // mid
  @Column({ type: 'int', name: 'mid', comment: 'MID', nullable: true, default: 0 })
  mid: number;

  // deptId
  @Column({ type: 'int', name: 'dept_id', comment: '部门ID', nullable: true, default: 0 })
  deptId: number;
}
