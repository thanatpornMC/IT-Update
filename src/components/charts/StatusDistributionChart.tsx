'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { mockTasks } from '@/data/mockData'
import { TaskStatus, STATUS_LABELS } from '@/types'

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#93c5fd',
  'in-progress': '#fcd34d',
  waiting: '#c4b5fd',
  blocked: '#fca5a5',
  done: '#86efac',
  cancelled: '#d1d5db',
}

export default function StatusDistributionChart() {
  const statusCounts = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: mockTasks.filter((t) => t.status === key).length,
    color: STATUS_COLORS[key as TaskStatus],
  })).filter((d) => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={statusCounts}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {statusCounts.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Tasks']} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
