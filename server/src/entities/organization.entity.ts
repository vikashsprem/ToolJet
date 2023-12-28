import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';
import { GroupPermission } from './group_permission.entity';
import { SSOConfigs } from './sso_config.entity';
import { OrganizationUser } from './organization_user.entity';
import { InternalTable } from './internal_table.entity';
import { AppEnvironment } from './app_environments.entity';
import { OrganizationsLicense } from './organization_license.entity';
import { OrganizationGitSync } from './organization_git_sync.entity';

@Entity({ name: 'organizations' })
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', unique: true })
  name: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'domain' })
  domain: string;

  @Column({ name: 'enable_sign_up' })
  enableSignUp: boolean;

  @Column({ name: 'inherit_sso' })
  inheritSSO: boolean;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @CreateDateColumn({ default: () => 'now()', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GroupPermission, (groupPermission) => groupPermission.organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  groupPermissions: GroupPermission[];

  @OneToMany(() => SSOConfigs, (ssoConfigs) => ssoConfigs.organization, { cascade: ['insert'] })
  ssoConfigs: SSOConfigs[];

  @OneToOne(() => OrganizationGitSync, (organizationGitSync) => organizationGitSync.organization, {
    onDelete: 'CASCADE',
  })
  organizationGitSync: OrganizationGitSync;

  @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.organization)
  organizationUsers: OrganizationUser[];

  @OneToMany(() => AppEnvironment, (appEnvironment) => appEnvironment.organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  appEnvironments: AppEnvironment[];

  @OneToMany(() => InternalTable, (internalTable) => internalTable.organization)
  internalTable: InternalTable[];

  @OneToOne(() => OrganizationsLicense, (license) => license.organization, { onDelete: 'CASCADE' })
  organizationsLicense: OrganizationsLicense;
}
