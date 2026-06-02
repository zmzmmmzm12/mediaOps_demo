import type { OptionHTMLAttributes, SelectHTMLAttributes } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

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
  md: 'px-4 py-3 text-sm',
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
  const theme = usePreferencesStore((state) => state.theme)
  const selectId = id ?? props.name

  return (
    <label className="grid gap-2">
      {label ? (
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
      ) : null}
      <select
        id={selectId}
        className={`w-full rounded-2xl border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-800 text-slate-100 disabled:bg-slate-800 disabled:text-slate-500 [&>option]:bg-slate-900 [&>option]:text-slate-100'
            : 'border-slate-200 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400'
        } ${sizeClassMap[fieldSize]} ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

export function SelectOption(props: OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />
}
