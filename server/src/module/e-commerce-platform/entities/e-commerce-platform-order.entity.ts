import { BaseEntity } from 'src/common/entities/base';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ECommercePlatformOrderGoodsInfoEntity } from './e-commerce-platform-order-goods-info.entity';

// 1：待发货，2：已发货待签收，3：已签收 5：全部
export enum PT_ORDER_STATUS {
  // 待发货
  PENDING = '1',
  // 已发货待签收
  SHIPPED = '2',
  // 已签收
  DELIVERED = '3',
  // 全部
  COMPLETED = '5',
}

// 售后状态 1：无售后或售后关闭，2：售后处理中，3：退款中，4： 退款成功 5：全部
export enum PT_REFUND_STATUS {
  // 无售后或售后关闭
  NO_REFUND = '1',
  // 售后处理中
  REFUND_PROCESSING = '2',
  // 退款中
  REFUND_ING = '3',
  // 退款成功
  REFUND_SUCCESS = '4',
  // 全部
  ALL = '5',
}

@Entity('e_commerce_platform_order', {
  comment: '电商平台订单',
})
export class ECommercePlatformOrderEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'pt_order_id', comment: '订单ID' })
  public ptOrderId: number;
  // receiverName
  @Column({ type: 'varchar', name: 'receiver_name', length: 255, comment: '收货人姓名', nullable: true, default: '' })
  public receiverName: string;
  // receiverPhone
  @Column({ type: 'varchar', name: 'receiver_phone', length: 255, comment: '收货人电话', nullable: true, default: '' })
  public receiverPhone: string;
  // province
  @Column({ type: 'varchar', name: 'province', length: 255, comment: '省份', nullable: true, default: '' })
  public province: string;
  // city
  @Column({ type: 'varchar', name: 'city', length: 255, comment: '城市', nullable: true, default: '' })
  public city: string;
  // town
  @Column({ type: 'varchar', name: 'town', length: 255, comment: '乡镇', nullable: true, default: '' })
  public town: string;
  // receiverAddress
  @Column({ type: 'varchar', name: 'receiver_address', length: 255, comment: '收货人地址', nullable: true, default: '' })
  public receiverAddress: string;
  // orderSn
  @Column({ type: 'varchar', name: 'order_sn', length: 255, comment: '订单号', nullable: true, default: '' })
  public orderSn: string;
  // goodsName
  @Column({ type: 'varchar', name: 'goods_name', length: 255, comment: '商品名称', nullable: true, default: '' })
  public goodsName: string;
  // goodsImg
  @Column({ type: 'varchar', name: 'goods_img', length: 255, comment: '商品图片', nullable: true, default: '' })
  public goodsImg: string;
  //  goodsSpec
  @Column({ type: 'varchar', name: 'goods_spec', length: 255, comment: '商品规格', nullable: true, default: '' })
  public goodsSpec: string;
  // goodsPrice
  @Column({ type: 'decimal', name: 'goods_price', precision: 10, scale: 2, comment: '商品价格', nullable: true, default: 0 })
  public goodsPrice: number;
  // goodsId
  @Column({ type: 'varchar', name: 'goods_id', comment: '商品ID', nullable: true, default: '' })
  public goodsId: string;
  // skuId
  @Column({ type: 'varchar', name: 'sku_id', comment: 'SKU ID', nullable: true, default: '' })
  public skuId: string;
  // isPreSale
  @Column({ type: 'boolean', name: 'is_pre_sale', comment: '是否预售', nullable: true, default: false })
  public isPreSale: boolean;
  // lastShipTime
  @Column({ type: 'datetime', name: 'last_ship_time', comment: '最后发货时间', nullable: true, default: null })
  public lastShipTime: Date;
  // confirmTime
  @Column({ type: 'datetime', name: 'confirm_time', comment: '确认时间', nullable: true, default: null })
  public confirmTime: Date;
  // remark
  @Column({ type: 'varchar', name: 'remark', length: 255, comment: '备注', nullable: true, default: '' })
  public remark: string;
  // goodsCount
  @Column({ type: 'int', name: 'goods_count', comment: '商品数量', nullable: true, default: 0 })
  public goodsCount: number;
  // payAmount
  @Column({ type: 'decimal', name: 'pay_amount', precision: 10, scale: 2, comment: '支付金额', nullable: true, default: 0 })
  public payAmount: number;
  // orderStatus
  @Column({ type: 'enum', name: 'order_status', enum: PT_ORDER_STATUS, comment: '订单状态', nullable: true, default: PT_ORDER_STATUS.PENDING })
  public orderStatus: PT_ORDER_STATUS;
  // refundStatus
  @Column({ type: 'enum', name: 'refund_status', enum: PT_REFUND_STATUS, comment: '退款状态', nullable: true, default: PT_REFUND_STATUS.NO_REFUND })
  public refundStatus: PT_REFUND_STATUS;
  // remarkTag
  @Column({ type: 'int', name: 'remark_tag', comment: '备注标签', nullable: true, default: 0 })
  public remarkTag: number;
  // remarkTagName
  @Column({ type: 'varchar', name: 'remark_tag_name', length: 255, comment: '备注标签名称', nullable: true, default: '' })
  public remarkTagName: string;
  // receiverNameEncrypt
  @Column({ type: 'varchar', name: 'receiver_name_encrypt', length: 255, comment: '收货人姓名加密', nullable: true, default: '' })
  public receiverNameEncrypt: string;
  // receiverPhoneEncrypt
  @Column({ type: 'varchar', name: 'receiver_phone_encrypt', length: 255, comment: '收货人电话加密', nullable: true, default: '' })
  public receiverPhoneEncrypt: string;
  // receiverAddressEncrypt
  @Column({ type: 'varchar', name: 'receiver_address_encrypt', length: 255, comment: '收货人地址加密', nullable: true, default: '' })
  public receiverAddressEncrypt: string;
  // openAdressId
  @Column({ type: 'varchar', name: 'open_address_id', comment: '开户地址ID', nullable: true, default: '' })
  public openAddressId: number;
  // openAdressId2
  @Column({ type: 'varchar', name: 'open_address_id_2', comment: '开户地址ID2', nullable: true, default: '' })
  public openAddressId2: string;
  //  townId
  @Column({ type: 'int', name: 'town_id', comment: '乡镇ID', nullable: true, default: 0 })
  public townId: number;
  // outerId
  @Column({ type: 'varchar', name: 'outer_id', comment: '外部ID', nullable: true, default: '' })
  public outerId: string;
  // outerGoodsId
  @Column({ type: 'varchar', name: 'outer_goods_id', comment: '外部商品ID', nullable: true, default: '' })
  public outerGoodsId: string;
  // mid
  @Column({ type: 'int', name: 'mid', comment: 'MID', nullable: true, default: 0 })
  public mid: number;
  // deptId
  @Column({ type: 'int', name: 'dept_id', comment: '部门ID', nullable: true, default: 0 })
  public deptId: number;

  @OneToMany(() => ECommercePlatformOrderGoodsInfoEntity, (goodsInfo) => goodsInfo.ptOrder, { cascade: true })
  public goodsInfo: ECommercePlatformOrderGoodsInfoEntity[];
}
