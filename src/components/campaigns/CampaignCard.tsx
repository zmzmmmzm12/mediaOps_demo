import Link from 'next/link'
import type { Campaign } from '../../types/mediaops'
import {
  formatCompactCurrency,
  formatDateRange,
  formatPercent,
  formatRatio,
} from '../../lib/format'
import { StatusBadge } from '../ui/StatusBadge'
import { useI18n } from '../../i18n'

interface CampaignCardProps {
  campaign: Campaign
  onPrefetch?: (campaignId: string) => void
}

export function CampaignCard({ campaign, onPrefetch }: CampaignCardProps) {
  const { t } = useI18n()
  const statusTone =
    campaign.status === 'active'
      ? 'positive'
      : campaign.status === 'paused'
        ? 'warning'
        : 'neutral'

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      onMouseEnter={() => onPrefetch?.(campaign.id)}
      onFocus={() => onPrefetch?.(campaign.id)}
      aria-label={`${campaign.name} ${t('detail.eyebrow')}`}
      className="focus-ring grid min-w-0 gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-bg)] p-4 transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] lg:grid-cols-[1.3fr_0.9fr]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="min-w-0 text-[clamp(1.35rem,5vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            {campaign.name}
          </h3>
          <StatusBadge label={t(`labels.status.${campaign.status}`)} tone={statusTone} />
          <StatusBadge
            label={t(`labels.priority.${campaign.priority}`)}
            tone={campaign.priority === 'critical' ? 'warning' : 'neutral'}
          />
        </div>
        <p className="mt-2 text-sm text-[var(--text-tertiary)]">
          {t(`labels.channel.${campaign.channel}`)} · {campaign.managerName}
        </p>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          {t('labels.table.revenue')}: {formatCompactCurrency(campaign.revenue)}
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          운영 기간: {formatDateRange(campaign.startDate, campaign.endDate)}
        </p>
      </div>

      <dl className="surface-muted grid min-w-0 grid-cols-1 gap-4 p-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-[var(--text-tertiary)]">{t('labels.table.spend')}</dt>
          <dd className="numeric-value mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {formatCompactCurrency(campaign.spend)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[var(--text-tertiary)]">{t('labels.table.budget')}</dt>
          <dd className="numeric-value mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {formatCompactCurrency(campaign.budget)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[var(--text-tertiary)]">ROAS</dt>
          <dd className="numeric-value mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {formatRatio(campaign.roas)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[var(--text-tertiary)]">{t('labels.table.conversionRate')}</dt>
          <dd className="numeric-value mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {formatPercent(campaign.conversionRate)}
          </dd>
        </div>
      </dl>
    </Link>
  )
}
