import { Card } from '@/components/ui/Card'

interface AttendanceGPAProps {
  gpa: number
}

export function AttendanceGPA({ gpa }: AttendanceGPAProps) {
  const label =
    gpa >= 90 ? 'Excellent' : gpa >= 75 ? 'Healthy' : gpa >= 60 ? 'Needs care' : 'Wake up!'

  return (
    <Card className="text-center">
      <p className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
        Semester GPA
      </p>
      <p className="stat-number text-5xl text-[var(--color-text)] mt-2">{gpa}%</p>
      <p className="font-mono-body text-sm text-[var(--color-text-muted)] mt-2 uppercase">{label}</p>
    </Card>
  )
}
