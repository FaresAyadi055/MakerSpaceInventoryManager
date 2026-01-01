export function exportCSV(data, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Extract headers from first object
  const headers = Object.keys(data[0])
  
  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) {
          return ''
        }
        
        const stringValue = String(value)
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        
        return stringValue
      }).join(',')
    )
  ]
  
  const csvString = csvRows.join('\n')
  
  // Create and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}