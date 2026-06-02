import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type DataTableColumn } from './DataTable'

interface CampaignRow {
  id: string
  name: string
  channel: string
  revenue: string
}

const rows: CampaignRow[] = [
  { id: 'row-1', name: 'Orbit Q3 Growth', channel: 'google', revenue: '$122K' },
  { id: 'row-2', name: 'Halo Creator Push', channel: 'meta', revenue: '$94K' },
]

const columns: Array<DataTableColumn<CampaignRow>> = [
  { id: 'name', header: 'Campaign', cell: (row) => row.name },
  { id: 'channel', header: 'Channel', cell: (row) => row.channel },
  { id: 'revenue', header: 'Revenue', cell: (row) => row.revenue },
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
