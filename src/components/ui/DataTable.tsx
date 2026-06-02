import type { ReactNode } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

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
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
}: DataTableProps<T>) {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <div
      className={`overflow-x-auto rounded-[28px] border shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className={theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-50/90'}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`px-4 py-3.5 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} ${column.className ?? ''}`}
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
              className={`align-top transition ${
                theme === 'dark'
                  ? 'border-t border-slate-800 hover:bg-slate-800/50'
                  : 'border-t border-slate-100/90 hover:bg-slate-50/70'
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`px-4 py-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} ${column.className ?? ''}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
