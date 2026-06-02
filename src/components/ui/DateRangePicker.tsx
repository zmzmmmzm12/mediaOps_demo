import { Input } from './Input'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  startLabel?: string
  endLabel?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = '시작일',
  endLabel = '종료일',
}: DateRangePickerProps) {
  return (
    <>
      <Input
        label={startLabel}
        aria-label={startLabel}
        type="date"
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
      />
      <Input
        label={endLabel}
        aria-label={endLabel}
        type="date"
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
      />
    </>
  )
}
