import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricCard } from './MetricCard'

const meta = {
  title: 'Dashboard/MetricCard',
  component: MetricCard,
  args: {
    label: 'Total spend',
    value: '$302K',
    delta: 'Across current permissions',
    tone: 'positive',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <div className="max-w-sm">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof MetricCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
