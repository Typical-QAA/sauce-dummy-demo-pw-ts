import { expect } from '@playwright/test'
import { TAGS } from '../../data/constants'
import { test } from '../../fixtures/web'
import type { CartItemDetails, ListItemDetails } from '../../types/web'
import { verifyPageUrlAndHeaderTitle } from './helpers'

test.describe('Web Automation tests', () => {
  test.describe(``, { tag: [TAGS.DOC.DOCUMENTED, TAGS.TYPE.WEB, TAGS.STATUS.EXPECTED_TO_PASS] }, () => {
    test.beforeEach(async ({ pages, users }) => {
      const user = users.STANDARD
      // NOTE: this could be also done by setting a cookie, but I decided to explicitly navigate through the UI
      await test.step(`Login as ${user.username}`, async () => {
        await pages.login.page.goto(pages.login.URL)
        await pages.login.fillAndSubmit(user)
        await verifyPageUrlAndHeaderTitle(pages.inventory)
      })
    })

    test(`Scenario_1`, async ({ pages, testData }) => {
      const shipping = testData.createShipping()
      const invetoryPageItemsAmount = 6
      const cartItemRemoveIndex = 2
      let inventoryAllItemsAZ: ListItemDetails[]
      let cartAllItemsAfterAZ: CartItemDetails[]
      let itemRemoveName: string

      await test.step(`Add all=${invetoryPageItemsAmount} inventory items to cart`, async () => {
        inventoryAllItemsAZ = (await pages.inventory.items.allDetails()).sort((a, b) => a.name.localeCompare(b.name))
        expect(inventoryAllItemsAZ.length).toEqual(invetoryPageItemsAmount)
        await pages.inventory.addAllToCart()
      })
      await test.step(`Open cart`, async () => {
        await pages.inventory.header.headerPrimary.shoppingCart.click()
        await verifyPageUrlAndHeaderTitle(pages.cart)
      })
      await test.step(`Validate initial cart content and item count`, async () => {
        const cartAllItemsBeforeAZ = (await pages.cart.items.allDetails()).sort((a, b) => a.name.localeCompare(b.name))
        expect(cartAllItemsBeforeAZ.length).toEqual(invetoryPageItemsAmount)
        expect(cartAllItemsBeforeAZ.map(({ quantity, ...rest }) => rest)).toEqual(inventoryAllItemsAZ)
        expect(await pages.cart.header.headerPrimary.shoppingBadge.textContent()).toEqual(invetoryPageItemsAmount.toString())
      })
      await test.step(`Remove third cart item`, async () => {
        const itemRemove = pages.cart.items.itemByIndex(cartItemRemoveIndex)
        itemRemoveName = (await itemRemove.name.textContent()) ?? ''
        await itemRemove.removeButton.click()
      })
      await test.step(`Validate cart content and item count after item removal`, async () => {
        cartAllItemsAfterAZ = (await pages.cart.items.allDetails()).sort((a, b) => a.name.localeCompare(b.name))
        expect(cartAllItemsAfterAZ.length).toEqual(invetoryPageItemsAmount - 1)
        expect(await pages.cart.header.headerPrimary.shoppingBadge.textContent()).toEqual((invetoryPageItemsAmount - 1).toString())
        await expect(pages.cart.items.itemByName(itemRemoveName).name).not.toBeVisible()
      })
      await test.step(`Proceed through checkout steps`, async () => {
        await pages.cart.checkoutButton.click()
        await verifyPageUrlAndHeaderTitle(pages.checkoutOne)
        await pages.checkoutOne.fillAndSubmit(shipping)
      })
      await test.step(`Validate checkout overview items are the same as after cart removal`, async () => {
        await verifyPageUrlAndHeaderTitle(pages.checkoutTwo)
        const checkoutAllItemsAZ = (await pages.checkoutTwo.items.allDetails()).sort((a, b) => a.name.localeCompare(b.name))
        expect(checkoutAllItemsAZ).toEqual(cartAllItemsAfterAZ)
      })
      await test.step(`Finish checkout process`, async () => {
        await pages.checkoutTwo.finishButton.click()
      })
      await test.step(`Validate order confirmation`, async () => {
        await verifyPageUrlAndHeaderTitle(pages.checkoutComplete)
        await expect(pages.checkoutComplete.completeLogo).toBeVisible()
        await expect(pages.checkoutComplete.completeHeader).toHaveText(testData.checkout.SUCCESS.HEADER)
        await expect(pages.checkoutComplete.completeText).toHaveText(testData.checkout.SUCCESS.TEXT)
      })
    })

    test(`Scenario_2 - with standard_user and random item name`, async ({ pages }) => {
      const cartItemsAmount = 1
      let randomItem: ListItemDetails
      await test.step(`Open random item page from inventory page`, async () => {
        const allItems = await pages.inventory.items.allDetails()
        randomItem = allItems[Math.floor(Math.random() * allItems.length)]
        await pages.inventory.items.itemByName(randomItem.name).name.click()
      })
      await test.step(`Validate item details page`, async () => {
        await expect(pages.inventoryItem.page).toHaveURL(pages.inventoryItem.URL + randomItem.id)
        const { id, ...expecdetDetails } = randomItem
        const itemDetails = {
          name: await pages.inventoryItem.itemDetalis.name.textContent(),
          description: await pages.inventoryItem.itemDetalis.description.textContent(),
          price: await pages.inventoryItem.itemDetalis.price.textContent()
        }
        expect(itemDetails).toEqual(expecdetDetails)
      })
      await test.step(`Add item to cart`, async () => {
        await pages.inventoryItem.itemDetalis.addButton.click()
      })
      await test.step(`Open cart`, async () => {
        await pages.inventoryItem.header.headerPrimary.shoppingCart.click()
        verifyPageUrlAndHeaderTitle(pages.cart)
      })
      await test.step(`Validate cart content`, async () => {
        const cartItems = await pages.cart.items.allDetails()
        expect(cartItems.length).toEqual(cartItemsAmount)
        expect(await pages.cart.header.headerPrimary.shoppingBadge.textContent()).toEqual(cartItemsAmount.toString())
        const { quantity, ...cartItem } = cartItems[0]
        expect(cartItem).toEqual(randomItem)
      })
    })

    test(`Scenario_3`, async ({ pages, testData }) => {
      const sortingAZ = testData.sorting.az
      const sortingZA = testData.sorting.za
      let expectedAZ: string[]
      let expectedZA: string[]

      await test.step(`Sort by name Z-A on inventory page`, async () => {
        const allNames = (await pages.inventory.items.allDetails()).map(item => item.name)
        expectedAZ = [...allNames].sort((a, b) => a.localeCompare(b))
        expectedZA = [...allNames].sort((a, b) => b.localeCompare(a))
        await pages.inventory.header.headerSecondary.sortSelect.selectOption(sortingZA)
      })
      await test.step(`Validate sorted order Z-A applied on inventory page`, async () => {
        await expect(pages.inventory.header.headerSecondary.sortActive).toHaveText(sortingZA)
        const namesSorted = (await pages.inventory.items.allDetails()).map(item => item.name)
        expect(namesSorted).toEqual(expectedZA)
      })
      await test.step(`Sort by name A-Z on inventory page`, async () => {
        await pages.inventory.header.headerSecondary.sortSelect.selectOption(sortingAZ)
      })
      await test.step(`Validate sorted order A-Z applied on inventory page`, async () => {
        await expect(pages.inventory.header.headerSecondary.sortActive).toHaveText(sortingAZ)
        const namesSorted = (await pages.inventory.items.allDetails()).map(item => item.name)
        expect(namesSorted).toEqual(expectedAZ)
      })
    })
  })

  test.describe(``, { tag: [TAGS.DOC.DOCUMENTED, TAGS.TYPE.WEB, TAGS.STATUS.EXPECTED_TO_PASS] }, () => {
    test(`Scenario_4`, async ({ pages, users, testData }) => {
      const user = users.LOCKED_OUT
      const inputErrorClass = 'input_error'
      await test.step(`Log in as ${user.username}`, async () => {
        await pages.login.page.goto(pages.login.URL)
        await pages.login.fillAndSubmit(user)
      })
      await test.step(`Validate login error state`, async () => {
        await expect(pages.login.form.errorMessage).toBeVisible()
        await expect(pages.login.form.errorMessage).toHaveText(testData.errors.LOGIN_LOCKED)
        const checkElements = [pages.login.form.usernameInput, pages.login.form.passwordInput]
        for (const el of checkElements) {
          await expect(el).toContainClass(inputErrorClass)
        }
      })
    })
  })

  test.describe(``, { tag: [TAGS.DOC.DOCUMENTED, TAGS.TYPE.WEB, TAGS.STATUS.EXPECTED_TO_FAIL] }, () => {
    test(`Scenario_2 - with problem user and a random item name`, async ({ pages, users }) => {
      const cartItemsAmount = 1
      const user = users.PROBLEM
      let randomItem: ListItemDetails

      test.info().fail()

      await test.step(`Login as ${user.username}`, async () => {
        await pages.login.page.goto(pages.login.URL)
        await pages.login.fillAndSubmit(user)
        await verifyPageUrlAndHeaderTitle(pages.inventory)
      })
      await test.step(`Open item page from inventory page`, async () => {
        const allItems = await pages.inventory.items.allDetails()
        randomItem = allItems[Math.floor(Math.random() * allItems.length)]
        await pages.inventory.items.itemByName(randomItem.name).name.click()
      })
      await test.step(`Open random item page from inventory page`, async () => {
        await expect(pages.inventoryItem.page).toHaveURL(pages.inventoryItem.URL + randomItem.id)
        const { id, ...expecdetDetails } = randomItem
        const itemDetails = {
          name: await pages.inventoryItem.itemDetalis.name.textContent(),
          description: await pages.inventoryItem.itemDetalis.description.textContent(),
          price: await pages.inventoryItem.itemDetalis.price.textContent()
        }
        expect(itemDetails).toEqual(expecdetDetails)
      })
      await test.step(`Add item to cart`, async () => {
        await pages.inventoryItem.itemDetalis.addButton.click()
      })
      await test.step(`Open cart`, async () => {
        await pages.inventoryItem.header.headerPrimary.shoppingCart.click()
        verifyPageUrlAndHeaderTitle(pages.cart)
      })
      await test.step(`Validate cart content`, async () => {
        const cartItems = await pages.cart.items.allDetails()
        expect(cartItems.length).toEqual(cartItemsAmount)
        expect(await pages.cart.header.headerPrimary.shoppingBadge.textContent()).toEqual(cartItemsAmount.toString())
        const { quantity, ...cartItem } = cartItems[0]
        expect(cartItem).toEqual(randomItem)
      })
    })
  })
})
