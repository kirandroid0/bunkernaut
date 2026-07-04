import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAttendanceStats } from '@/hooks/useAttendanceStats'
import { useTodayClasses } from '@/hooks/useTodayClasses'
import { useAutoHolidayMarking } from '@/hooks/useAutoHolidayMarking'
import { useNudges } from '@/hooks/useNudges'
import { Card } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { SemesterSwitcher } from '@/components/layout/SemesterSwitcher'
import { EmptyState } from '@/components/pixel/EmptyState'
import { Button } from '@/components/ui/Button'
import { DailyLogList } from '@/components/timetable/DailyLogList'
import { BunkernautCard } from '@/components/bunk/BunkernautCard'
import { BunkOrNotSheet } from '@/components/bunk/BunkOrNotSheet'
import { NudgeBanner } from '@/components/nudges/NudgeBanner'
import { useState } from 'react'
import type { ScheduledClass } from '@/types'
import { MarkAttendanceSheet } from '@/components/timetable/MarkAttendanceSheet'

export function DashboardPage() {
  const { courseStats } = useAttendanceStats()
  const todayClasses = useTodayClasses()
  useAutoHolidayMarking(new Date())
  const { nudges, dismiss } = useNudges()
  const markedToday = todayClasses.filter((c) => c.entry).length
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [bunkClass, setBunkClass] = useState<ScheduledClass | null>(null)
  const [bunkSheetOpen, setBunkSheetOpen] = useState(false)

  const openMarkSheet = (cls: ScheduledClass) => {
    setSelectedClass(cls)
    setSheetOpen(true)
  }

  const openBunkSheet = (cls: ScheduledClass) => {
    setBunkClass(cls)
    setBunkSheetOpen(true)
  }

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="heading-impact text-2xl sm:text-3xl text-[var(--color-text)]">Bunkernaut</h1>
          <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
            {format(new Date(), 'EEEE, MMM d')}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <SemesterSwitcher />

      {nudges.length > 0 && (
        <NudgeBanner
          nudge={nudges[0]}
          onDismiss={() => dismiss(nudges[0].id, nudges[0].type)}
        />
      )}

      <Card padding="sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="heading-impact text-lg text-[var(--color-text)]">Mark attendance</h2>
          <Link
            to="/today"
            className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide hover:text-[var(--color-text)]"
          >
            Other days
          </Link>
        </div>
        {todayClasses.length === 0 ? (
          <p className="font-mono-body text-sm text-[var(--color-text-muted)]">
            No classes today
          </p>
        ) : (
          <>
            <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-3 uppercase">
              {markedToday}/{todayClasses.length} marked today
            </p>
            <DailyLogList
              classes={todayClasses}
              onSelect={openMarkSheet}
              onBunkOrNot={openBunkSheet}
            />
          </>
        )}
      </Card>

      {courseStats.length > 0 ? (
        <section className="space-y-3">
          <h2 className="heading-impact text-lg text-[var(--color-text)]">Bunkernauts</h2>
          {courseStats.map((stats) => (
            <BunkernautCard key={stats.courseId} stats={stats} />
          ))}
        </section>
      ) : (
        <EmptyState
          variant="courses"
          title="No courses yet"
          message="Add a course to start tracking~"
          action={
            <Link to="/courses">
              <Button>Add course</Button>
            </Link>
          }
        />
      )}

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
