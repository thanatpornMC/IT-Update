'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { mockTasks } from '@/data/mockData'
import { APPLICATIONS } from '@/types'
import Header from '@/components/Header'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import ProgressBar from '@/components/ProgressBar'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

type Tab = 'all' | 'in-progress' | 'todo' | 'done' | 'blocked'

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const app = APPLICATIONS.find((a) => a.id === id)
  if (!app) notFound()

  const tasks = mockTasks.filter((t) => t.application === app.name)
  const [tab, setTab] = useState<Tab>('all')

  const inProgress = tasks.filter((t) => t.status === 'in-progress')
  const todo = tasks.filter((t) => t.status === 'todo')
  const done = tasks.filter((t) => t.status === 'done')
  const blocked = tasks.filter((t) => t.status === 'blocked')
  const waiting = tasks.filter((t) => t.status === 'waiting')
  const pct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter((t) => t.dueDate < today && t.status !== 'done' && t.status !== 'cancelled')

  const tabFiltered = tab === 'all' ? tasks
    : tab === 'in-progress' ? inProgress
    : tab === 'todo' ? todo
    : tab === 'done' ? done
    : blocked

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All Tasks', count: tasks.length },
    { key: 'in-progress', label: 'In Progress', count: inProgress.length },
    { key: 'todo', label: 'Upcoming', count: todo.length },
    { key: 'done', label: 'Completed', count: done.length },
    { key: 'blocked', label: 'Blocked', count: blocked.length },
  ]

  return (
    <div>
      <Link href="/applications" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={14} /> Back to Applications
      </Link>

      <Header title={app.name} subtitle={app.description} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: tasks.length, cls: 'bg-blue-50 text-blue-700' },
          { label: 'In Progress', value: inProgress.length, cls: 'bg-amber-50 text-amber-700' },
          { label: 'Waiting', value: waiting.length, cls: 'bg-purple-50 text-purple-700' },
          { label: 'Blocked', value: blocked.length, cls: 'bg-red-50 text-red-700' },
          { label: 'Done', value: done.length, cls: 'bg-green-50 text-green-700' },
          { label: 'Overdue', value: overdue.length, cls: 'bg-orange-50 text-orange-700' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-xl p-3 ${cls} border border-white/50`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Overall completion</span>
          <span className="font-bold text-gray-900">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{inProgress.length} in progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />{todo.length} to do</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{done.length} done</span>
        </div>
      </div>

      {/* Blocked alert */}
      {blocked.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h3 className="font-semibold text-red-700">{blocked.length} Blocked Task{blocked.length > 1 ? 's' : ''} — Needs Attention</h3>
          </div>
          <div className="space-y-1">
            {blocked.map((t) => (
              <div key={t.id} className="text-sm text-red-700">
                <span className="font-medium">{t.title}</span>
                {t.remark && <span className="text-red-500"> — {t.remark}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                tab === key
                  ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {tabFiltered.map((task) => {
            const isOverdue = task.dueDate < today && task.status !== 'done' && task.status !== 'cancelled'
            return (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{task.title}</span>
                      <PriorityBadge priority={task.priority} size="sm" />
                      <StatusBadge status={task.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>Requester: <span className="text-gray-600">{task.requester}</span></span>
                      <span>Owner: <span className="text-gray-600 font-medium">{task.owner}</span></span>
                      <span>Start: <span className="text-gray-600">{task.startDate}</span></span>
                      <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                        Due: <span>{task.dueDate}</span>
                        {isOverdue && ' ⚠ Overdue'}
                      </span>
                    </div>
                    {task.remark && (
                      <p className="mt-2 text-xs text-gray-500 italic">Note: {task.remark}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <ProgressBar progress={task.progress} size="sm" showLabel />
                  </div>
                </div>
              </div>
            )
          })}
          {tabFiltered.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm">No tasks in this category</div>
          )}
        </div>
      </div>
    </div>
  )
}
