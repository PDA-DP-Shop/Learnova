/**
 * Exports an array of objects to a CSV file download.
 * @param {Object[]} rows  - Array of plain objects
 * @param {string}   name  - File name (without extension)
 */
export const exportCSV = (rows, name = 'export') => {
  if (!rows?.length) return

  const keys = Object.keys(rows[0])

  const escape = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csv = [
    keys.join(','),
    ...rows.map((row) => keys.map((k) => escape(row[k])).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
