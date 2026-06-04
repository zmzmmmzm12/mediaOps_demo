import type { Priority } from '../../types/mediaops'
import { priorityTextMap } from '../../lib/labels'

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
      aria-label="캠페인 우선순위"
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
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)]'
                : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-secondary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {priorityTextMap[option]}
          </button>
        )
      })}
    </div>
  )
}
