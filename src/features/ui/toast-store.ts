import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

interface ToastState {
  toasts: ToastItem[]
  showToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string
  dismissToast: (toastId: string) => void
}

const dismissalTimers = new Map<string, number>()

function clearDismissalTimer(toastId: string) {
  const timer = dismissalTimers.get(toastId)

  if (timer) {
    clearTimeout(timer)
    dismissalTimers.delete(toastId)
  }
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  showToast: ({ id, tone, title, description }) => {
    const toastId =
      id ?? `toast-${Math.random().toString(36).slice(2, 10)}`

    clearDismissalTimer(toastId)

    set((state) => ({
      toasts: [
        { id: toastId, tone, title, description },
        ...state.toasts.filter((toast) => toast.id !== toastId),
      ].slice(0, 4),
    }))

    dismissalTimers.set(
      toastId,
      window.setTimeout(() => {
        get().dismissToast(toastId)
      }, 3200),
    )

    return toastId
  },
  dismissToast: (toastId) => {
    clearDismissalTimer(toastId)
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }))
  },
}))
