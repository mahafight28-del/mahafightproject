export const toCSV = (rows: any[], columns?: string[]) => {
  if (!rows || !rows.length) return ''
  const keys = columns || Object.keys(rows[0])
  const esc = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const header = keys.join(',')
  const lines = rows.map(r => keys.map(k => esc(r[k])).join(','))
  return [header, ...lines].join('\n')
}

export const downloadCSV = (rows: any[], filename = 'export.csv', columns?: string[]) => {
  const csv = toCSV(rows, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
