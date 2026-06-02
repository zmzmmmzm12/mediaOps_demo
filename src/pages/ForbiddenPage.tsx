import { Link } from 'react-router-dom'
import { usePreferencesStore } from '../features/ui/preferences-store'

export function ForbiddenPage() {
  const theme = usePreferencesStore((state) => state.theme)
  return (
    <div className={`rounded-[28px] border px-6 py-10 text-center ${theme === 'dark' ? 'border-amber-900/60 bg-amber-950/20' : 'border-amber-200 bg-amber-50'}`}>
      <p className={`text-xs uppercase tracking-[0.28em] ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>403</p>
      <h2 className={`mt-4 text-4xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>현재 권한으로는 이 페이지를 열 수 없습니다</h2>
      <p className={`mx-auto mt-3 max-w-xl text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        메뉴 노출과 라우트 접근은 현재 로그인한 계정의 권한 정책에 따라 제어됩니다.
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
