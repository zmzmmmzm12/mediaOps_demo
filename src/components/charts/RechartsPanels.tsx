import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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
import {
  campaignChannelTextMap,
  campaignStatusTextMap,
} from '../../lib/labels'

const channelColors = ['#4f46e5', '#818cf8', '#0f766e', '#f59e0b']
const statusColorMap = {
  active: '#4f46e5',
  paused: '#f59e0b',
  ended: '#94a3b8',
} as const

const seriesLabelMap: Record<string, string> = {
  revenue: '매출',
  spend: '광고비',
  roas: 'ROAS',
}

export const RevenueSpendTrendChart = memo(function RevenueSpendTrendChart({
  data,
}: {
  data: DashboardTrendPoint[]
}) {
  const theme = usePreferencesStore((state) => state.theme)
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
              seriesLabelMap[String(name)] ?? name,
            ]}
          />
          <Legend formatter={(value) => seriesLabelMap[value] ?? value} />
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
  const theme = usePreferencesStore((state) => state.theme)
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            outerRadius={100}
            innerRadius={56}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={statusColorMap[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
              borderRadius: 16,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            }}
            labelStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}
            formatter={(value, name) => [value, campaignStatusTextMap[String(name) as keyof typeof campaignStatusTextMap] ?? name]}
          />
          <Legend formatter={(value) => campaignStatusTextMap[value as keyof typeof campaignStatusTextMap] ?? value} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})

export const ChannelComparisonChart = memo(function ChannelComparisonChart({
  data,
}: {
  data: Array<{ channel: string; revenue: number; spend: number }>
}) {
  const theme = usePreferencesStore((state) => state.theme)
  const gridColor = theme === 'dark' ? '#23304a' : '#e2e8f0'
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="channel" tickFormatter={(value) => campaignChannelTextMap[value as keyof typeof campaignChannelTextMap] ?? value} tick={{ fill: tickColor, fontSize: 12 }} />
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
              `${campaignChannelTextMap[String(item?.payload?.channel) as keyof typeof campaignChannelTextMap] ?? item?.payload?.channel} · ${seriesLabelMap[String(name)] ?? name}`,
            ]}
          />
          <Legend formatter={(value) => seriesLabelMap[value] ?? value} />
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
            formatter={(value, name) => [value, seriesLabelMap[String(name)] ?? name]}
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
