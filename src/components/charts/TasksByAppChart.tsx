'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { mockTasks } from '@/data/mockData'
import { APPLICATIONS } from '@/types'

export default function TasksByAppChart() {
  const data = APPLICATIONS.map((app) => {
    const tasks = mockTasks.filter((t) => t.application === app.name)
    return {
      name: app.name.length > 10 ? app.name.slice(0, 10) + '…' : app.name,
      fullName: app.name,
      Todo: tasks.filter((t) => t.status === 'todo').length,
      'In Progress': tasks.filter((t) => t.status === 'in-progress').length,
      Waiting: tasks.filter((t) => t.status === 'waiting').length,
      Blocked: tasks.filter((t) => t.status === 'blocked').length,
      Done: tasks.filter((t) => t.status === 'done').length,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value, name) => [value, name]}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload
            return item?.fullName || label
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Todo" fill="#93c5fd" stackId="a" />
        <Bar dataKey="In Progress" fill="#fcd34d" stackId="a" />
        <Bar dataKey="Waiting" fill="#c4b5fd" stackId="a" />
        <Bar dataKey="Blocked" fill="#fca5a5" stackId="a" />
        <Bar dataKey="Done" fill="#86efac" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
