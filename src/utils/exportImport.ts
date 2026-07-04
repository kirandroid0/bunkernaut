/** JSON/CSV backup export and restore for semester data. */
import type { AppState, Semester } from '@/types'

export function validateImportData(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return Array.isArray(obj.semesters) && typeof obj.settings === 'object'
}

export function exportToJSON(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importFromJSON(json: string): AppState {
  const parsed = JSON.parse(json) as unknown
  if (!validateImportData(parsed)) {
    throw new Error('Invalid backup file format')
  }
  return parsed
}

export function exportToCSV(semester: Semester): string {
  const headers = ['Date', 'Course', 'Code', 'Component', 'Status', 'Duration (min)']

  const rows = semester.entries.map((entry) => {
    const course = semester.courses.find((c) =>
      c.components.some((comp) => comp.id === entry.componentId),
    )
    const component = course?.components.find((c) => c.id === entry.componentId)

    return [
      entry.date,
      course?.name ?? '',
      course?.code ?? '',
      component?.type ?? '',
      entry.status,
      String(entry.durationMinutes),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
