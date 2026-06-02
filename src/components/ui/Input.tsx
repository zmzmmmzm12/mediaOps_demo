import type { InputHTMLAttributes } from 'react'

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
  md: 'px-4 py-3 text-sm',
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
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${sizeClassMap[fieldSize]} ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}
