'use client'

import { mockTasks, getOverdueTasks } from '@/data/mockData'
import { APPLICATIONS } from '@/types'
import Header from '@/components/Header'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import { AlertTriangle, CheckCircle2, PlayCircle, Calendar, TrendingUp, ShieldAlert } from 'lucide-react'

export default function ReportPage() {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)

  const inProgress = mockTasks.filter((t) => t.status === 'in-progress')
  const completed = mockTasks.filter((t) => t.status === 'done')
  const completedThisMonth = completed.filter((t) => t.completedDate?.startsWith(thisMonth))
  const upcoming = mockTasks.filter((t) => t.status === 'todo').sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const blocked = mockTasks.filter((t) => t.status === 'blocked' || t.status === 'waiting')
  const overdue = getOverdueTasks()
  const urgent = mockTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done' && t.status !== 'cancelled')

  const appSummary = APPLICATIONS.map((app) => {
    const tasks = mockTasks.filter((t) => t.application === app.name)
    const ip = tasks.filter((t) => t.status === 'in-progress')
    return { app, inProgress: ip }
  }).filter((a) => a.inProgress.length > 0)

  return (
    <div>
      <Header
        title="Management Report"
        subtitle={`Executive summary — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Total Tasks', value: mockTasks.length, cls: 'bg-gray-50 text-gray-700' },
          { label: 'In Progress', value: inProgress.length, cls: 'bg-amber-50 text-amber-700' },
          { label: 'Completed', value: completed.length, cls: 'bg-green-50 text-green-700' },
          { label: 'This Month Done', value: completedThisMonth.length, cls: 'bg-teal-50 text-teal-700' },
          { label: 'Blocked / Waiting', value: blocked.length, cls: 'bg-red-50 text-red-700' },
          { label: 'Overdue', value: overdue.length, cls: 'bg-orange-50 text-orange-700' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-xl p-4 ${cls} border border-white/50 shadow-sm`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs font-medium opacity-70 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* What we're doing now */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-amber-50 border-b border-amber-100">
            <PlayCircle size={18} className="text-amber-600" />
            <h2 className="font-bold text-amber-800">What We Are Doing Now</h2>
            <span className="ml-auto text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">{inProgress.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-50">
            {appSummary.map(({ app, inProgress: ip }) => (
              <div key={app.id} className="px-5 py-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {app.name}
                </h3>
                <div className="space-y-2 ml-4">
                  {ip.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-3 text-sm">
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{t.title}</span>
                        <span className="text-gray-400 ml-2">— {t.owner}</span>
                        {t.remark && <p className="text-xs text-gray-400 mt-0.5 italic">{t.remark}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{t.progress}%</span>
                        <PriorityBadge priority={t.priority} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What we completed */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-green-50 border-b border-green-100">
            <CheckCircle2 size={18} className="text-green-600" />
            <h2 className="font-bold text-green-800">What We Already Completed</h2>
            <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">{completed.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-50">
            {completed.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{t.application}</span>
                    <span className="font-medium text-gray-800 text-sm">{t.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Owner: {t.owner} · Completed: {t.completedDate}</p>
                </div>
                <StatusBadge status="done" size="sm" />
              </div>
            ))}
          </div>
        </section>

        {/* What's next */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-blue-50 border-b border-blue-100">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="font-bold text-blue-800">What We Will Do Next</h2>
            <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{upcoming.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-50">
            {upcoming.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{t.application}</span>
                    <span className="font-medium text-gray-800 text-sm">{t.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Owner: {t.owner} · Planned start: {t.startDate} · Due: {t.dueDate}</p>
                </div>
                <PriorityBadge priority={t.priority} size="sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Key Blockers */}
        {blocked.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 bg-red-50 border-b border-red-100">
              <ShieldAlert size={18} className="text-red-600" />
              <h2 className="font-bold text-red-800">Key Blockers & Waiting</h2>
              <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{blocked.length} tasks</span>
            </div>
            <div className="divide-y divide-gray-50">
              {blocked.map((t) => (
                <div key={t.id} className="px-5 py-3 hover:bg-red-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{t.application}</span>
                        <span className="font-medium text-gray-800 text-sm">{t.title}</span>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                      {t.remark && (
                        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1">{t.remark}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Owner: {t.owner} · Due: {t.dueDate}</p>
                    </div>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* High Priority */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-orange-50 border-b border-orange-100">
            <TrendingUp size={18} className="text-orange-600" />
            <h2 className="font-bold text-orange-800">High Priority Items</h2>
            <span className="ml-auto text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">{urgent.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-50">
            {urgent.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-orange-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{t.application}</span>
                    <span className="font-medium text-gray-800 text-sm">{t.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Owner: {t.owner} · Due: {t.dueDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} size="sm" />
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Overdue */}
        {overdue.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 bg-red-50 border-b border-red-100">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-bold text-red-800">Overdue Items — Immediate Action Required</h2>
              <span className="ml-auto text-xs bg-red-700 text-white px-2 py-0.5 rounded-full">{overdue.length} tasks</span>
            </div>
            <div className="divide-y divide-gray-50">
              {overdue.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-red-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{t.application}</span>
                      <span className="font-medium text-red-800 text-sm">{t.title}</span>
                    </div>
                    <p className="text-xs text-red-400 mt-0.5 font-medium">Owner: {t.owner} · Was due: {t.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} size="sm" />
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
