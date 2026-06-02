import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CampaignFilters } from './CampaignFilters'

function CampaignFiltersStory() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'ended'>('all')
  const [presetName, setPresetName] = useState('우선 대응 운영 중')
  const [selectedPresetId, setSelectedPresetId] = useState('preset-1')

  return (
    <CampaignFilters
      search={search}
      status={status}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
      presetName={presetName}
      onPresetNameChange={setPresetName}
      presets={[
        {
          id: 'preset-1',
          name: '우선 대응 운영 중',
          filters: {
            search: '오르빗',
            status: 'active',
            channel: 'meta',
            startDate: '',
            endDate: '',
            sortBy: 'revenue',
            sortDirection: 'desc',
            page: '1',
            pageSize: '5',
          },
          createdAt: '2026-06-02T00:00:00.000Z',
        },
      ]}
      selectedPresetId={selectedPresetId}
      onSelectedPresetIdChange={setSelectedPresetId}
      onSavePreset={() => undefined}
      onLoadPreset={() => undefined}
      onDeletePreset={() => undefined}
      onReset={() => undefined}
      onDownloadCsv={() => undefined}
      resultCount={3}
    />
  )
}

const meta = {
  title: 'Campaigns/CampaignFilters',
  component: CampaignFilters,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof CampaignFilters>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    search: '',
    status: 'all',
    onSearchChange: () => undefined,
    onStatusChange: () => undefined,
    presetName: '',
    onPresetNameChange: () => undefined,
    presets: [],
    selectedPresetId: '',
    onSelectedPresetIdChange: () => undefined,
    onSavePreset: () => undefined,
    onLoadPreset: () => undefined,
    onDeletePreset: () => undefined,
    onReset: () => undefined,
    onDownloadCsv: () => undefined,
    resultCount: 0,
  },
  render: () => <CampaignFiltersStory />,
}
