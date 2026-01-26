import type { MinimalProduct } from '../types/api'
import { ApiBase } from './base'

type RequestParams = { delay?: number | string }
type GetProductsParams = RequestParams & { limit?: number; skip?: number; select?: string }

export class ApiProducts extends ApiBase {
  private buildQueryParams(params: Record<string, any>) {
    const filtered = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
    return Object.keys(filtered).length ? filtered : undefined
  }

  async getProducts(queryParams: GetProductsParams = {}) {
    const params = this.buildQueryParams(queryParams)
    return params ? this.request.get('/products', { params }) : this.request.get('/products')
  }

  async getProduct(id: number) {
    return this.request.get(`/products/${id}`)
  }

  async patchProduct(id: number, data: MinimalProduct) {
    return this.request.patch(`/products/${id}`, { data })
  }

  async createProduct(data: MinimalProduct) {
    return this.request.post('/products/add', { data: data, headers: { 'content-type': 'application/json' } })
  }
}
