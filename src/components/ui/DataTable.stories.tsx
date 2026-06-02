import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type DataTableColumn } from './DataTable'

interface CampaignRow {
  id: string
  name: string
  channel: string
  revenue: string
}

const rows: CampaignRow[] = [
  { id: 'row-1', name: '오르빗 3분기 성장', channel: '구글', revenue: '12.2만 달러' },
  { id: 'row-2', name: '헤일로 크리에이터 확대', channel: '메타', revenue: '9.4만 달러' },
]

const columns: Array<DataTableColumn<CampaignRow>> = [
  { id: 'name', header: '캠페인', cell: (row) => row.name },
  { id: 'channel', header: '채널', cell: (row) => row.channel },
  { id: 'revenue', header: '매출', cell: (row) => row.revenue },
]

const meta = {
  title: 'UI/DataTable',
  component: DataTable<CampaignRow>,
  args: {
    columns,
    rows,
    getRowKey: (row: CampaignRow) => row.id,
  },
} satisfies Meta<typeof DataTable<CampaignRow>>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
