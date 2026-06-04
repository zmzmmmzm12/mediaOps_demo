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
          { id: 'overview', label: '개요' },
          { id: 'creatives', label: '소재 성과' },
          { id: 'revenue', label: '매출 분석' },
          { id: 'memo', label: '메모' },
        ]}
      />
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        현재 탭: {value}
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
      { id: 'overview', label: '개요' },
      { id: 'creatives', label: '소재 성과' },
      { id: 'revenue', label: '매출 분석' },
      { id: 'memo', label: '메모' },
    ],
  },
  render: () => <TabsStory />,
}
