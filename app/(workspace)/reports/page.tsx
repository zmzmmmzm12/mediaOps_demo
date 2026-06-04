import type { Metadata } from 'next'
import { ReportsPage } from '../../../src/views/ReportsPage'

export const metadata: Metadata = {
  title: '리포트',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ReportsPage />
}
