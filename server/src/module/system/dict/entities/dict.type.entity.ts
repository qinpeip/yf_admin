import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_dict_type', {
  comment: '字典类型表',
})
export class SysDictTypeEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '字典主键' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'dict_id', comment: '字典主键' })
  public dictId: number;

  @Column({ type: 'varchar', name: 'dict_name', length: 100, comment: '字典名称' })
  public dictName: string;

  @Column({ type: 'varchar', name: 'dict_type', unique: true, length: 100, comment: '字典类型' })
  public dictType: string;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;

  //0正常 1停用
  @ApiProperty({ type: String, description: '状态' })
  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态' })
  public status: string;

  // remark
  @Column({ type: 'varchar', name: 'remark', length: 500, comment: '备注' })
  public remark: string;
}
