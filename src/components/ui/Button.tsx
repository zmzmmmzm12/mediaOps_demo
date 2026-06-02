import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  const theme = usePreferencesStore((state) => state.theme)
  const variantClassMap: Record<ButtonVariant, string> = {
    primary:
      theme === 'dark'
        ? 'border border-teal-500/70 bg-teal-600 text-white shadow-[0_10px_24px_rgba(13,148,136,0.22)] hover:bg-teal-500 disabled:border-slate-700 disabled:bg-slate-700 disabled:text-slate-400'
        : 'border border-teal-700 bg-teal-700 text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] hover:bg-teal-600 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500',
    secondary:
      theme === 'dark'
        ? 'border border-slate-700 bg-slate-800 text-slate-200 shadow-sm hover:border-slate-600 hover:bg-slate-700 disabled:text-slate-500'
        : 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400',
    ghost:
      theme === 'dark'
        ? 'bg-transparent text-slate-300 hover:bg-slate-800 disabled:text-slate-500'
        : 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  }

  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed ${variantClassMap[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
