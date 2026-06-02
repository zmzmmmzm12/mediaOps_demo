import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  args: {
    label: 'Active',
    tone: 'positive',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Positive: Story = {}

export const Warning: Story = {
  args: {
    label: 'At risk',
    tone: 'warning',
  },
}

export const Neutral: Story = {
  args: {
    label: 'Summary only',
    tone: 'neutral',
  },
}
