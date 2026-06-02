import { Link } from 'react-router-dom'
import type { Campaign } from '../../types/mediaops'
import {
  formatCompactCurrency,
  formatDateRange,
  formatPercent,
  formatRatio,
} from '../../lib/format'
import {
  campaignChannelTextMap,
  campaignStatusTextMap,
  priorityTextMap,
} from '../../lib/labels'
import { usePreferencesStore } from '../../features/ui/preferences-store'
import { StatusBadge } from '../ui/StatusBadge'

interface CampaignCardProps {
  campaign: Campaign
  onPrefetch?: (campaignId: string) => void
}

export function CampaignCard({ campaign, onPrefetch }: CampaignCardProps) {
  const theme = usePreferencesStore((state) => state.theme)
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
      aria-label={`${campaign.name} 상세 보기`}
      className={`grid gap-4 rounded-[28px] border p-5 transition hover:shadow-[0_18px_60px_rgba(15,23,42,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:grid-cols-[1.3fr_0.9fr] ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900 hover:border-slate-700'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {campaign.name}
          </h3>
          <StatusBadge label={campaignStatusTextMap[campaign.status]} tone={statusTone} />
          <StatusBadge
            label={priorityTextMap[campaign.priority]}
            tone={campaign.priority === 'critical' ? 'warning' : 'neutral'}
          />
        </div>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {campaignChannelTextMap[campaign.channel]} · {campaign.managerName}
        </p>
        <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          매출: {formatCompactCurrency(campaign.revenue)}
        </p>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          운영 기간:{' '}
          {formatDateRange(campaign.startDate, campaign.endDate)}
        </p>
      </div>

      <dl className={`grid grid-cols-2 gap-4 rounded-[24px] p-4 text-sm ${theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
        <div>
          <dt className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>광고비</dt>
          <dd className={`mt-1 text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {formatCompactCurrency(campaign.spend)}
          </dd>
        </div>
        <div>
          <dt className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>예산</dt>
          <dd className={`mt-1 text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {formatCompactCurrency(campaign.budget)}
          </dd>
        </div>
        <div>
          <dt className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>ROAS</dt>
          <dd className={`mt-1 text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {formatRatio(campaign.roas)}
          </dd>
        </div>
        <div>
          <dt className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>전환율</dt>
          <dd className={`mt-1 text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {formatPercent(campaign.conversionRate)}
          </dd>
        </div>
      </dl>
    </Link>
  )
}
