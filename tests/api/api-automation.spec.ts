import type { APIResponse } from '@playwright/test'
import { expect } from '@playwright/test'
import { TAGS } from '../../data/constants'
import { test } from '../../fixtures/api'
import { isNumber } from '../../support/utils'
import type { MinimalProduct } from '../../types/api'

test.describe(`API Automation tests`, { tag: [TAGS.TYPE.API] }, () => {
  test.describe(``, { tag: [TAGS.DOC.DOCUMENTED] }, () => {
    test.describe(``, { tag: [TAGS.STATUS.EXPECTED_TO_PASS] }, () => {
      test(`Scenario_1`, { tag: [TAGS.SPEED.FAST] }, async ({ api, testData }) => {
        // NOTE: to recieve all products, otherwise only first 30 returned
        const limit = 0
        // NOTE: only recieve what is needed, let server do the lifting
        const select = 'id,title'
        let response: APIResponse
        let productsList: MinimalProduct[]
        const statusExpected = testData.status.OK
        const amountExpected = 194
        await test.step(`Send GET request to /products to retrieve all products with limit=${limit} and select=${select} parameters`, async () => {
          response = await api.products.getProducts({ limit, select })
        })
        await test.step(`Validate response status=${statusExpected} and total number=${amountExpected} of returned products`, async () => {
          expect(response.status()).toEqual(statusExpected)
          productsList = (await response.json()).products
          expect(productsList.length).toEqual(amountExpected)
        })
        await test.step(`Extract and attach titles of products with odd IDs`, async () => {
          const filteredTitles = productsList.filter(p => (p.id as number) % 2 !== 0).map(p => `id=${p.id}: title=${p.title}`)
          await test.info().attach('filtered_odd_titles', { body: JSON.stringify(filteredTitles) })
        })
      })

      test(`Scenario_2`, { tag: [TAGS.SPEED.FAST] }, async ({ api, testData }) => {
        const productNew = testData.minimalProduct()
        const statusExpected = testData.status.CREATED
        let response: APIResponse
        let product: MinimalProduct
        await test.step(`Send POST request to /products/add to create a new product`, async () => {
          response = await api.products.createProduct(productNew)
        })
        await test.step(`Validate creation response status=${statusExpected}`, async () => {
          expect(response.status()).toEqual(statusExpected)
          product = await response.json()
        })
        await test.step(`Validate created product matches request payload and has generated ID`, async () => {
          const productExpected = { ...productNew, id: product.id }
          expect(product).toEqual(productExpected)
        })
      })

      test(`Scenario_3`, async ({ api, testData }) => {
        const productId = 3
        const productNew = testData.minimalProduct()
        const statusExpected = testData.status.OK
        let responseGet: APIResponse
        let responsePatch: APIResponse
        let productGet: MinimalProduct
        let productPatch: MinimalProduct
        await test.step(`Send GET request to /products/${productId} to retrieve existing product by ID=${productId}`, async () => {
          responseGet = await api.products.getProduct(productId)
        })
        await test.step(`Validate retrieved product ID=${productId} and response status=${statusExpected}`, async () => {
          expect(responseGet.status()).toEqual(statusExpected)
          productGet = await responseGet.json()
          expect(productGet.id).toEqual(productId)
        })
        await test.step(`Send PATCH request to /products/${productId} to update product with partial payload`, async () => {
          responsePatch = await api.products.patchProduct(productId, productNew)
        })
        await test.step(`Validate update response status=${statusExpected} and product ID=${productId}`, async () => {
          expect(responsePatch.status()).toEqual(statusExpected)
          productPatch = await responsePatch.json()
          expect(productPatch.id).toEqual(productId)
        })
        await test.step(`Validate updated product preserves unchanged fields`, async () => {
          const productExpected = {
            ...productNew,
            id: productGet.id,
            category: productGet.category,
            discountPercentage: productGet.discountPercentage,
            stock: productGet.stock,
            thumbnail: productGet.thumbnail,
            rating: productGet.rating,
            images: productGet.images
          }
          expect(productPatch).toEqual(productExpected)
        })
      })
    })

    // NOTE: this is original test case implementation, all conditions under which test is supposed to fail - marked as such
    const delayResponseMs = [0, 5000, 6000]
    delayResponseMs.forEach(delayValue => {
      const elapsedTimeExpected = 1000
      const statusTag = delayValue > elapsedTimeExpected ? TAGS.STATUS.EXPECTED_TO_FAIL : TAGS.STATUS.EXPECTED_TO_PASS
      test(`Scenario_4 with original delayMs=${delayValue}`, { tag: [statusTag] }, async ({ api, testData }) => {
        const delayMaxMs = 5000
        const delayMinMs = 0
        if (delayValue > delayMaxMs || delayValue < delayMinMs || delayValue >= elapsedTimeExpected) {
          test.info().fail()
        }
        const statusExpected = testData.status.OK
        const productsAmountMin = 1
        let elapsedTimeActual: number
        let response: APIResponse
        let productsList: MinimalProduct[]
        await test.step(`Send GET request to /products with delay parameter=${delayValue} and measure response time`, async () => {
          const timerStart = Date.now()
          response = await api.products.getProducts({ delay: delayValue })
          const timerStop = Date.now()
          elapsedTimeActual = timerStop - timerStart
        })
        await test.step(`Validate successful response status=${statusExpected} and non-empty product list`, async () => {
          expect(response.status()).toEqual(statusExpected)
          productsList = (await response.json()).products
          expect(productsList.length).toBeGreaterThanOrEqual(productsAmountMin)
        })
        await test.step(`Validate response time meets fixed ≤${elapsedTimeExpected} ms requirement`, async () => {
          expect(elapsedTimeActual).toBeLessThanOrEqual(elapsedTimeExpected)
        })
      })
    })
  })

  test.describe(``, () => {
    // NOTE: this is positive case implementation based on allowed values and dynamic expictatotion
    const delayResponseAllowedMs = [0, 200, '3000', 5000]
    delayResponseAllowedMs.forEach(delayValue => {
      test(
        `Scenario_4 with allowed delayMs=${delayValue}`,
        { tag: [TAGS.DOC.NOT_DOCUMENTED, TAGS.STATUS.EXPECTED_TO_PASS] },
        async ({ api, testData }) => {
          const delayValueNum = Number(delayValue)
          const baseElapsedMs = 1000
          const elapsedTimeExpected = delayValueNum <= baseElapsedMs ? baseElapsedMs : delayValueNum + baseElapsedMs
          const statusExpected = testData.status.OK
          const productsAmountMin = 1
          let elapsedTimeActual: number
          let response: APIResponse
          let productsList: MinimalProduct[]
          await test.step(`Send GET request to /products with allowed delay parameter=${delayValue} and measure response time`, async () => {
            const timerStart = Date.now()
            response = await api.products.getProducts({ delay: delayValue })
            const timerStop = Date.now()
            elapsedTimeActual = timerStop - timerStart
          })
          await test.step(`Validate successful response status=${statusExpected} and non-empty product list`, async () => {
            expect(response.status()).toEqual(statusExpected)
            productsList = (await response.json()).products
            expect(productsList.length).toBeGreaterThanOrEqual(productsAmountMin)
          })
          await test.step(`Validate response time does not exceed dynamically calculated threshold=${elapsedTimeExpected}`, async () => {
            expect(elapsedTimeActual).toBeLessThanOrEqual(elapsedTimeExpected)
          })
        }
      )
    })

    // NOTE: this is negative case implementation based on out of boundary values
    const delayResponseNotAllowedMs = ['delay', -1, 5001]
    delayResponseNotAllowedMs.forEach(delayValue => {
      test(
        `Scenario_4 with not allowed delayMs=${delayValue}`,
        { tag: [TAGS.DOC.NOT_DOCUMENTED, TAGS.SPEED.FAST, TAGS.STATUS.EXPECTED_TO_PASS] },
        async ({ api, testData }) => {
          let response: APIResponse
          const delayMaxMs = 5000
          const delayMinMs = 0
          const statusExpected = testData.status.BAD_REQUEST
          const errorExpected = !isNumber(delayValue)
            ? testData.errors.DELAY_NOT_NUMBER
            : (delayValue as number) < delayMinMs
              ? testData.errors.DELAY_BELOW_MIN
              : (delayValue as number) > delayMaxMs
                ? testData.errors.DELAY_OVER_MAX
                : ''

          await test.step(`Send GET request to /posts with invalid delay parameter=${delayValue}`, async () => {
            response = await api.products.getProducts({ delay: delayValue })
          })
          await test.step(`Validate bad request response status=${statusExpected} and error message`, async () => {
            expect(response.status()).toEqual(statusExpected)
            const errorActual = (await response.json()).message
            expect(errorActual).toEqual(errorExpected)
          })
        }
      )
    })
  })
})
