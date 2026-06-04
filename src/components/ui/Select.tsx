import type { OptionHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type SelectSize = 'sm' | 'md'

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fieldSize?: SelectSize
}

const sizeClassMap: Record<SelectSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3.5 py-2.5 text-sm',
}

export function Select({
  id,
  label,
  hint,
  error,
  className = '',
  fieldSize = 'md',
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="grid gap-2">
      {label ? <span className="field-label text-[13px] font-medium">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          'field-shell focus-ring appearance-none bg-[right_0.875rem_center] bg-no-repeat pr-10',
          `[background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]`,
          sizeClassMap[fieldSize],
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="field-hint text-xs">{hint}</span>
      ) : null}
    </label>
  )
}

export function SelectOption(props: OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />
}
