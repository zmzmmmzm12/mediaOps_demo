import fs from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

async function loginAsRole(
  role: 'admin' | 'manager' | 'viewer',
  page: Page,
) {
  await page.goto('/login')
  await page.getByTestId(`login-profile-${role}`).click()
  await page.getByRole('button', { name: 'Enter dashboard' }).click()
}

test('viewer sees read-only menus and cannot edit campaign state', async ({
  page,
}) => {
  await loginAsRole('viewer', page)

  await expect(
    page.getByRole('heading', { name: /Read-only performance views are current/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Campaigns/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Reports/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible()

  await page.getByRole('link', { name: /Campaigns/i }).click()
  await expect(
    page.getByText('Viewer access can explore data but cannot change campaign state.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Bulk status change' }),
  ).toHaveCount(0)
})

test('admin can save and load filter presets and download CSV', async ({
  page,
}) => {
  await loginAsRole('admin', page)
  await page.getByRole('link', { name: /Campaigns/i }).click()

  await page.getByLabel('Search campaigns').fill('Orbit')
  await page.getByLabel('Status', { exact: true }).selectOption('active')
  await page.getByLabel('Preset name').fill('Orbit Active')
  await page.getByTestId('save-preset-button').click()
  await expect(page.getByText('Saved preset "Orbit Active".')).toBeVisible()
  await page.getByLabel('Saved presets').selectOption({ label: 'Orbit Active' })

  await page.getByLabel('Search campaigns').fill('Halo')
  await page.getByTestId('load-preset-button').click()
  await expect(page.getByLabel('Search campaigns')).toHaveValue('Orbit')
  await expect(page.getByTestId('campaign-results-count')).toContainText(
    '1 campaigns match',
  )

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('download-csv-button').click(),
  ])

  expect(download.suggestedFilename()).toBe('mediaops-campaigns.csv')

  const path = await download.path()
  expect(path).not.toBeNull()

  const csv = await fs.readFile(path ?? '', 'utf8')
  expect(csv).toContain('Orbit Q3 Growth')
  expect(csv).not.toContain('Halo Streaming Launch')
})

test('admin sees optimistic status and memo updates in campaign detail', async ({
  page,
}) => {
  await loginAsRole('admin', page)
  await page.getByRole('link', { name: /Campaigns/i }).click()
  await page.getByLabel('Search campaigns').fill('Orbit')
  await page.getByRole('link', { name: /Open Orbit Q3 Growth campaign details/i }).click()

  await page.getByLabel('Campaign status').selectOption('paused')
  await page.getByRole('tab', { name: 'Memo' }).click()
  await page.getByLabel('Operations memo').fill('Updated via Playwright memo flow.')
  await page.getByRole('button', { name: 'Save memo' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Memo saved.' }).first(),
  ).toBeVisible()
})
