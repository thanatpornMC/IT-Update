'use client'

import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import TasksByAppChart from '@/components/charts/TasksByAppChart'
import StatusDistributionChart from '@/components/charts/StatusDistributionChart'
import PriorityChart from '@/components/charts/PriorityChart'
import { mockTasks, getTaskStats, getOverdueTasks } from '@/data/mockData'
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  ListChecks,
  XCircle,
} from 'lucide-react'

export default function DashboardPage() {
  const stats = getTaskStats()
  const overdueTasks = getOverdueTasks()
  const recentTasks = [...mockTasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Overview as of ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Tasks" value={stats.total} icon={ListChecks} color="blue" />
        <StatCard title="To Do" value={stats.todo} icon={CheckSquare} color="blue" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="amber" />
        <StatCard
          title="Waiting / Blocked"
          value={stats.waiting + stats.blocked}
          icon={AlertTriangle}
          color="purple"
        />
        <StatCard title="Done" value={stats.done} icon={CheckCircle} color="green" />
        <StatCard title="Overdue" value={stats.overdue} icon={XCircle} color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Tasks by Application</h2>
          <TasksByAppChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Status Distribution</h2>
          <StatusDistributionChart />
        </div>
      </div>

      {/* Priority + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Priority Distribution</h2>
          <PriorityChart />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recently Updated</h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{task.id}</span>
                    <StatusBadge status={task.status} size="sm" />
                    <PriorityBadge priority={task.priority} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.application} · {task.owner} · {task.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <div className="mt-6 bg-red-50 rounded-xl border border-red-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-red-700 mb-3">
            Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gray-800">{task.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">{task.application}</span>
                  <StatusBadge status={task.status} size="sm" />
                  <span className="text-xs text-red-600 font-medium">Due {task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
