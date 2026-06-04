import type { Metadata } from 'next'
import { CampaignDetailPage } from '../../../../src/views/CampaignDetailPage'

export const metadata: Metadata = {
  title: '캠페인 상세',
  robots: { index: false, follow: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  return <CampaignDetailPage campaignId={campaignId} />
}
