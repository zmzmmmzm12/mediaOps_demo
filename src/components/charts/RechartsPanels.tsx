import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  Campaign,
  DashboardStatusPoint,
  DashboardTrendPoint,
} from '../../types/mediaops'
import { formatCompactCurrency } from '../../lib/format'
import { usePreferencesStore } from '../../features/ui/preferences-store'
import { useI18n } from '../../i18n'

const channelColors = ['#4f46e5', '#818cf8', '#0f766e', '#f59e0b']
const statusColorMap = {
  active: '#4f46e5',
  paused: '#f59e0b',
  ended: '#94a3b8',
} as const

const seriesLabelKeyMap: Record<string, string> = {
  revenue: 'labels.table.revenue',
  spend: 'labels.table.spend',
  roas: 'labels.table.roas',
}

const knownChannelValues = new Set(['google', 'meta', 'naver', 'kakao'])

function formatChannelLabel(value: unknown, t: (key: string) => string) {
  const channel = String(value)
  return knownChannelValues.has(channel) ? t(`labels.channel.${channel}`) : channel
}

export const RevenueSpendTrendChart = memo(function RevenueSpendTrendChart({
  data,
}: {
  data: DashboardTrendPoint[]
}) {
  const theme = usePreferencesStore((state) => state.theme)
  const { t } = useI18n()
  const gridColor = theme === 'dark' ? '#23304a' : '#e2e8f0'
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'
  const tooltipStyle = theme === 'dark'
    ? {
        contentStyle: {
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 16,
          color: '#e2e8f0',
        },
        labelStyle: { color: '#cbd5e1' },
      }
    : {
        contentStyle: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          color: '#0f172a',
        },
        labelStyle: { color: '#475569' },
      }

  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: tickColor, fontSize: 12 }} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [
              typeof value === 'number' ? formatCompactCurrency(value) : value,
              t(seriesLabelKeyMap[String(name)] ?? String(name)),
            ]}
          />
          <Legend formatter={(value) => t(seriesLabelKeyMap[value] ?? String(value))} />
          <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="spend" stroke="#94a3b8" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

export const CampaignStatusChart = memo(function CampaignStatusChart({
  data,
}: {
  data: DashboardStatusPoint[]
}) {
  const { t } = useI18n()
  const total = data.reduce((sum, point) => sum + point.count, 0)
  let currentAngle = 0
  const gradient = total > 0
    ? data.map((point) => {
        const startAngle = currentAngle
        const endAngle = startAngle + (point.count / total) * 360
        currentAngle = endAngle
        return `${statusColorMap[point.status]} ${startAngle}deg ${endAngle}deg`
      }).join(', ')
    : 'var(--panel-muted) 0deg 360deg'

  return (
    <div className="chart-frame flex flex-col items-center justify-center gap-5">
      <div
        className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--border-subtle)]"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label={t('dashboard.statusDistribution')}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--panel-strong)]">
          <span className="numeric-value text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
            {total}
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-[var(--text-tertiary)]">
            {t('common.total')}
          </span>
        </div>
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {data.map((point) => (
          <div
            key={point.status}
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] px-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: statusColorMap[point.status] }}
              />
              <span className="truncate text-xs font-medium text-[var(--text-tertiary)]">
                {t(`labels.status.${point.status}`)}
              </span>
            </span>
            <span className="numeric-value text-sm font-semibold text-[var(--text-primary)]">
              {point.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

export const ChannelComparisonChart = memo(function ChannelComparisonChart({
  data,
}: {
  data: Array<{ channel: string; revenue: number; spend: number }>
}) {
  const theme = usePreferencesStore((state) => state.theme)
  const { t } = useI18n()
  const gridColor = theme === 'dark' ? '#23304a' : '#e2e8f0'
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="channel" tickFormatter={(value) => formatChannelLabel(value, t)} tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: tickColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
              borderRadius: 16,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            }}
            labelStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}
            formatter={(value, name, item) => [
              typeof value === 'number' ? formatCompactCurrency(value) : value,
              `${formatChannelLabel(item?.payload?.channel, t)} · ${t(seriesLabelKeyMap[String(name)] ?? String(name))}`,
            ]}
          />
          <Legend formatter={(value) => t(seriesLabelKeyMap[value] ?? String(value))} />
          <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          <Bar dataKey="spend" fill="#94a3b8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

export const RoasRankingChart = memo(function RoasRankingChart({
  data,
}: {
  data: Campaign[]
}) {
  const theme = usePreferencesStore((state) => state.theme)
  const { t } = useI18n()
  const gridColor = theme === 'dark' ? '#23304a' : '#e2e8f0'
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 5).map((campaign, index) => ({
            name: campaign.name,
            roas: campaign.roas,
            fill: channelColors[index % channelColors.length],
          }))}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis type="number" tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: tickColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
              borderRadius: 16,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            }}
            labelStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}
            formatter={(value, name) => [value, t(seriesLabelKeyMap[String(name)] ?? String(name))]}
          />
          <Bar dataKey="roas" radius={[0, 8, 8, 0]}>
            {data.slice(0, 5).map((campaign, index) => (
              <Cell key={campaign.id} fill={channelColors[index % channelColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
