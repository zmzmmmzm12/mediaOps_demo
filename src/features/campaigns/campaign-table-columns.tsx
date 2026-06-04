/* eslint-disable react-refresh/only-export-components */
import Link from 'next/link'
import type { DataTableColumn } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCompactCurrency, formatPercent, formatRatio } from '../../lib/format'
import { campaignChannelTextMap, campaignStatusTextMap } from '../../lib/labels'
import type { Campaign, CampaignStatus } from '../../types/mediaops'

interface CampaignTableColumnOptions {
  selectedIds: string[]
  canEdit: boolean
  onToggleSelected: (campaignId: string) => void
  onPrefetch: (campaignId: string) => void
  sortBy: string
  sortDirection: string
  onSort: (field: 'revenue' | 'spend' | 'roas' | 'conversionRate') => void
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex w-full items-center justify-end gap-1 text-right font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
    >
      <span>{label}</span>
      <span className="text-[var(--text-quaternary)]">
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
}: CampaignTableColumnOptions): Array<DataTableColumn<Campaign>> {
  return [
    {
      id: 'select',
      header: '',
      className: 'w-12',
      cell: (campaign) => (
        <input
          type="checkbox"
          aria-label={`${campaign.name} 선택`}
          checked={selectedIds.includes(campaign.id)}
          disabled={!canEdit}
          onChange={() => onToggleSelected(campaign.id)}
          className="focus-ring h-4 w-4 rounded border-[var(--border-strong)] text-indigo-600"
        />
      ),
    },
    {
      id: 'campaign',
      header: '캠페인',
      cell: (campaign) => (
        <div>
          <Link
            href={`/campaigns/${campaign.id}`}
            onMouseEnter={() => onPrefetch(campaign.id)}
            onFocus={() => onPrefetch(campaign.id)}
            aria-label={`${campaign.name} 상세 보기`}
            className="focus-ring font-semibold text-[var(--text-primary)] hover:text-[var(--brand)]"
          >
            {campaign.name}
          </Link>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
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
      className: 'text-right',
      header: (
        <SortButton
          label="매출"
          active={sortBy === 'revenue'}
          direction={sortDirection}
          onClick={() => onSort('revenue')}
        />
      ),
      cell: (campaign) => formatCompactCurrency(campaign.revenue),
    },
    {
      id: 'spend',
      className: 'text-right',
      header: (
        <SortButton
          label="광고비"
          active={sortBy === 'spend'}
          direction={sortDirection}
          onClick={() => onSort('spend')}
        />
      ),
      cell: (campaign) => formatCompactCurrency(campaign.spend),
    },
    {
      id: 'roas',
      className: 'text-right',
      header: (
        <SortButton
          label="ROAS"
          active={sortBy === 'roas'}
          direction={sortDirection}
          onClick={() => onSort('roas')}
        />
      ),
      cell: (campaign) => formatRatio(campaign.roas),
    },
    {
      id: 'conversionRate',
      className: 'text-right',
      header: (
        <SortButton
          label="전환율"
          active={sortBy === 'conversionRate'}
          direction={sortDirection}
          onClick={() => onSort('conversionRate')}
        />
      ),
      cell: (campaign) => formatPercent(campaign.conversionRate),
    },
  ]
}
