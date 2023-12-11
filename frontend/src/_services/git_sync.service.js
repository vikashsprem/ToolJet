import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';

export const gitSyncService = {
  create,
  getGitConfig,
  updateConfig,
  syncAppVersion,
  setFinalizeConfig,
  deleteConfig,
  getAppConfig,
  gitPush,
  gitPull,
  importGitApp,
  checkForUpdates,
  confirmPullChanges,
};

function create(organizationId, gitUrl) {
  const body = {
    organizationId,
    gitUrl,
  };

  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(body),
  };
  return fetch(`${config.apiUrl}/gitsync/workspace`, requestOptions).then(handleResponse);
}

function updateConfig(organizationGitId, gitUrl) {
  const body = {
    gitUrl,
  };
  const requestOptions = {
    method: 'PUT',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(body),
  };
  return fetch(`${config.apiUrl}/gitsync/${organizationGitId}`, requestOptions).then(handleResponse);
}

function setFinalizeConfig(organizationGitId, updateFinalStatusBody) {
  const controller = new AbortController();
  const timeOut = 2500;
  const id = setTimeout(() => controller.abort(), timeOut);
  const requestOptions = {
    method: 'PUT',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(updateFinalStatusBody),
    signal: controller.signal,
  };

  const response = fetch(`${config.apiUrl}/gitsync/finalize/${organizationGitId}`, requestOptions).then(handleResponse);
  clearTimeout(id);
  return response;
}

function getGitConfig(workspaceId) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    credentials: 'include',
  };
  return fetch(`${config.apiUrl}/gitsync/workspace/${workspaceId}`, requestOptions).then(handleResponse);
}

function syncAppVersion(appGitId, versionId) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    credentials: 'include',
  };
  return fetch(`${config.apiUrl}/app-git/${appGitId}/sync/${versionId}`, requestOptions).then(handleResponse);
}

function deleteConfig(organizationGitId) {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader(),
    credentials: 'include',
  };
  return fetch(`${config.apiUrl}/gitsync/${organizationGitId}`, requestOptions).then(handleResponse);
}

function gitPush(body, appGitId, versionId) {
  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(body),
  };
  return fetch(`${config.apiUrl}/gitsync/gitpush/${appGitId}/${versionId}`, requestOptions).then(handleResponse);
}

function getAppConfig(organizationId, versionId) {
  const controller = new AbortController();
  const timeOut = 2500;
  const id = setTimeout(() => controller.abort(), timeOut);
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    credentials: 'include',
    signal: controller.signal,
  };
  const response = fetch(`${config.apiUrl}/gitsync/${organizationId}/app/${versionId}`, requestOptions).then(
    handleResponse
  );
  clearTimeout(id);
  return response;
}

function checkForUpdates(appId) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    credentials: 'include',
  };
  return fetch(`${config.apiUrl}/gitsync/gitpull/app/${appId}`, requestOptions).then(handleResponse);
}

function gitPull() {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    credentials: 'include',
  };
  return fetch(`${config.apiUrl}/gitsync/gitpull`, requestOptions).then(handleResponse);
}

function confirmPullChanges(body, appId) {
  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(body),
  };
  return fetch(`${config.apiUrl}/gitsync/gitpull/app/${appId}`, requestOptions).then(handleResponse);
}

function importGitApp(body) {
  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    credentials: 'include',
    body: JSON.stringify(body),
  };
  return fetch(`${config.apiUrl}/gitsync/gitpull/app`, requestOptions).then(handleResponse);
}
