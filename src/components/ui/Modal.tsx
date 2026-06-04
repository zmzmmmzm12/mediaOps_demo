import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  actions?: ReactNode
}

export function Modal({ open, title, children, onClose, actions }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key !== 'Tab' || !containerRef.current) {
        return
      }

      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length === 0) {
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previouslyFocused = document.activeElement as HTMLElement | null
    window.setTimeout(() => {
      containerRef.current?.querySelector<HTMLElement>('button, input, textarea, select')?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="surface-elevated w-full max-w-lg p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="대화상자 닫기"
            className="focus-ring rounded-full p-2 text-[var(--text-tertiary)] hover:bg-[var(--panel-muted)]"
          >
            ×
          </button>
        </div>
        <div className="mt-4 text-sm text-[var(--text-secondary)]">{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}
