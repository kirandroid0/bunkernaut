import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useTodayClasses } from '@/hooks/useTodayClasses'
import { useAutoHolidayMarking } from '@/hooks/useAutoHolidayMarking'
import { DailyLogList } from '@/components/timetable/DailyLogList'
import { MarkAttendanceSheet } from '@/components/timetable/MarkAttendanceSheet'
import { BunkOrNotSheet } from '@/components/bunk/BunkOrNotSheet'
import { ProfessorCheatSheet } from '@/components/professor/ProfessorCheatSheet'
import type { ScheduledClass } from '@/types'

export function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [bunkClass, setBunkClass] = useState<ScheduledClass | null>(null)
  const [bunkSheetOpen, setBunkSheetOpen] = useState(false)
  const [cheatSheetClass, setCheatSheetClass] = useState<ScheduledClass | null>(null)

  const classes = useTodayClasses(selectedDate)
  useAutoHolidayMarking(selectedDate)

  const openMarkSheet = (cls: ScheduledClass) => {
    setSelectedClass(cls)
    setSheetOpen(true)
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="heading-impact text-2xl text-[var(--color-text)]">Today</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Quick mark or backfill past days~
        </p>
      </header>

      <label className="block">
        <span className="text-sm text-[var(--color-text-muted)] font-semibold">Pick a date</span>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(parseISO(e.target.value))}
          className="pixel-input mt-1"
        />
      </label>

      {cheatSheetClass && (
        <ProfessorCheatSheet
          scheduledClass={cheatSheetClass}
          onMark={() => openMarkSheet(cheatSheetClass)}
        />
      )}

      <DailyLogList
        classes={classes}
        onSelect={(cls) => {
          setCheatSheetClass(cls)
          openMarkSheet(cls)
        }}
        onBunkOrNot={(cls) => {
          setBunkClass(cls)
          setBunkSheetOpen(true)
        }}
        emptyMessage={
          isToday
            ? 'No classes today — enjoy your free time~'
            : 'No scheduled classes on this day~'
        }
      />

      <MarkAttendanceSheet
        scheduledClass={selectedClass}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false)
          setSelectedClass(null)
        }}
      />

      <BunkOrNotSheet
        scheduledClass={bunkClass}
        open={bunkSheetOpen}
        onClose={() => {
          setBunkSheetOpen(false)
          setBunkClass(null)
        }}
        onFollowBunk={() => {
          if (bunkClass) openMarkSheet(bunkClass)
        }}
      />
    </div>
  )
}
