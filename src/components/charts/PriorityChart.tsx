'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { mockTasks } from '@/data/mockData'
import { TaskPriority, PRIORITY_LABELS } from '@/types'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#9ca3af',
  medium: '#60a5fa',
  high: '#fb923c',
  urgent: '#f87171',
}

export default function PriorityChart() {
  const data = (['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => ({
    name: PRIORITY_LABELS[p],
    value: mockTasks.filter((t) => t.priority === p).length,
    color: PRIORITY_COLORS[p],
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={55} />
        <Tooltip formatter={(value) => [value, 'Tasks']} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
