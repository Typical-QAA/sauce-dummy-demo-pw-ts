import type { APIRequestContext } from '@playwright/test'

export class ApiBase {
  request: APIRequestContext

  constructor(request: APIRequestContext) {
    this.request = request
  }
}
