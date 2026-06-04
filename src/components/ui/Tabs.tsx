import { usePreferencesStore } from '../../features/ui/preferences-store'

interface TabOption {
  id: string
  label: string
}

interface TabsProps {
  value: string
  options: TabOption[]
  onChange: (value: string) => void
}

export function Tabs({ value, options, onChange }: TabsProps) {
  const theme = usePreferencesStore((state) => state.theme)

  function handleKeyDown(currentIndex: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return
    }

    event.preventDefault()

    if (event.key === 'Home') {
      onChange(options[0].id)
      return
    }

    if (event.key === 'End') {
      onChange(options[options.length - 1].id)
      return
    }

    const nextIndex =
      event.key === 'ArrowRight'
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length

    onChange(options[nextIndex].id)
  }

  return (
    <div
      role="tablist"
      aria-label="콘텐츠 구역"
      className="inline-flex flex-wrap gap-1 rounded-[14px] border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-1"
    >
      {options.map((option, index) => {
        const isActive = option.id === value

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.id}`}
            id={`tab-${option.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className={`focus-ring rounded-[10px] px-3.5 py-2 text-sm font-medium transition ${
              isActive
                ? theme === 'dark'
                  ? 'bg-slate-800 text-slate-50'
                  : 'bg-white text-slate-950 shadow-sm'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  : 'text-slate-500 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
