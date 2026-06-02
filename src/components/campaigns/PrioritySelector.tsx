import type { Priority } from '../../types/mediaops'

const priorityOptions: Priority[] = ['critical', 'steady', 'planned']

interface PrioritySelectorProps {
  value: Priority
  disabled?: boolean
  onChange: (priority: Priority) => void
}

export function PrioritySelector({
  value,
  disabled = false,
  onChange,
}: PrioritySelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Campaign priority"
      className="flex flex-wrap gap-2"
    >
      {priorityOptions.map((option) => {
        const isActive = option === value

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option)}
            data-testid={`priority-option-${option}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              isActive
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
