import type { Metadata } from 'next'
import { DashboardPage } from '../../../src/views/DashboardPage'

export const metadata: Metadata = {
  title: '대시보드',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <DashboardPage />
}
