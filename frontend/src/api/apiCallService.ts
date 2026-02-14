import { toast } from 'react-toastify';
import * as constants from '../utils/constants';
import GlobalValidations from '../utils/validations';
import * as apiEndpoints from './apiEndPoints';
import axios from 'axios';
import { getAuth } from '../app/auth';

class APICallService {
  public url: string;
  public apiType: string | string[];
  public apiName: string | string[];
  public params: unknown;
  public path: unknown;
  public listApi: string[];
  public settings!: Record<string, unknown>;
  public type?: unknown;

  constructor(apiname: string | string[], params?: unknown, path?: unknown, type?: unknown) {
    this.url = constants.BASE_URL;
    if (Array.isArray(apiname)) {
      this.apiType = [];
      this.apiName = [];
      this.params = [];
      this.path = [];
      this.type = [];
      apiname.forEach((item: string, index: number) => {
        const arr = item.toString().split(' ');
        (this.apiType as string[])[index] = arr[1];
        (this.apiName as string[])[index] = arr[0];
        (this.params as unknown[])[index] = params?.[index as keyof typeof params];
        (this.path as unknown[])[index] = path?.[index as keyof typeof path];
        (this.type as unknown[])[index] = path?.[index as keyof typeof path];
      });
    } else {
      const arr = apiname.toString().split(' ');
      this.apiType = arr[1];
      this.apiName = arr[0];
      this.params = params;
      this.path = path;
      this.type = type;
    }
    this.listApi = [apiEndpoints.LOGIN];
  }

  async findSettings(
    apiName: string | string[],
    apiType: string | string[],
    params: unknown,
    path: unknown,
    type?: unknown
  ): Promise<Record<string, unknown>> {
    const baseName = Array.isArray(apiName) ? apiName[0] : apiName;
    const resourceURL = `${this.url}${baseName}`;
    let myHeaders: Record<string, string> = {
      'ngrok-skip-browser-warning': '69420',
    };
    try {
      const mainAPIName = Array.isArray(apiName)
        ? `${apiName[0]} ${apiType[0]}`
        : `${apiName} ${apiType}`;
      const token = getAuth();
      if (!this.listApi.includes(mainAPIName) && token) {
        myHeaders = { ...myHeaders, Authorization: `Bearer ${token}` };
      }
    } catch (e) {
      console.warn('Auth token error', e);
    }
    myHeaders = { ...myHeaders, platform: 'web', appVersion: '1.0' };
    const settings: Record<string, unknown> = {
      redirect: 'follow',
      url: resourceURL,
      headers: myHeaders,
      method: '',
      responseType: type,
      timeout: 600000,
      data: {},
    };

    const apiT = Array.isArray(apiType) ? apiType[0] : apiType;
    const p = Array.isArray(params) ? params[0] : params;
    const pathVal = Array.isArray(path) ? path[0] : path;

    switch (apiT) {
      case constants.GET:
        settings.method = 'GET';
        break;
      case constants.GET_ID_PARAMS:
        settings.method = 'GET';
        (settings as { url: string }).url = `${resourceURL}/${p}`;
        break;
      case constants.GET_URL_PARAMS:
        settings.method = 'GET';
        (settings as { url: string }).url = `${resourceURL}?${this.objToQueryString(p as Record<string, unknown>)}`;
        if (p && typeof p === 'object' && 'pageNo' in p) {
          const pr = p as Record<string, unknown>;
          (settings as { url: string }).url = `${resourceURL}?${this.objToQueryString({
            ...pr,
            skip: (parseInt(String(pr.pageNo)) * parseInt(String(pr.limit)) - parseInt(String(pr.limit))) || 0,
            limit: pr.limit,
            searchTerm: pr.searchTerm ? pr.searchTerm : '',
          })}`;
        }
        break;
      case constants.GET_URL_ID_PARAMS:
        (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}`;
        settings.method = 'GET';
        if (p && typeof p === 'object' && 'pageNo' in p) {
          const pr = p as Record<string, unknown>;
          (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}?${this.objToQueryString({
            ...pr,
            skip: (parseInt(String(pr.pageNo)) * parseInt(String(pr.limit)) - parseInt(String(pr.limit))) || 0,
            limit: pr.limit,
            searchTerm: pr.searchTerm ? pr.searchTerm : '',
          })}`;
        }
        break;
      case constants.POST_RAW:
        myHeaders = { ...myHeaders, 'Content-Type': 'application/json' };
        settings.headers = myHeaders;
        settings.method = 'POST';
        settings.data = JSON.stringify(p);
        break;
      case constants.POST_FORM:
        settings.method = 'POST';
        settings.data = p;
        break;
      case constants.POST_ID_PARAMS:
        (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}`;
        settings.method = 'POST';
        settings.data = p;
        break;
      case constants.PATCH:
        myHeaders = { ...myHeaders, 'Content-Type': 'application/json' };
        settings.headers = myHeaders;
        settings.method = 'PATCH';
        settings.data = JSON.stringify(p);
        break;
      case constants.PATCH_ID:
        (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}`;
        myHeaders = { ...myHeaders, 'Content-Type': 'application/json' };
        settings.headers = myHeaders;
        settings.method = 'PATCH';
        settings.data = p;
        break;
      case constants.PATCH_FORM_ID:
        (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}`;
        settings.method = 'PATCH';
        settings.data = this.objToFormData(p as Record<string, unknown>);
        break;
      case constants.MULTI_PART_ID_PATCH:
        (settings as { url: string }).url = `${resourceURL}/${this.objToUrlParams(pathVal as Record<string, unknown>)}`;
        settings.method = 'PATCH';
        settings.data = p;
        break;
      case constants.DELETE_ID_PARAMS:
        settings.method = 'DELETE';
        (settings as { url: string }).url = `${resourceURL}/${p}`;
        break;
      case constants.DELETE_URL_PARAMS:
        settings.method = 'DELETE';
        (settings as { url: string }).url = `${resourceURL}?${this.objToQueryString(p as Record<string, unknown>)}`;
        break;
      default:
        settings.method = 'GET';
    }
    return settings;
  }

  objToQueryString = (obj: Record<string, unknown>): string =>
    Object.entries(obj)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

  objToUrlParams = (obj: Record<string, unknown>): string => Object.values(obj).join('/');

  objToFormData = (obj: Record<string, unknown>): FormData => {
    const form = new FormData();
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        form.append(key, obj[key] as Blob);
      }
    }
    return form;
  };

  async callAPI(): Promise<unknown> {
    const online = await GlobalValidations.checkNetConnection();
    if (!online) {
      (window as unknown as { location: string }).location = `${window.location.protocol}//${window.location.host}/error/network`;
      return 0;
    }
    this.settings = await this.findSettings(
      this.apiName,
      this.apiType,
      this.params,
      this.path,
      this.type
    );
    const opts = this.settings as {
      url: string;
      headers?: Record<string, string>;
      method: string;
      data?: unknown;
      responseType?: 'json' | 'blob' | 'arraybuffer' | 'document' | 'text' | 'stream';
      timeout?: number;
    };
    return axios(opts.url, {
      method: opts.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      headers: opts.headers,
      data: opts.data,
      ...(opts.responseType && { responseType: opts.responseType }),
      timeout: opts.timeout,
    })
      .then((res: { data?: unknown }) => (res.data != null ? res.data : 1))
      .catch((err: { response?: { status?: number; data?: { error?: string } } }) => {
        if (err?.response?.status === constants.ResponseFail) {
          toast.error(err?.response?.data?.error ?? 'Request failed', {
            autoClose: 2000,
            theme: 'colored',
          });
          return 0;
        }
        if (err?.response?.status === constants.AuthError) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = `${window.location.origin}/login`;
        } else {
          window.location.href = `${window.location.origin}/error/network`;
        }
        return 0;
      });
  }
}

export default APICallService;
