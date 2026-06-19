'use client'

import Header from '@/components/Header'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import ProgressBar from '@/components/ProgressBar'
import { mockTasks, getOverdueTasks } from '@/data/mockData'
import { APPLICATIONS } from '@/types'

export default function ReportPage() {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)

  const inProgressTasks = mockTasks.filter((t) => t.status === 'in-progress')
  const doneTasks = mockTasks.filter((t) => t.status === 'done' && t.completedDate?.startsWith(thisMonth))
  const todoTasks = mockTasks
    .filter((t) => t.status === 'todo')
    .sort((a, b) => {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 }
      return order[a.priority] - order[b.priority]
    })
  const blockers = mockTasks.filter((t) => t.status === 'blocked' || t.status === 'waiting')
  const overdue = getOverdueTasks()
  const urgentHigh = mockTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done' && t.status !== 'cancelled')

  const Section = ({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${color}`}>
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="text-sm font-bold bg-white bg-opacity-70 px-2 py-0.5 rounded-full text-gray-700">{count}</span>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  )

  const TaskRow = ({ task, showRemark = true }: { task: typeof mockTasks[0]; showRemark?: boolean }) => (
    <div className="px-5 py-3 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-mono text-gray-400">{task.id}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.application}</span>
        </div>
        <p className="font-medium text-gray-800 text-sm">{task.title}</p>
        {showRemark && task.remark && (
          <p className="text-xs text-amber-700 mt-0.5">{task.remark}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <PriorityBadge priority={task.priority} size="sm" />
        <StatusBadge status={task.status} size="sm" />
        <div className="w-24">
          <ProgressBar progress={task.progress} size="sm" />
        </div>
        <span className="text-xs text-gray-400 w-24 text-right">{task.owner}</span>
      </div>
    </div>
  )

  return (
    <div>
      <Header
        title="Management Report"
        subtitle={`Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {APPLICATIONS.map((app) => {
          const tasks = mockTasks.filter((t) => t.application === app.name)
          const done = tasks.filter((t) => t.status === 'done').length
          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700">{app.name}</p>
              <div className="mt-2">
                <ProgressBar progress={tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0} size="sm" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{done}/{tasks.length} done</p>
            </div>
          )
        })}
      </div>

      {/* In Progress */}
      <Section title="What We Are Working On Now" count={inProgressTasks.length} color="bg-amber-50">
        {inProgressTasks.map((t) => <TaskRow key={t.id} task={t} />)}
        {inProgressTasks.length === 0 && <p className="text-sm text-gray-400 px-5 py-4">Nothing in progress.</p>}
      </Section>

      {/* Done this month */}
      <Section title={`Completed This Month (${thisMonth})`} count={doneTasks.length} color="bg-green-50">
        {doneTasks.map((t) => <TaskRow key={t.id} task={t} />)}
        {doneTasks.length === 0 && <p className="text-sm text-gray-400 px-5 py-4">No completed tasks this month.</p>}
      </Section>

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="Overdue Items" count={overdue.length} color="bg-red-50">
          {overdue.map((t) => (
            <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-gray-400">{t.id}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{t.application}</span>
                </div>
                <p className="font-medium text-gray-800 text-sm">{t.title}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={t.status} size="sm" />
                <span className="text-xs text-red-600 font-semibold">Due {t.dueDate}</span>
                <span className="text-xs text-gray-400">{t.owner}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Key Blockers */}
      <Section title="Key Blockers & Waiting" count={blockers.length} color="bg-purple-50">
        {blockers.map((t) => <TaskRow key={t.id} task={t} />)}
        {blockers.length === 0 && <p className="text-sm text-gray-400 px-5 py-4">No blockers.</p>}
      </Section>

      {/* Upcoming Todo by Priority */}
      <Section title="What's Next (By Priority)" count={todoTasks.length} color="bg-blue-50">
        {todoTasks.map((t) => <TaskRow key={t.id} task={t} />)}
        {todoTasks.length === 0 && <p className="text-sm text-gray-400 px-5 py-4">No upcoming tasks.</p>}
      </Section>

      {/* High Priority Active */}
      <Section title="High Priority Items (Active)" count={urgentHigh.length} color="bg-orange-50">
        {urgentHigh.map((t) => <TaskRow key={t.id} task={t} />)}
        {urgentHigh.length === 0 && <p className="text-sm text-gray-400 px-5 py-4">No high priority active items.</p>}
      </Section>
    </div>
  )
}
