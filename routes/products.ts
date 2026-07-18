import type { MinimalProduct } from '../types/api';
import { ApiBase } from './base';

type GetProductsOptions = { limit?: number; skip?: number; select?: string; delay?: number | string };

const productUrls = {
  list: ({ limit, skip, select, delay }: GetProductsOptions = {}) => {
    const query = new URLSearchParams();
    if (limit !== undefined) query.set('limit', String(limit));
    if (skip !== undefined) query.set('skip', String(skip));
    if (select !== undefined) query.set('select', select);
    if (delay !== undefined) query.set('delay', String(delay));
    const qs = query.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  },
  byId: (id: number) => `/products/${id}`,
  add: () => '/products/add'
} as const;

export class ApiProducts extends ApiBase {
  getProducts(options: GetProductsOptions = {}) {
    return this.get(productUrls.list(options));
  }
  getProduct(id: number) {
    return this.get(productUrls.byId(id));
  }
  patchProduct(id: number, data: MinimalProduct) {
    return this.patch(productUrls.byId(id), data);
  }
  createProduct(data: MinimalProduct) {
    return this.post(productUrls.add(), data);
  }
}
