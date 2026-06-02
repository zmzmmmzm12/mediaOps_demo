import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

function TabsStory() {
  const [value, setValue] = useState('overview')

  return (
    <div className="space-y-4">
      <Tabs
        value={value}
        onChange={setValue}
        options={[
          { id: 'overview', label: 'Overview' },
          { id: 'creatives', label: 'Creatives' },
          { id: 'revenue', label: 'Revenue' },
          { id: 'memo', label: 'Memo' },
        ]}
      />
      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
        Active tab: {value}
      </div>
    </div>
  )
}

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'overview',
    onChange: () => undefined,
    options: [
      { id: 'overview', label: 'Overview' },
      { id: 'creatives', label: 'Creatives' },
      { id: 'revenue', label: 'Revenue' },
      { id: 'memo', label: 'Memo' },
    ],
  },
  render: () => <TabsStory />,
}
