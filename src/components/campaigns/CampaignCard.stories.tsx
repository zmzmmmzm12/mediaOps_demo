import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { CampaignCard } from './CampaignCard'

const meta = {
  title: 'Campaigns/CampaignCard',
  component: CampaignCard,
  args: {
    campaign: {
      id: 'camp-orbit-q3',
      name: 'Orbit Q3 Growth',
      channel: 'meta',
      managerName: 'Daniel Kim',
      status: 'active',
      priority: 'critical',
      budget: 180000,
      spend: 124300,
      revenue: 352100,
      roas: 2.79,
      conversionRate: 4.32,
      impressions: 1240000,
      clicks: 62000,
      conversions: 4210,
      startDate: '2026-05-06',
      endDate: '2026-07-01',
      memo: 'Creative rotation is active.',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="min-h-screen bg-sand p-8">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof CampaignCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
