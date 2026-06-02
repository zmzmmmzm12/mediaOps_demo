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
  function handleKeyDown(currentIndex: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') {
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
      aria-label="Content sections"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
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
            onKeyDown={(event) => handleKeyDown(options.indexOf(option), event)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              isActive
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
