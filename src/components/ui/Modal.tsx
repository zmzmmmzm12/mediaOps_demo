import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-2xl font-semibold text-slate-950">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-600">{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}
