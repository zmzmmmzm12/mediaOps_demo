import { Link } from 'react-router-dom'
import type { Campaign } from '../../types/mediaops'
import {
  formatCompactCurrency,
  formatDateRange,
  formatPercent,
  formatRatio,
} from '../../lib/format'
import { StatusBadge } from '../ui/StatusBadge'

interface CampaignCardProps {
  campaign: Campaign
  onPrefetch?: (campaignId: string) => void
}

export function CampaignCard({ campaign, onPrefetch }: CampaignCardProps) {
  const statusTone =
    campaign.status === 'active'
      ? 'positive'
      : campaign.status === 'paused'
        ? 'warning'
        : 'neutral'

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      onMouseEnter={() => onPrefetch?.(campaign.id)}
      onFocus={() => onPrefetch?.(campaign.id)}
      aria-label={`Open ${campaign.name} campaign details`}
      className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_18px_60px_rgba(15,23,42,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:grid-cols-[1.3fr_0.9fr]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-semibold text-slate-950">
            {campaign.name}
          </h3>
          <StatusBadge label={campaign.status} tone={statusTone} />
          <StatusBadge
            label={campaign.priority}
            tone={campaign.priority === 'critical' ? 'warning' : 'neutral'}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {campaign.channel} · {campaign.managerName}
        </p>
        <p className="mt-4 text-sm text-slate-600">
          Revenue: {formatCompactCurrency(campaign.revenue)}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Flight:{' '}
          {formatDateRange(campaign.startDate, campaign.endDate)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-[24px] bg-slate-50 p-4 text-sm">
        <div>
          <dt className="text-slate-500">Spend</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">
            {formatCompactCurrency(campaign.spend)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Budget</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">
            {formatCompactCurrency(campaign.budget)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">ROAS</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">
            {formatRatio(campaign.roas)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">CVR</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">
            {formatPercent(campaign.conversionRate)}
          </dd>
        </div>
      </dl>
    </Link>
  )
}
