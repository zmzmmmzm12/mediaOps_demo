import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'No campaigns match these filters',
    description:
      'Try broadening the status filter or loading a previously saved preset.',
    action: <Button variant="secondary">Reset filters</Button>,
  },
}
