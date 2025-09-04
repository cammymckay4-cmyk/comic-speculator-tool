import type { CollectionComic } from '@/lib/types'

export const generateCSV = (comics: CollectionComic[]): string => {
  if (comics.length === 0) {
    return 'No comics to export'
  }

  // Define CSV headers
  const headers = [
    'Title',
    'Issue Number',
    'Publisher',
    'Condition',
    'Market Value',
    'Purchase Price',
    'Purchase Date',
    'Purchase Location',
    'Publication Year',
    'Format',
    'Is Key Issue',
    'Key Issue Reason',
    'Notes',
    'Added Date'
  ]

  // Create CSV rows
  const rows = comics.map(comic => [
    comic.comic.title || '',
    comic.comic.issue || '',
    comic.comic.publisher || '',
    comic.condition || '',
    comic.comic.marketValue?.toString() || '0',
    comic.purchasePrice?.toString() || '',
    comic.purchaseDate || '',
    comic.purchaseLocation || '',
    comic.comic.publishDate ? new Date(comic.comic.publishDate).getFullYear().toString() : '',
    comic.comic.format || '',
    comic.comic.isKeyIssue ? 'Yes' : 'No',
    comic.comic.keyNotes || '',
    comic.notes || '',
    comic.addedDate ? new Date(comic.addedDate).toLocaleDateString() : ''
  ])

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCsvValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Build CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(','))
  ].join('\n')

  return csvContent
}

export const downloadCSV = (csvContent: string, filename: string = 'comicscoutuk_collection_export.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}