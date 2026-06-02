import type { ReactNode } from 'react'

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
  return (
    <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`px-4 py-3 font-semibold text-slate-700 ${column.className ?? ''}`}
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
              className="border-t border-slate-100 align-top"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`px-4 py-4 text-slate-600 ${column.className ?? ''}`}
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
