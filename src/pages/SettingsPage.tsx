/** Semester management, holidays, export/import, demo data, and app preferences. */
import { useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { exportToJSON, exportToCSV, importFromJSON, downloadFile } from '@/utils/exportImport'
import { requestNotificationPermission } from '@/utils/notifications'
import { SemesterSwitcher } from '@/components/layout/SemesterSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BunkernautGuide } from '@/components/bunk/BunkernautGuide'
import { BUNKS_AVAILABLE } from '@/utils/bunkLabels'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const semesters = useAppStore((s) => s.semesters)
  const getActiveSemester = useAppStore((s) => s.getActiveSemester)
  const addSemester = useAppStore((s) => s.addSemester)
  const archiveSemester = useAppStore((s) => s.archiveSemester)
  const deleteSemester = useAppStore((s) => s.deleteSemester)
  const addHoliday = useAppStore((s) => s.addHoliday)
  const removeHoliday = useAppStore((s) => s.removeHoliday)
  const importState = useAppStore((s) => s.importState)
  const loadDemoData = useAppStore((s) => s.loadDemoData)
  const resetAll = useAppStore((s) => s.resetAll)

  const fileRef = useRef<HTMLInputElement>(null)
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayLabel, setHolidayLabel] = useState('')
  const [newSemName, setNewSemName] = useState('')
  const [importError, setImportError] = useState('')

  const activeSemester = getActiveSemester()

  const handleExportJSON = () => {
    const state = useAppStore.getState()
    downloadFile(
      exportToJSON({
        semesters: state.semesters,
        activeSemesterId: state.activeSemesterId,
        settings: state.settings,
      }),
      'bunkernaut-backup.json',
      'application/json',
    )
  }

  const handleExportCSV = () => {
    if (!activeSemester) return
    downloadFile(
      exportToCSV(activeSemester),
      `bunkernaut-${activeSemester.name.replace(/\s+/g, '-')}.csv`,
      'text/csv',
    )
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = importFromJSON(reader.result as string)
        const mode = confirm('Replace all data? Cancel to merge semesters.')
        if (mode) {
          importState(data.semesters, data.activeSemesterId, data.settings)
        } else {
          const current = useAppStore.getState()
          importState(
            [...current.semesters, ...data.semesters],
            data.activeSemesterId ?? current.activeSemesterId,
            { ...current.settings, ...data.settings },
          )
        }
        setImportError('')
      } catch {
        setImportError('Invalid backup file 😅')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading-impact text-2xl text-[var(--color-text)]">Settings</h1>
          <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-2 uppercase">Tweak Bunkernaut</p>
        </div>
        <ThemeToggle />
      </header>

      <Card>
        <h2 className="font-bold mb-3">Active semester</h2>
        <SemesterSwitcher />
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Semesters</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={newSemName}
            onChange={(e) => setNewSemName(e.target.value)}
            placeholder="New semester name"
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              addSemester(newSemName || undefined)
              setNewSemName('')
            }}
          >
            Add
          </Button>
        </div>
        {activeSemester && !activeSemester.archived && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (confirm(`Archive "${activeSemester.name}"?`)) {
                archiveSemester(activeSemester.id)
              }
            }}
          >
            Archive current semester
          </Button>
        )}
        {semesters.length > 1 && (
          <div className="mt-3 space-y-2">
            {semesters.map((sem) => (
              <div
                key={sem.id}
                className="flex items-center justify-between gap-2 text-sm py-1 border-t border-[var(--color-border)]/40 first:border-0"
              >
                <span className="truncate">
                  {sem.name}
                  {sem.archived ? ' (archived)' : ''}
                </span>
                <button
                  type="button"
                  className="text-[var(--color-danger)] text-xs shrink-0"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${sem.name}" and all its courses & attendance? This cannot be undone.`,
                      )
                    ) {
                      deleteSemester(sem.id)
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        {semesters.length <= 1 && (
          <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] mt-2">
            At least one semester must remain.
          </p>
        )}
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {semesters.length} semester{semesters.length !== 1 ? 's' : ''} total
        </p>
      </Card>

      <BunkernautGuide />

      <Card>
        <h2 className="font-bold mb-2">L / T / P</h2>
        <p className="font-mono-body text-xs text-[var(--color-text-muted)]">
          <strong>Lecture</strong>, <strong>Tutorial</strong>, <strong>Practical</strong> — set
          credits to match your syllabus (e.g. 3 + 1 + 2). Overall % is the credit-weighted
          average.
        </p>
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Defaults</h2>
        <label className="flex items-center justify-between py-2">
          <span className="text-sm">Default threshold %</span>
          <input
            type="number"
            min={0}
            max={100}
            value={settings.defaultThreshold}
            onChange={(e) => updateSettings({ defaultThreshold: Number(e.target.value) })}
            className="w-16 px-2 py-1 rounded-lg bg-[var(--color-bg-secondary)] text-sm text-right"
          />
        </label>
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Notifications</h2>
        <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-3">
          In-app nudges always show on the home screen. Enable push reminders for end-of-day
          logging and tomorrow threshold warnings.
        </p>
        <label className="flex items-center justify-between py-2">
          <span className="text-sm">Push reminders</span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={async (e) => {
              const enabled = e.target.checked
              if (enabled) {
                const granted = await requestNotificationPermission()
                updateSettings({ notificationsEnabled: granted })
              } else {
                updateSettings({ notificationsEnabled: false })
              }
            }}
            className="w-5 h-5 accent-[var(--color-accent)]"
          />
        </label>
        {typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'denied' && (
            <p className="font-mono-body text-xs text-[var(--color-danger)] mt-1">
              Notifications blocked in browser settings — enable them there to use push reminders.
            </p>
          )}
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Delight toggles</h2>
        {(
          [
            ['soundsEnabled', 'Sound effects'],
            ['animationsEnabled', 'Animations & confetti'],
            ['hapticsEnabled', 'Haptic feedback'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between py-2">
            <span className="text-sm">{label}</span>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => updateSettings({ [key]: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-accent)]"
            />
          </label>
        ))}
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Institute holidays</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-sm"
          />
          <input
            value={holidayLabel}
            onChange={(e) => setHolidayLabel(e.target.value)}
            placeholder="Label"
            className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-sm"
          />
          <Button
            size="sm"
            disabled={!holidayDate}
            onClick={() => {
              addHoliday(holidayDate, holidayLabel || 'Holiday')
              setHolidayDate('')
              setHolidayLabel('')
            }}
          >
            Add
          </Button>
        </div>
        <div className="space-y-1">
          {activeSemester?.holidays.map((h) => (
            <div key={h.id} className="flex justify-between items-center text-sm py-1">
              <span>
                {h.date} — {h.label}
              </span>
              <button
                onClick={() => removeHoliday(h.id)}
                className="text-[var(--color-danger)] text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Try demo data</h2>
        <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-3">
          Loads 5 courses with 20+ days of attendance — frogs, heatmap, and {BUNKS_AVAILABLE.toLowerCase()}.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            loadDemoData()
          }}
        >
          Load demo
        </Button>
      </Card>

      <Card>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={handleExportJSON}>
            Export JSON backup
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            Export CSV (current semester)
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import backup
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {importError && <p className="text-sm text-[var(--color-danger)]">{importError}</p>}
        </div>
      </Card>

      <Card>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            if (confirm('Reset ALL data? This cannot be undone!')) resetAll()
          }}
        >
          Reset all data
        </Button>
      </Card>
    </div>
  )
}
