import { test as testBase } from '@playwright/test'
import { createMinimalProduct } from '../../data/api/factories'
import { ERRORS, HTTP_STATUS } from '../../data/api/static'
import { ApiProducts } from '../../routes'

export type AllFixtures = {
  api: { products: ApiProducts }
  testData: { status: typeof HTTP_STATUS; minimalProduct: typeof createMinimalProduct; errors: typeof ERRORS }
}

export const test = testBase.extend<AllFixtures>({
  api: async ({ request }, use) => {
    const apiFixtures = { products: new ApiProducts(request) }
    await use(apiFixtures)
  },
  testData: [
    async ({}, use) => {
      const dataFixtures = { status: HTTP_STATUS, minimalProduct: createMinimalProduct, errors: ERRORS }
      await use(dataFixtures)
    },
    { box: true }
  ]
})
