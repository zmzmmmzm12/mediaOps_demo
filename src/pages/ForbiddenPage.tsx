import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-10 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-amber-700">403</p>
      <h2 className="mt-4 font-display text-4xl text-slate-950">
        This role cannot open that page
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
        Menu visibility and route access are both controlled by the current mock
        session permissions.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
      >
        Return to dashboard
      </Link>
    </div>
  )
}
