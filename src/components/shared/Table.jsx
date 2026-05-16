export default function Table({ columns, rows, emptyMessage = 'No data available.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 px-6 py-12 text-center text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-sand-50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row, i) => (
              <tr key={row.id || i} className="transition-colors hover:bg-sand-50/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-ink-700">
                    {col.render ? col.render(row) : row[col.key]}
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
