import { useAppStore } from '@/store/useAppStore'

export function SemesterSwitcher() {
  const semesters = useAppStore((s) => s.semesters)
  const activeSemesterId = useAppStore((s) => s.activeSemesterId)
  const setActiveSemester = useAppStore((s) => s.setActiveSemester)
  const getActiveSemester = useAppStore((s) => s.getActiveSemester)

  const active = getActiveSemester()
  const currentId = activeSemesterId ?? active?.id ?? ''

  return (
    <select
      value={currentId}
      onChange={(e) => setActiveSemester(e.target.value)}
      className="pixel-input font-mono-body text-sm"
    >
      {semesters.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} {s.archived ? '(archived)' : ''}
        </option>
      ))}
    </select>
  )
}
