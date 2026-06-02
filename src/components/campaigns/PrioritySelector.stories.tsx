import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Priority } from '../../types/mediaops'
import { PrioritySelector } from './PrioritySelector'

function PrioritySelectorStory() {
  const [value, setValue] = useState<Priority>('steady')

  return <PrioritySelector value={value} onChange={setValue} />
}

const meta = {
  title: 'Campaigns/PrioritySelector',
  component: PrioritySelector,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PrioritySelector>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'steady',
    onChange: () => undefined,
  },
  render: () => <PrioritySelectorStory />,
}
