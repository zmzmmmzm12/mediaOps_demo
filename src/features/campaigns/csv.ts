import type { Campaign } from '../../types/mediaops'

function escapeValue(value: string | number) {
  const normalized = String(value).replaceAll('"', '""')
  return `"${normalized}"`
}

export function buildCampaignCsv(campaigns: Campaign[]) {
  const headers = [
    'Campaign',
    'Client',
    'Owner',
    'Channel',
    'Region',
    'Status',
    'Priority',
    'Budget',
    'Spend',
    'CTR',
    'Conversions',
    'Start Date',
    'End Date',
  ]

  const rows = campaigns.map((campaign) => [
    campaign.name,
    campaign.channel,
    campaign.managerName,
    campaign.channel,
    campaign.status,
    campaign.priority,
    campaign.budget,
    campaign.spend,
    campaign.roas,
    campaign.conversions,
    campaign.startDate,
    campaign.endDate,
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeValue).join(','))
    .join('\n')
}
