import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ErrorStatePanel } from './ErrorStatePanel'

const meta = {
  title: 'UI/ErrorStatePanel',
  component: ErrorStatePanel,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorStatePanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Dashboard request failed',
    message: 'The mock API could not respond. Retry the request.',
    action: <Button variant="secondary">Retry</Button>,
  },
}
