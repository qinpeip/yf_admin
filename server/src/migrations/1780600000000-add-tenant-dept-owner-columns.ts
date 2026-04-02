import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantDeptOwnerColumns1780600000000 implements MigrationInterface {
  name = 'AddTenantDeptOwnerColumns1780600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== sys_dept / sys_user（已存在 dept_id，仅补 tenant/owner） ==========
    await queryRunner.query(`ALTER TABLE \`sys_dept\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_dept\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_user\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_user\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    // ========== 基础业务表（补 tenant/dept/owner） ==========
    const tablesWithDept = [
      'sys_role',
      'sys_post',
      'sys_notice',
      'sys_menu',
      'sys_dict_type',
      'sys_dict_data',
      'sys_config',
      'sys_upload',
      'sys_job',
      'gen_table',
      'gen_table_column',
    ];

    for (const t of tablesWithDept) {
      await queryRunner.query(`ALTER TABLE \`${t}\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
      await queryRunner.query(`ALTER TABLE \`${t}\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
      await queryRunner.query(`ALTER TABLE \`${t}\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);
    }

    // ========== 日志表 ==========
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_logininfor\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_logininfor\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_logininfor\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_job_log\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_job_log\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_job_log\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    // ========== 关联表（角色/菜单/用户） ==========
    await queryRunner.query(`ALTER TABLE \`sys_role_dept\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_role_dept\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_role_menu\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_role_menu\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_role_menu\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_user_role\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_user_role\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_user_role\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    await queryRunner.query(`ALTER TABLE \`sys_user_post\` ADD \`tenant_id\` int NOT NULL DEFAULT 1 COMMENT '租户ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_user_post\` ADD \`dept_id\` int DEFAULT NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`sys_user_post\` ADD \`owner_user_id\` int DEFAULT NULL COMMENT '数据所有者用户ID'`);

    // ========== 回填默认值 ==========
    // 使用 admin 的租户（默认 tenant_id=1）与部门（user_id=1 的 dept_id）
    for (const t of tablesWithDept) {
      await queryRunner.query(
        `UPDATE \`${t}\` SET dept_id = (SELECT dept_id FROM sys_user WHERE user_id = 1) WHERE dept_id IS NULL`,
      );
      await queryRunner.query(`UPDATE \`${t}\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    }

    await queryRunner.query(`UPDATE \`sys_dept\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_user\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);

    await queryRunner.query(`UPDATE \`sys_oper_log\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_logininfor\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_job_log\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);

    await queryRunner.query(`UPDATE \`sys_role_dept\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_role_menu\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_user_role\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
    await queryRunner.query(`UPDATE \`sys_user_post\` SET owner_user_id = 1 WHERE owner_user_id IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 为避免破坏现有数据，down 不做完整回滚（此迁移用于前进升级）。
  }
}

