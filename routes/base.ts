import type { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiBase {
  request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  protected get(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(url, { headers });
  }
  protected post(url: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, { data: body, headers: { 'content-type': 'application/json', ...headers } });
  }
  protected put(url: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.put(url, { data: body, headers: { 'content-type': 'application/json', ...headers } });
  }
  protected patch(url: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.patch(url, { data: body, headers: { 'content-type': 'application/json', ...headers } });
  }
  protected del(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(url, { headers });
  }
}
