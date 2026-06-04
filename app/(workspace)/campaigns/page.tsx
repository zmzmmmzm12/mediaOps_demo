import type { Metadata } from 'next'
import { CampaignsPage } from '../../../src/views/CampaignsPage'

export const metadata: Metadata = {
  title: '캠페인',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <CampaignsPage />
}
