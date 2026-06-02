import type { Campaign } from '../../types/mediaops'
import {
  campaignChannelTextMap,
  campaignStatusTextMap,
  priorityTextMap,
} from '../../lib/labels'

function escapeValue(value: string | number) {
  const normalized = String(value).replaceAll('"', '""')
  return `"${normalized}"`
}

export function buildCampaignCsv(campaigns: Campaign[]) {
  const headers = [
    '캠페인명',
    '담당자',
    '채널',
    '상태',
    '우선순위',
    '예산',
    '광고비',
    '매출',
    'ROAS',
    '전환수',
    '시작일',
    '종료일',
  ]

  const rows = campaigns.map((campaign) => [
    campaign.name,
    campaign.managerName,
    campaignChannelTextMap[campaign.channel],
    campaignStatusTextMap[campaign.status],
    priorityTextMap[campaign.priority],
    campaign.budget,
    campaign.spend,
    campaign.revenue,
    campaign.roas,
    campaign.conversions,
    campaign.startDate,
    campaign.endDate,
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeValue).join(','))
    .join('\n')
}
