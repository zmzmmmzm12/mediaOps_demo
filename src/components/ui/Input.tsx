import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type InputSize = 'sm' | 'md'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fieldSize?: InputSize
}

const sizeClassMap: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3.5 py-2.5 text-sm',
}

export function Input({
  id,
  label,
  hint,
  error,
  className = '',
  fieldSize = 'md',
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="grid gap-2">
      {label ? <span className="field-label text-[13px] font-medium">{label}</span> : null}
      <input
        id={inputId}
        className={cn('field-shell focus-ring', sizeClassMap[fieldSize], className)}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="field-hint text-xs">{hint}</span>
      ) : null}
    </label>
  )
}
