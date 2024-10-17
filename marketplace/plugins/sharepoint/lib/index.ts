import { OAuthUnauthorizedClientError, QueryError, QueryResult, QueryService } from '@tooljet-marketplace/common';
import { SourceOptions, QueryOptions } from './types';

export default class Sharepoint implements QueryService {
  authUrl(sourceOptions): string {
    const host = process.env.TOOLJET_HOST;
    const subpath = process.env.SUB_PATH;
    const fullUrl = `${host}${subpath ? subpath : '/'}`;
    const clientId = sourceOptions.sp_client_id;
    const clientSecret = sourceOptions.sp_client_secret;

    if (!clientId || !clientSecret) {
      throw Error('You need to enter the client ID and client secret');
    }

    return (
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' +
      `?client_id=${clientId.value}&response_type=code` +
      `&redirect_uri=${fullUrl}oauth2/authorize`
    );
  }

  async accessDetailsFrom(authCode: string, sourceOptions: any, resetSecureData = false): Promise<object> {
    if (resetSecureData) {
      return [
        ['access_token', ''],
        ['refresh_token', ''],
      ];
    }

    let sp_client_id = '';
    let sp_client_secret = '';
    let tenant = '';

    for (const item of sourceOptions) {
      if (item.key === 'sp_client_id') {
        sp_client_id = item.value;
      }
      if (item.key === 'sp_client_secret') {
        sp_client_secret = item.value;
      }
      if (item.key === 'sp_tenant_id') {
        tenant = item.value;
      }
    }

    const accessTokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const host = process.env.TOOLJET_HOST;
    const subpath = process.env.SUB_PATH;
    const fullUrl = `${host}${subpath ? subpath : '/'}`;
    const redirectUri = `${fullUrl}oauth2/authorize`;

    const data = new URLSearchParams({
      code: authCode,
      client_id: sp_client_id,
      client_secret: sp_client_secret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      scope: 'https://graph.microsoft.com/.default+offline_access',
    });

    const authDetails = [];

    try {
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
      });

      const result = await response.json();

      if (result['access_token']) {
        authDetails.push(['access_token', result['access_token']]);
      }

      if (result['refresh_token']) {
        authDetails.push(['refresh_token', result['refresh_token']]);
      }
    } catch (error) {
      throw Error('could not connect to Sharepoint');
    }

    return authDetails;
  }

  async run(sourceOptions: SourceOptions, queryOptions: QueryOptions, dataSourceId: string): Promise<QueryResult> {
    const rootApiUrl = 'https://graph.microsoft.com/v1.0/sites';
    const accessToken = sourceOptions.access_token;
    let response = null;

    try {
      const requestOptions = await this.fetchRequestOptsForOperation(accessToken, queryOptions);
      const endpoint = requestOptions?.endpoint;
      const apiUrl = `${rootApiUrl}${endpoint}`;
      const method = requestOptions?.method;
      const header = requestOptions?.headers;
      const body = requestOptions.body || {};

      response = await fetch(apiUrl, {
        method: method,
        headers: header,
        ...(Object.keys(body).length !== 0 && { body: JSON.stringify(body) }),
      });
    } catch (error) {
      throw new QueryError('Query could not be completed', error?.message, error);
    }

    if (response.status === 204) {
      return {
        status: 'ok',
        data: {
          code: response.status,
          statusText: response.statusText,
          message: `Item having id '${queryOptions.sp_item_id}' in List '${queryOptions.sp_list_id}' has been deleted.`,
        },
      };
    }

    const data = await response.json();

    if (response.status !== 200 && response.status !== 204 && response.status !== 201) {
      if (response.status === 401 || response.status === 403) {
        throw new OAuthUnauthorizedClientError('Query could not be completed', response.statusText, data);
      } else {
        const errorMessage = data?.error?.message || 'An unknown error occurred';
        throw new QueryError('Query could not be completed', errorMessage, data?.error || {});
      }
    }

    return {
      status: 'ok',
      data: data,
    };
  }

  async fetchRequestOptsForOperation(accessToken: string, queryOptions: QueryOptions): Promise<any> {
    const {
      sp_operation,
      sp_site_id,
      sp_time_interval,
      sp_list_id,
      sp_list_name,
      sp_item_id,
      sp_list_object,
      sp_item_object,
    } = queryOptions;

    const authHeader = {
      Authorization: `Bearer ${accessToken}`,
    };

    switch (sp_operation) {
      case 'get_sites':
        return {
          method: 'GET',
          endpoint: '?search=*',
          headers: { ...authHeader },
        };
      case 'get_site':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}`,
          headers: { ...authHeader },
        };
      case 'get_analytics':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}/analytics/${sp_time_interval}`,
          headers: { ...authHeader },
        };
      case 'get_pages':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}/pages`,
          headers: { ...authHeader, 'Content-Type': 'application/json' },
        };
      case 'get_lists':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}/lists`,
          headers: { ...authHeader },
        };
      case 'get_metadata':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}/lists/${sp_list_id || sp_list_name}?expand=columns,items(expand=fields)`,
          headers: { ...authHeader },
        };
      case 'get_items':
        return {
          method: 'GET',
          endpoint: `/${sp_site_id}/lists/${sp_list_id}/items?$expand=fields`,
          headers: { ...authHeader },
        };
      case 'create_list':
        return {
          method: 'POST',
          endpoint: `/${sp_site_id}/lists`,
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.parse(sp_list_object),
        };
      case 'add_item':
        return {
          method: 'POST',
          endpoint: `/${sp_site_id}/lists/${sp_list_id}/items`,
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.parse(sp_item_object),
        };
      case 'update_item':
        return {
          method: 'PATCH',
          endpoint: `/${sp_site_id}/lists/${sp_list_id}/items/${sp_item_id}/fields`,
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.parse(sp_item_object),
        };
      case 'delete_item':
        return {
          method: 'DELETE',
          endpoint: `/${sp_site_id}/lists/${sp_list_id}/items/${sp_item_id}`,
          headers: { ...authHeader },
        };
      default:
        return { method: '', endpoint: '', headers: {}, body: {} };
    }
  }

  async refreshToken(sourceOptions) {
    if (!sourceOptions['refresh_token']) {
      throw new QueryError('Query could not be completed', 'Refresh token empty', {});
    }

    const tenant = sourceOptions.sp_tenant_id;
    const accessTokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const clientId = sourceOptions.sp_client_id;
    const clientSecret = sourceOptions.sp_client_secret;

    const data = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: sourceOptions['refresh_token'],
      scope: 'https://graph.microsoft.com/.default',
    });

    const accessTokenDetails = {};

    try {
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
      });
      const result = await response.json();

      if (result['access_token']) {
        accessTokenDetails['access_token'] = result['access_token'];
        accessTokenDetails['refresh_token'] = result['refresh_token'];
      } else {
        throw new QueryError(
          'access_token not found in the response',
          {},
          {
            responseObject: {
              statusCode: response.status,
              responseBody: result,
            },
            responseHeaders: response.headers,
          }
        );
      }
    } catch (error) {
      console.error(`Error while Sharepoint refresh token call. ${JSON.stringify(error)}`);
      throw new QueryError('could not connect to Sharepoint', JSON.stringify(error), {});
    }
    return accessTokenDetails;
  }
}