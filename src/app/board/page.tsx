'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import ProgressBar from '@/components/ProgressBar'
import { mockTasks } from '@/data/mockData'
import { Task, TaskStatus, APPLICATIONS } from '@/types'
import { AlertCircle } from 'lucide-react'

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
]

const columnColors: Record<TaskStatus, string> = {
  todo: 'border-blue-300 bg-blue-50',
  'in-progress': 'border-amber-300 bg-amber-50',
  waiting: 'border-purple-300 bg-purple-50',
  blocked: 'border-red-300 bg-red-50',
  done: 'border-green-300 bg-green-50',
  cancelled: 'border-gray-300 bg-gray-50',
}

function TaskCard({ task }: { task: Task }) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.dueDate < today && task.status !== 'done' && task.status !== 'cancelled'

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-2">
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-mono text-gray-400">{task.id}</span>
        <PriorityBadge priority={task.priority} size="sm" />
      </div>
      <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
      <p className="text-xs text-gray-500">{task.application}</p>
      <ProgressBar progress={task.progress} size="sm" />
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{task.owner}</span>
        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
          {isOverdue && <AlertCircle size={10} className="inline mr-0.5" />}
          {task.dueDate}
        </span>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const [filterApp, setFilterApp] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const owners = useMemo(() => [...new Set(mockTasks.map((t) => t.owner))].sort(), [])

  const filtered = useMemo(
    () =>
      mockTasks.filter((t) => {
        if (filterApp && t.application !== filterApp) return false
        if (filterOwner && t.owner !== filterOwner) return false
        if (filterPriority && t.priority !== filterPriority) return false
        return true
      }),
    [filterApp, filterOwner, filterPriority]
  )

  return (
    <div>
      <Header title="Kanban Board" subtitle="Track tasks by status" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={filterApp}
          onChange={(e) => setFilterApp(e.target.value)}
        >
          <option value="">All Applications</option>
          {APPLICATIONS.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
        >
          <option value="">All Owners</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(filterApp || filterOwner || filterPriority) && (
          <button
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            onClick={() => { setFilterApp(''); setFilterOwner(''); setFilterPriority('') }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map(({ key, label }) => {
          const tasks = filtered.filter((t) => t.status === key)
          return (
            <div key={key} className={`rounded-xl border-2 ${columnColors[key]} p-3 min-w-[220px]`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">{label}</h3>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border">
                  {tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-8">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
