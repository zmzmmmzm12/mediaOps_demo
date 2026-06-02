import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">404</p>
      <h2 className="mt-4 font-display text-4xl text-slate-950">
        Page not found
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
        The route does not exist in this dashboard baseline.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
