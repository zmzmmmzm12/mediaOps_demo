import Link from 'next/link'

export function ForbiddenPage() {
  return (
    <div className="surface-card px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">403</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
        현재 권한으로는 이 페이지를 열 수 없습니다
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-tertiary)]">
        메뉴 노출과 라우트 접근은 현재 로그인한 계정의 권한 정책에 따라 제어됩니다.
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
