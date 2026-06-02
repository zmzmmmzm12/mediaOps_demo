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

const channelColors = ['#0f766e', '#f97316', '#1d4ed8', '#7c3aed']
const statusColorMap = {
  active: '#0f766e',
  paused: '#f97316',
  ended: '#64748b',
} as const

export const RevenueSpendTrendChart = memo(function RevenueSpendTrendChart({
  data,
}: {
  data: DashboardTrendPoint[]
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number' ? formatCompactCurrency(value) : value
            }
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="spend" stroke="#f97316" strokeWidth={3} dot={false} />
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
  return (
    <div className="h-72 w-full">
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
          <Tooltip />
          <Legend />
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
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="channel" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number' ? formatCompactCurrency(value) : value
            }
          />
          <Legend />
          <Bar dataKey="revenue" fill="#0f766e" radius={[8, 8, 0, 0]} />
          <Bar dataKey="spend" fill="#f97316" radius={[8, 8, 0, 0]} />
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
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 5).map((campaign, index) => ({
            name: campaign.name,
            roas: campaign.roas,
            fill: channelColors[index % channelColors.length],
          }))}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip />
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
