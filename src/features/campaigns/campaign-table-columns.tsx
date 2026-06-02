/* eslint-disable react-refresh/only-export-components */
import { Link } from 'react-router-dom'
import type { DataTableColumn } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCompactCurrency, formatPercent, formatRatio } from '../../lib/format'
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
      className="inline-flex items-center gap-1 text-left font-semibold text-slate-700"
    >
      <span>{label}</span>
      <span className="text-slate-400">{active ? (direction === 'asc' ? '↑' : '↓') : '↕'}</span>
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
      cell: (campaign) => (
        <input
          type="checkbox"
          aria-label={`Select ${campaign.name}`}
          checked={selectedIds.includes(campaign.id)}
          disabled={!canEdit}
          onChange={() => onToggleSelected(campaign.id)}
        />
      ),
    },
    {
      id: 'campaign',
      header: 'Campaign',
      cell: (campaign) => (
        <div>
          <Link
            to={`/campaigns/${campaign.id}`}
            onMouseEnter={() => onPrefetch(campaign.id)}
            onFocus={() => onPrefetch(campaign.id)}
            aria-label={`Open ${campaign.name} campaign details`}
            className="font-semibold text-slate-950 underline decoration-slate-200 underline-offset-4"
          >
            {campaign.name}
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            {campaign.channel} · {campaign.managerName}
          </p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (campaign) => (
        <StatusBadge label={campaign.status} tone={mapStatusTone(campaign.status)} />
      ),
    },
    {
      id: 'revenue',
      header: (
        <SortButton
          label="Revenue"
          active={sortBy === 'revenue'}
          direction={sortDirection}
          onClick={() => onSort('revenue')}
        />
      ),
      cell: (campaign) => formatCompactCurrency(campaign.revenue),
    },
    {
      id: 'spend',
      header: (
        <SortButton
          label="Spend"
          active={sortBy === 'spend'}
          direction={sortDirection}
          onClick={() => onSort('spend')}
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
        />
      ),
      cell: (campaign) => formatRatio(campaign.roas),
    },
    {
      id: 'conversionRate',
      header: (
        <SortButton
          label="CVR"
          active={sortBy === 'conversionRate'}
          direction={sortDirection}
          onClick={() => onSort('conversionRate')}
        />
      ),
      cell: (campaign) => formatPercent(campaign.conversionRate),
    },
  ]
}
