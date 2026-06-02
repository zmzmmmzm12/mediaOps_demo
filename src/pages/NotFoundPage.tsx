import { Link } from 'react-router-dom'
import { usePreferencesStore } from '../features/ui/preferences-store'

export function NotFoundPage() {
  const theme = usePreferencesStore((state) => state.theme)
  return (
    <div className={`rounded-[28px] border border-dashed px-6 py-10 text-center ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white'}`}>
      <p className={`text-xs uppercase tracking-[0.28em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>404</p>
      <h2 className={`mt-4 text-4xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>페이지를 찾을 수 없습니다</h2>
      <p className={`mx-auto mt-3 max-w-xl text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        요청한 경로가 현재 대시보드 라우트에 존재하지 않습니다.
      </p>
      <Link
        to="/dashboard"
        className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 text-white'}`}
      >
        대시보드로 이동
      </Link>
    </div>
  )
}
