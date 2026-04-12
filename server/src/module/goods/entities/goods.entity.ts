import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { GoodsWithCraftsmanshipEntity } from './goods-with-craftsmanship.entity';
import { GoodsAttrsEntity } from './goods-attrs.entity';

// 计价方式：1-平方计价，2-普通计价
export enum GOODS_PRICE_TYPE {
  SQUARE = '1',
  NORMAL = '2',
}

// 状态：10-上架中，20-下架
export enum GOODS_STATUS {
  ON_SALE = '10',
  OFF_SALE = '20',
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

@Entity('goods', {
  comment: '商品',
})
export class GoodsEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_id', comment: '商品ID' })
  public goodsId: number;

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '名称' })
  public name: string;

  @Column({ type: 'varchar', name: 'description', length: 255, comment: '描述', nullable: true, default: '' })
  public description: string;

  @Column({ type: 'varchar', name: 'image', length: 255, comment: '图片', nullable: true, default: '' })
  public image: string;

  @Column({ type: 'decimal', name: 'weight', precision: 10, scale: 2, comment: '重量', nullable: true, default: 0 })
  public weight: number;

  @Column({ type: 'decimal', name: 'volume', precision: 10, scale: 2, comment: '体积', nullable: true, default: 0 })
  public volume: number;

  @Column({ type: 'int', name: 'bleed_range', default: 0, comment: '图片出血范围（mm）', nullable: true })
  public bleedRange: number;

  @Column({ type: 'enum', name: 'price_type', enum: GOODS_PRICE_TYPE, comment: '计价方式：1-平方计价，2-普通计价', default: GOODS_PRICE_TYPE.SQUARE })
  public priceType: GOODS_PRICE_TYPE;

  @Column({ type: 'decimal', name: 'shipping_fee', precision: 10, scale: 2, comment: '运费', nullable: true, default: 0 })
  public shippingFee: number;

  @Column({ type: 'enum', name: 'status', enum: GOODS_STATUS, comment: '状态：10-上架中，20-下架', default: GOODS_STATUS.ON_SALE })
  public status: GOODS_STATUS;

  // 发货地址
  @Column({ type: 'varchar', name: 'shipping_address', length: 255, comment: '发货地址', nullable: true, default: '' })
  public shippingAddress: string;

  @Column({ type: 'enum', name: 'shipping_type', enum: GOODS_SHIPPING_TYPE, comment: '运费类型 1-固定运费， 2-运费模板', default: GOODS_SHIPPING_TYPE.TEMPLATE })
  public shippingType: GOODS_SHIPPING_TYPE;

  // 快递模板ids
  @Column({ type: 'json', name: 'shipping_template_ids', comment: '快递模板ids', nullable: true })
  public shippingTemplateIds: number[];

  // 基础打包费用
  @Column({ type: 'decimal', name: 'base_packing_fee', precision: 10, scale: 2, comment: '基础打包费用', nullable: true, default: 0 })
  public basePackingFee: number;

  // 是否定制商品
  @Column({ type: 'boolean', name: 'is_customization', comment: '是否定制商品', default: false })
  public isCustomization: boolean;

  // 展示价格
  @Column({ type: 'decimal', name: 'show_price', precision: 10, scale: 2, comment: '展示价格', nullable: true, select: false, default: 0 })
  public showPrice: number;

  // 上传类型
  @Column({ type: 'enum', name: 'upload_type', enum: GOODS_UPLOAD_TYPE, comment: '上传类型(card:卡片,photo:照片,roll:条幅)', default: GOODS_UPLOAD_TYPE.CARD })
  public uploadType: GOODS_UPLOAD_TYPE;

  // 分类id
  @Column({ type: 'int', name: 'category_id', comment: '分类ID', nullable: true })
  public categoryId: number;

  // 类目id
  @Column({ type: 'int', name: 'class_id', comment: '类目ID', nullable: true })
  public classId: number;

  // 部门id
  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;

  @OneToMany(() => GoodsWithCraftsmanshipEntity, (goodsWithCraftsmanship) => goodsWithCraftsmanship.goods, { cascade: true })
  public craftsmanship: GoodsWithCraftsmanshipEntity[];

  @OneToMany(() => GoodsAttrsEntity, (attrs) => attrs.goods, { cascade: true })
  public attrs: GoodsAttrsEntity[];
}
