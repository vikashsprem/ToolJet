import React, { useEffect } from 'react';
import { appEnvironmentService } from '@/_services';
import { capitalize } from 'lodash';
import EnvironmentSelectBox from './EnvironmentSelectBox';
import { ToolTip } from '@/_components/ToolTip';
import '@/_styles/versions.scss';

const EnvironmentManager = (props) => {
  const {
    editingVersion,
    appEnvironmentChanged,
    environments,
    setEnvironments,
    onEditorFreeze,
    currentEnvironment,
    setCurrentEnvironment,
  } = props;
  // TODO: fix naming with the current environment id
  const currentAppEnvironmentId = editingVersion?.current_environment_id || editingVersion?.currentEnvironmentId;

  useEffect(() => {
    if (!currentEnvironment) editingVersion.id && fetchEnvironments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingVersion.id, currentEnvironment]);

  /**
   * if the current promoted environment is production or staging, then we need to freeze the editor
   */
  useEffect(() => {
    if (!currentEnvironment) return;
    const currentPromotedEnvironment = currentAppEnvironmentId
      ? environments.find((env) => env.id === currentAppEnvironmentId)
      : environments.find((env) => env.name === 'development');
    if (currentPromotedEnvironment.name === 'production' || currentPromotedEnvironment.name === 'staging') {
      // we don't want to allow editing of production and staging environments
      // so let's freeze the editor
      onEditorFreeze(true);
    }
  }, [currentEnvironment, onEditorFreeze, editingVersion.id]);

  const fetchEnvironments = () => {
    const appId = editingVersion?.app_id || editingVersion?.appId;
    appEnvironmentService.getAllEnvironments(appId).then((data) => {
      const envArray = data?.environments;
      setEnvironments(envArray);
      if (envArray.length > 0) {
        const env = currentAppEnvironmentId
          ? envArray.find((env) => env.id === currentAppEnvironmentId)
          : envArray.find((env) => env.name === 'development');
        // let's not change the current environment if it is already set
        if (currentEnvironment) return;

        const envIndex = envArray.findIndex((e) => e.id === env.id);
        setCurrentEnvironment({ ...env, index: envIndex });
        selectEnvironment(env, true);
      }
    });
  };

  const selectEnvironment = (env, isVersionChanged = false) => {
    appEnvironmentChanged(env?.id, isVersionChanged);
  };

  // if any app is in production, then it is also in staging. So, we need to check if there is any version in production
  const haveVersionInProduction = environments.find((env) => env.name === 'production' && env.app_versions_count > 0);
  const darkMode = darkMode ?? (localStorage.getItem('darkMode') === 'true' || false);

  const options = environments.map((environment, index) => {
    // either there are versions in this environment or it is production environment
    const haveVersions = environment.app_versions_count > 0 || haveVersionInProduction;
    const grayColorStyle = haveVersions ? { cursor: 'pointer' } : { color: '#687076' };
    const handleClick = () => {
      if (haveVersions) {
        setCurrentEnvironment({ ...environment, index });
        selectEnvironment(environment, true);
      }
    };
    return {
      value: environment.id,
      environmentName: environment.name,
      onClick: handleClick,
      haveVersions,
      label: (
        <div className="env-option" key={index}>
          <div className="col-10">
            <ToolTip
              message="There are no versions in this environment"
              placement="left"
              show={haveVersions ? false : true}
            >
              <div className={`app-environment-name ${darkMode ? 'dark-theme' : ''}`} style={grayColorStyle}>
                {capitalize(environment.name)}
              </div>
            </ToolTip>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="app-environment-menu">
      <EnvironmentSelectBox
        options={options}
        currentEnv={currentEnvironment}
        onEnvChange={(id) => appEnvironmentChanged(id)}
        versionId={editingVersion.id}
      />
    </div>
  );
};

export default EnvironmentManager;
