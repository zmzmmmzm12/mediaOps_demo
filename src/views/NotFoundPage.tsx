import Link from 'next/link'

export function NotFoundPage() {
  return (
    <div className="surface-card border-dashed px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-quaternary)]">404</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-tertiary)]">
        요청한 경로가 현재 대시보드 라우트에 존재하지 않습니다.
      </p>
      <Link
        href="/dashboard"
        className="focus-ring mt-6 inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--panel-muted)]"
      >
        대시보드로 이동
      </Link>
    </div>
  )
}
