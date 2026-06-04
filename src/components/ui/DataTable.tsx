import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  getRowKey: (row: T) => string
  caption?: string
  captionClassName?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  captionClassName = '',
}: DataTableProps<T>) {
  return (
    <div className="scrollbar-subtle overflow-hidden rounded-[16px] border border-[var(--border-subtle)] bg-[var(--panel-strong)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          {caption ? (
            <caption className={cn('table-caption px-5 pb-3 pt-4 text-left text-sm', captionClassName)}>
              {caption}
            </caption>
          ) : null}
          <thead className="bg-[var(--panel-muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]',
                    column.className ?? '',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="align-top border-t border-[var(--border-subtle)] transition hover:bg-[var(--panel-muted)]/80"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn('px-5 py-4.5 text-[var(--text-secondary)]', column.className ?? '')}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
