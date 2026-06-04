import { useToastStore } from '../../features/ui/toast-store'
import { usePreferencesStore } from '../../features/ui/preferences-store'

export function ToastRegion() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)
  const theme = usePreferencesStore((state) => state.theme)

  const toneClassMap = {
    success:
      theme === 'dark'
        ? 'border-emerald-900/60 bg-emerald-950/70 text-emerald-100'
        : 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
    error:
      theme === 'dark'
        ? 'border-red-900/60 bg-red-950/70 text-red-100'
        : 'border-red-200 bg-red-50/95 text-red-900',
    info:
      theme === 'dark'
        ? 'border-slate-800 bg-slate-900/95 text-slate-100'
        : 'border-slate-200 bg-white/95 text-slate-900',
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm"
    >
      {toasts.map((toast) => (
        <section
          key={toast.id}
          role="status"
          className={`pointer-events-auto w-full rounded-xl border p-4 shadow-[var(--shadow-md)] backdrop-blur ${toneClassMap[toast.tone]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm opacity-80">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="알림 닫기"
              className="focus-ring rounded-full p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
            >
              ×
            </button>
          </div>
        </section>
      ))}
    </div>
  )
}
