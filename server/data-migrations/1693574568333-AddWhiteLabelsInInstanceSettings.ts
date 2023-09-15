import { InstanceSettings } from 'src/entities/instance_settings.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { InstanceSettingsType } from 'src/helpers/instance_settings.constants';

export class AddWhiteLabelsInInstanceSettings1693574568333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const entityManager = queryRunner.manager;

    const whiteLabelSettings = [
      {
        value: process.env?.WHITE_LABEL_LOGO || '',
        key: 'WHITE_LABEL_LOGO',
        type: InstanceSettingsType.SYSTEM,
      },
      {
        value: process.env?.WHITE_LABEL_TEXT || '',
        key: 'WHITE_LABEL_TEXT',
        type: InstanceSettingsType.SYSTEM,
      },
      {
        value: process.env?.WHITE_LABEL_FAVICON || '',
        key: 'WHITE_LABEL_FAVICON',
        type: InstanceSettingsType.SYSTEM,
      },
    ];

    for (const setting of whiteLabelSettings) {
      await entityManager.insert(InstanceSettings, setting);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
