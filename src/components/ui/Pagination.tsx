import { Button } from './Button'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="surface-card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{page} / {pageCount} 페이지</p>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">총 {total}개 항목</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          buttonSize="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          이전
        </Button>
        <Button
          variant="secondary"
          buttonSize="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
