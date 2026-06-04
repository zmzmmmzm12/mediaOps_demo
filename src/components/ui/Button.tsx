import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  buttonSize?: ButtonSize
  loading?: boolean
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  buttonSize = 'md',
  loading = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  const theme = usePreferencesStore((state) => state.theme)

  const variantClassMap: Record<ButtonVariant, string> = {
    primary:
      theme === 'dark'
        ? 'border-transparent bg-indigo-400 text-slate-950 shadow-sm shadow-indigo-950/20 hover:bg-indigo-300'
        : 'border-transparent bg-indigo-600 text-white shadow-sm shadow-indigo-200/60 hover:bg-indigo-500',
    secondary:
      theme === 'dark'
        ? 'border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/15 hover:bg-white/[0.07]'
        : 'border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
    ghost:
      theme === 'dark'
        ? 'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-slate-100'
        : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
    danger:
      theme === 'dark'
        ? 'border-transparent bg-red-400 text-slate-950 shadow-sm hover:bg-red-300'
        : 'border-transparent bg-red-600 text-white shadow-sm shadow-red-200/60 hover:bg-red-500',
  }

  const sizeClassMap: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-10 px-4 text-sm',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium leading-none',
        'disabled:cursor-not-allowed disabled:opacity-45',
        sizeClassMap[buttonSize],
        variantClassMap[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
