# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/api-automation.spec.ts >> API Automation tests >> Scenario_4 with original delayMs=5000
- Location: tests/api/api-automation.spec.ts:111:7

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1000
Received:    5065
```

# Test source

```ts
  37  |       });
  38  | 
  39  |       test(`Scenario_2`, { tag: [TAGS.SPEED.FAST] }, async ({ api, testData }) => {
  40  |         const productNew = testData.minimalProduct();
  41  |         const statusExpected = testData.status.CREATED;
  42  |         let response: APIResponse;
  43  |         let product: MinimalProduct;
  44  | 
  45  |         await test.step(`Send POST request to /products/add to create a new product`, async () => {
  46  |           response = await api.products.createProduct(productNew);
  47  |         });
  48  | 
  49  |         await test.step(`Validate creation response status=${statusExpected}`, async () => {
  50  |           expect(response.status()).toEqual(statusExpected);
  51  |           product = await response.json();
  52  |         });
  53  | 
  54  |         await test.step(`Validate created product matches request payload and has generated ID`, async () => {
  55  |           const productExpected = { ...productNew, id: product.id };
  56  |           expect(product).toEqual(productExpected);
  57  |         });
  58  |       });
  59  | 
  60  |       test(`Scenario_3`, async ({ api, testData }) => {
  61  |         const productId = 3;
  62  |         const productNew = testData.minimalProduct();
  63  |         const statusExpected = testData.status.OK;
  64  |         let responseGet: APIResponse;
  65  |         let responsePatch: APIResponse;
  66  |         let productGet: MinimalProduct;
  67  |         let productPatch: MinimalProduct;
  68  | 
  69  |         await test.step(`Send GET request to /products/${productId} to retrieve existing product by ID=${productId}`, async () => {
  70  |           responseGet = await api.products.getProduct(productId);
  71  |         });
  72  | 
  73  |         await test.step(`Validate retrieved product ID=${productId} and response status=${statusExpected}`, async () => {
  74  |           expect(responseGet.status()).toEqual(statusExpected);
  75  |           productGet = await responseGet.json();
  76  |           expect(productGet.id).toEqual(productId);
  77  |         });
  78  | 
  79  |         await test.step(`Send PATCH request to /products/${productId} to update product with partial payload`, async () => {
  80  |           responsePatch = await api.products.patchProduct(productId, productNew);
  81  |         });
  82  | 
  83  |         await test.step(`Validate update response status=${statusExpected} and product ID=${productId}`, async () => {
  84  |           expect(responsePatch.status()).toEqual(statusExpected);
  85  |           productPatch = await responsePatch.json();
  86  |           expect(productPatch.id).toEqual(productId);
  87  |         });
  88  | 
  89  |         await test.step(`Validate updated product preserves unchanged fields`, async () => {
  90  |           const productExpected = {
  91  |             ...productNew,
  92  |             id: productGet.id,
  93  |             category: productGet.category,
  94  |             discountPercentage: productGet.discountPercentage,
  95  |             stock: productGet.stock,
  96  |             thumbnail: productGet.thumbnail,
  97  |             rating: productGet.rating,
  98  |             images: productGet.images
  99  |           };
  100 |           expect(productPatch).toEqual(productExpected);
  101 |         });
  102 |       });
  103 |     });
  104 | 
  105 |     // NOTE: this is original test case implementation, all conditions under which test is supposed to fail - marked as such
  106 |     const delayResponseMs = [0, 5000, 6000];
  107 |     delayResponseMs.forEach(delayValue => {
  108 |       const elapsedTimeExpected = 1000;
  109 |       const statusTag = delayValue > elapsedTimeExpected ? TAGS.STATUS.EXPECTED_TO_FAIL : TAGS.STATUS.EXPECTED_TO_PASS;
  110 | 
  111 |       test(`Scenario_4 with original delayMs=${delayValue}`, { tag: [statusTag] }, async ({ api, testData }) => {
  112 |         const delayMaxMs = 5000;
  113 |         const delayMinMs = 0;
  114 |         if (delayValue > delayMaxMs || delayValue < delayMinMs || delayValue >= elapsedTimeExpected) {
  115 |           test.info().fail();
  116 |         }
  117 |         const statusExpected = testData.status.OK;
  118 |         const productsAmountMin = 1;
  119 |         let elapsedTimeActual: number;
  120 |         let response: APIResponse;
  121 |         let productsList: MinimalProduct[];
  122 | 
  123 |         await test.step(`Send GET request to /products with delay parameter=${delayValue} and measure response time`, async () => {
  124 |           const timerStart = Date.now();
  125 |           response = await api.products.getProducts({ delay: delayValue });
  126 |           const timerStop = Date.now();
  127 |           elapsedTimeActual = timerStop - timerStart;
  128 |         });
  129 | 
  130 |         await test.step(`Validate successful response status=${statusExpected} and non-empty product list`, async () => {
  131 |           expect(response.status()).toEqual(statusExpected);
  132 |           productsList = (await response.json()).products;
  133 |           expect(productsList.length).toBeGreaterThanOrEqual(productsAmountMin);
  134 |         });
  135 | 
  136 |         await test.step(`Validate response time meets fixed ≤${elapsedTimeExpected} ms requirement`, async () => {
> 137 |           expect(elapsedTimeActual).toBeLessThanOrEqual(elapsedTimeExpected);
      |                                     ^ Error: expect(received).toBeLessThanOrEqual(expected)
  138 |         });
  139 |       });
  140 |     });
  141 |   });
  142 | 
  143 |   test.describe(``, () => {
  144 |     // NOTE: this is positive case implementation based on allowed values and dynamic expictatotion
  145 |     const delayResponseAllowedMs = [0, 200, '3000', 5000];
  146 |     delayResponseAllowedMs.forEach(delayValue => {
  147 |       test(
  148 |         `Scenario_4 with allowed delayMs=${delayValue}`,
  149 |         { tag: [TAGS.DOC.NOT_DOCUMENTED, TAGS.STATUS.EXPECTED_TO_PASS] },
  150 |         async ({ api, testData }) => {
  151 |           const delayValueNum = Number(delayValue);
  152 |           const baseElapsedMs = 1000;
  153 |           const elapsedTimeExpected = delayValueNum <= baseElapsedMs ? baseElapsedMs : delayValueNum + baseElapsedMs;
  154 |           const statusExpected = testData.status.OK;
  155 |           const productsAmountMin = 1;
  156 |           let elapsedTimeActual: number;
  157 |           let response: APIResponse;
  158 |           let productsList: MinimalProduct[];
  159 | 
  160 |           await test.step(`Send GET request to /products with allowed delay parameter=${delayValue} and measure response time`, async () => {
  161 |             const timerStart = Date.now();
  162 |             response = await api.products.getProducts({ delay: delayValue });
  163 |             const timerStop = Date.now();
  164 |             elapsedTimeActual = timerStop - timerStart;
  165 |           });
  166 | 
  167 |           await test.step(`Validate successful response status=${statusExpected} and non-empty product list`, async () => {
  168 |             expect(response.status()).toEqual(statusExpected);
  169 |             productsList = (await response.json()).products;
  170 |             expect(productsList.length).toBeGreaterThanOrEqual(productsAmountMin);
  171 |           });
  172 | 
  173 |           await test.step(`Validate response time does not exceed dynamically calculated threshold=${elapsedTimeExpected}`, async () => {
  174 |             expect(elapsedTimeActual).toBeLessThanOrEqual(elapsedTimeExpected);
  175 |           });
  176 |         }
  177 |       );
  178 |     });
  179 | 
  180 |     // NOTE: this is negative case implementation based on out of boundary values
  181 |     const delayResponseNotAllowedMs = ['delay', -1, 5001];
  182 |     delayResponseNotAllowedMs.forEach(delayValue => {
  183 |       test(
  184 |         `Scenario_4 with not allowed delayMs=${delayValue}`,
  185 |         { tag: [TAGS.DOC.NOT_DOCUMENTED, TAGS.SPEED.FAST, TAGS.STATUS.EXPECTED_TO_PASS] },
  186 |         async ({ api, testData }) => {
  187 |           let response: APIResponse;
  188 |           const delayMaxMs = 5000;
  189 |           const delayMinMs = 0;
  190 |           const statusExpected = testData.status.BAD_REQUEST;
  191 |           const errorExpected = !isNumber(delayValue)
  192 |             ? testData.errors.DELAY_NOT_NUMBER
  193 |             : (delayValue as number) < delayMinMs
  194 |               ? testData.errors.DELAY_BELOW_MIN
  195 |               : (delayValue as number) > delayMaxMs
  196 |                 ? testData.errors.DELAY_OVER_MAX
  197 |                 : '';
  198 | 
  199 |           await test.step(`Send GET request to /posts with invalid delay parameter=${delayValue}`, async () => {
  200 |             response = await api.products.getProducts({ delay: delayValue });
  201 |           });
  202 | 
  203 |           await test.step(`Validate bad request response status=${statusExpected} and error message`, async () => {
  204 |             expect(response.status()).toEqual(statusExpected);
  205 |             const errorActual = (await response.json()).message;
  206 |             expect(errorActual).toEqual(errorExpected);
  207 |           });
  208 |         }
  209 |       );
  210 |     });
  211 |   });
  212 | });
  213 | 
```