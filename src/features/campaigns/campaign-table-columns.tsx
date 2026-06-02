/* eslint-disable react-refresh/only-export-components */
import { Link } from 'react-router-dom'
import type { DataTableColumn } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCompactCurrency, formatPercent, formatRatio } from '../../lib/format'
import { campaignChannelTextMap, campaignStatusTextMap } from '../../lib/labels'
import type { Campaign, CampaignStatus } from '../../types/mediaops'

type ThemeMode = 'light' | 'dark'

interface CampaignTableColumnOptions {
  selectedIds: string[]
  canEdit: boolean
  onToggleSelected: (campaignId: string) => void
  onPrefetch: (campaignId: string) => void
  sortBy: string
  sortDirection: string
  onSort: (field: 'revenue' | 'spend' | 'roas' | 'conversionRate') => void
  theme: ThemeMode
}

function SortButton({
  label,
  active,
  direction,
  onClick,
  theme,
}: {
  label: string
  active: boolean
  direction: string
  onClick: () => void
  theme: ThemeMode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-left font-semibold ${
        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
      }`}
    >
      <span>{label}</span>
      <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
        {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  )
}

function mapStatusTone(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'positive'
    case 'paused':
      return 'warning'
    case 'ended':
      return 'neutral'
  }
}

export function createCampaignTableColumns({
  selectedIds,
  canEdit,
  onToggleSelected,
  onPrefetch,
  sortBy,
  sortDirection,
  onSort,
  theme,
}: CampaignTableColumnOptions): Array<DataTableColumn<Campaign>> {
  return [
    {
      id: 'select',
      header: '',
      cell: (campaign) => (
        <input
          type="checkbox"
          aria-label={`${campaign.name} 선택`}
          checked={selectedIds.includes(campaign.id)}
          disabled={!canEdit}
          onChange={() => onToggleSelected(campaign.id)}
        />
      ),
    },
    {
      id: 'campaign',
      header: '캠페인',
      cell: (campaign) => (
        <div>
          <Link
            to={`/campaigns/${campaign.id}`}
            onMouseEnter={() => onPrefetch(campaign.id)}
            onFocus={() => onPrefetch(campaign.id)}
            aria-label={`${campaign.name} 상세 보기`}
            className={`font-semibold underline underline-offset-4 ${
              theme === 'dark'
                ? 'text-slate-100 decoration-slate-700'
                : 'text-slate-950 decoration-slate-200'
            }`}
          >
            {campaign.name}
          </Link>
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {campaignChannelTextMap[campaign.channel]} · {campaign.managerName}
          </p>
        </div>
      ),
    },
    {
      id: 'status',
      header: '상태',
      cell: (campaign) => (
        <StatusBadge label={campaignStatusTextMap[campaign.status]} tone={mapStatusTone(campaign.status)} />
      ),
    },
    {
      id: 'revenue',
      header: (
        <SortButton
          label="매출"
          active={sortBy === 'revenue'}
          direction={sortDirection}
          onClick={() => onSort('revenue')}
          theme={theme}
        />
      ),
      cell: (campaign) => formatCompactCurrency(campaign.revenue),
    },
    {
      id: 'spend',
      header: (
        <SortButton
          label="광고비"
          active={sortBy === 'spend'}
          direction={sortDirection}
          onClick={() => onSort('spend')}
          theme={theme}
        />
      ),
      cell: (campaign) => formatCompactCurrency(campaign.spend),
    },
    {
      id: 'roas',
      header: (
        <SortButton
          label="ROAS"
          active={sortBy === 'roas'}
          direction={sortDirection}
          onClick={() => onSort('roas')}
          theme={theme}
        />
      ),
      cell: (campaign) => formatRatio(campaign.roas),
    },
    {
      id: 'conversionRate',
      header: (
        <SortButton
          label="전환율"
          active={sortBy === 'conversionRate'}
          direction={sortDirection}
          onClick={() => onSort('conversionRate')}
          theme={theme}
        />
      ),
      cell: (campaign) => formatPercent(campaign.conversionRate),
    },
  ]
}
