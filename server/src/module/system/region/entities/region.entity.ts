import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sys_region', {
  comment: '地区表',
})
export class SysRegionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '地区ID' })
  public id: number;

  @Column({ type: 'int', name: 'pid', comment: '父ID', nullable: true })
  public pid: number;

  @Column({ type: 'varchar', name: 'shortname', length: 100, comment: '简称', nullable: true })
  public shortname: string;

  @Column({ type: 'varchar', name: 'name', length: 100, comment: '名称', nullable: true })
  public name: string;

  @Column({ type: 'varchar', name: 'merger_name', length: 100, comment: '全称', nullable: true })
  public mergerName: string;

  @Column({ type: 'tinyint', name: 'level', comment: '层级 1 2 3 省市区县', nullable: true, default: 0 })
  public level: number;

  @Column({ type: 'varchar', name: 'pinyin', length: 100, comment: '拼音', nullable: true })
  public pinyin: string;

  @Column({ type: 'varchar', name: 'code', length: 100, comment: '长途区号', nullable: true })
  public code: string;

  @Column({ type: 'varchar', name: 'zip_code', length: 100, comment: '邮编', nullable: true })
  public zipCode: string;

  @Column({ type: 'varchar', name: 'first', length: 50, comment: '首字母', nullable: true })
  public first: string;

  @Column({ type: 'varchar', name: 'lng', length: 100, comment: '经度', nullable: true })
  public lng: string;

  @Column({ type: 'varchar', name: 'lat', length: 100, comment: '纬度', nullable: true })
  public lat: string;

  @Column({ type: 'int', name: 'sort', comment: '排序', nullable: true, default: 0 })
  public sort: number;
}
