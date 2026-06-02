import fs from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

async function loginAsRole(
  role: 'admin' | 'manager' | 'viewer',
  page: Page,
) {
  await page.goto('/login')
  await page.getByTestId(`login-profile-${role}`).click()
  await page.getByRole('button', { name: '대시보드 입장' }).click()
}

test('조회 전용 계정은 읽기 전용 메뉴만 보고 상태를 수정할 수 없다', async ({
  page,
}) => {
  await loginAsRole('viewer', page)

  await expect(
    page.getByRole('heading', { name: /최신 기준의 성과 현황을 읽기 전용으로 확인할 수 있습니다/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /^캠페인/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /^리포트/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /^설정/ })).toBeVisible()

  await page.getByRole('link', { name: /^캠페인/ }).click()
  await expect(
    page.getByText('조회 전용 계정은 데이터를 확인할 수 있지만 상태 변경은 할 수 없습니다.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '일괄 상태 변경' }),
  ).toHaveCount(0)
})

test('관리자 계정은 필터 프리셋을 저장하고 불러오며 CSV를 다운로드할 수 있다', async ({
  page,
}) => {
  await loginAsRole('admin', page)
  await page.getByRole('link', { name: /캠페인/i }).click()

  await page.getByLabel('캠페인 검색').fill('오르빗')
  await page.getByLabel('상태', { exact: true }).selectOption('active')
  await page.getByLabel('프리셋 이름').fill('오르빗 운영 중')
  await page.getByTestId('save-preset-button').click()
  await expect(page.getByText('"오르빗 운영 중" 프리셋을 저장했습니다.')).toBeVisible()
  await page.getByLabel('저장된 프리셋').selectOption({ label: '오르빗 운영 중' })

  await page.getByLabel('캠페인 검색').fill('헤일로')
  await page.getByTestId('load-preset-button').click()
  await expect(page.getByLabel('캠페인 검색')).toHaveValue('오르빗')
  await expect(page.getByTestId('campaign-results-count')).toContainText(
    '1개',
  )

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('download-csv-button').click(),
  ])

  expect(download.suggestedFilename()).toBe('mediaops-campaigns.csv')

  const path = await download.path()
  expect(path).not.toBeNull()

  const csv = await fs.readFile(path ?? '', 'utf8')
  expect(csv).toContain('오르빗 3분기 성장')
  expect(csv).not.toContain('헤일로 스트리밍 런칭')
})

test('관리자 계정은 캠페인 상세에서 상태와 메모 낙관적 업데이트를 확인할 수 있다', async ({
  page,
}) => {
  await loginAsRole('admin', page)
  await page.getByRole('link', { name: /캠페인/i }).click()
  await page.getByLabel('캠페인 검색').fill('오르빗')
  await page.getByRole('link', { name: /오르빗 3분기 성장 상세 보기/i }).click()

  await page.getByLabel('캠페인 상태').selectOption('paused')
  await page.getByRole('tab', { name: '메모' }).click()
  await page.getByLabel('운영 메모').fill('Playwright 메모 저장 테스트')
  await page.getByRole('button', { name: '메모 저장' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: '메모를 저장했습니다.' }).first(),
  ).toBeVisible()
})
