import { useEffect, useRef } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

interface ModalProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
}

export function Modal({ open, title, children, onClose, actions }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const theme = usePreferencesStore((state) => state.theme)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full max-w-lg rounded-[30px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="modal-title" className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="대화상자 닫기"
            className={`rounded-full p-2 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            ×
          </button>
        </div>
        <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}
