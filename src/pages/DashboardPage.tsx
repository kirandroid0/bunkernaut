/** Home screen: today's classes + 2-column Bunkernaut grid. */
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

  const openMarkSheet = (cls: ScheduledClass) => {
    setSelectedClass(cls)
    setSheetOpen(true)
  }

  return (
    <div className="page-stack">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="heading-impact text-xl text-[var(--color-text)]">Bunkernaut</h1>
          <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] mt-0.5 uppercase tracking-wide">
            {format(new Date(), 'EEE, MMM d')}
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
        <div className="flex justify-between items-center mb-2">
          <h2 className="heading-impact text-sm text-[var(--color-text)]">Mark</h2>
          <Link
            to="/today"
            className="font-mono-body text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Other days →
          </Link>
        </div>
        {todayClasses.length === 0 ? (
          <p className="font-mono-body text-[11px] text-[var(--color-text-muted)]">No classes today</p>
        ) : (
          <>
            <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] mb-2">
              {markedToday}/{todayClasses.length} done
            </p>
            <DailyLogList classes={todayClasses} onMark={openMarkSheet} compact />
          </>
        )}
      </Card>

      {courseStats.length > 0 ? (
        <section>
          <h2 className="heading-impact text-sm text-[var(--color-text)] mb-2">Your Bunkernauts</h2>
          <div className="grid grid-cols-2 gap-2.5 items-stretch">
            {courseStats.map((stats) => (
              <BunkernautCard key={stats.courseId} stats={stats} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          variant="courses"
          title="No courses yet"
          message="Add a course to start~"
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
    </div>
  )
}
