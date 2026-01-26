import { expect, Locator, Page } from '@playwright/test'

type PageWithHeader = { page: Page; header: { headerSecondary: { title: Locator } }; URL: string; headerTitle: string }

export async function verifyPageUrlAndHeaderTitle(pageObject: PageWithHeader) {
  await expect(pageObject.page).toHaveURL(pageObject.URL)
  await expect(pageObject.header.headerSecondary.title).toHaveText(pageObject.headerTitle)
}
