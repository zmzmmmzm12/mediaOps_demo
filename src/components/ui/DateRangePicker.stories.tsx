import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangePicker } from './DateRangePicker'

function DateRangePickerStory() {
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-05-31')

  return (
    <div className="grid max-w-xl gap-4 md:grid-cols-2">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    </div>
  )
}

const meta = {
  title: 'UI/DateRangePicker',
  component: DateRangePicker,
} satisfies Meta<typeof DateRangePicker>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    onStartDateChange: () => undefined,
    onEndDateChange: () => undefined,
  },
  render: () => <DateRangePickerStory />,
}
