import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getTrendData } from '@/utils/calculations'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/pixel/EmptyState'

interface TrendChartProps {
  mode: 'weekly' | 'monthly'
}

export function TrendChart({ mode }: TrendChartProps) {
  const semester = useAppStore((s) => s.getActiveSemester())

  const data = useMemo(() => {
    if (!semester) return []
    return getTrendData(semester, mode)
  }, [semester, mode])

  if (data.length === 0) {
    return (
      <EmptyState
        variant="stats"
        title="No trends yet"
        message="Not enough data for trends — keep marking classes~"
      />
    )
  }

  return (
    <Card padding="sm">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-accent)" opacity={0.2} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickFormatter={(v: string) => v.slice(-5)}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="var(--color-accent-strong)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--color-accent)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
