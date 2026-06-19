'use client'

import { mockTasks } from '@/data/mockData'
import { APPLICATIONS } from '@/types'
import Header from '@/components/Header'
import Link from 'next/link'
import { AppWindow, AlertTriangle, CheckCircle2, PlayCircle, Clock } from 'lucide-react'

export default function ApplicationsPage() {
  const appData = APPLICATIONS.map((app) => {
    const tasks = mockTasks.filter((t) => t.application === app.name)
    const inProgress = tasks.filter((t) => t.status === 'in-progress')
    const blocked = tasks.filter((t) => t.status === 'blocked')
    const done = tasks.filter((t) => t.status === 'done')
    const todo = tasks.filter((t) => t.status === 'todo')
    const waiting = tasks.filter((t) => t.status === 'waiting')
    const pct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0
    return { app, tasks, inProgress, blocked, done, todo, waiting, pct }
  })

  return (
    <div>
      <Header title="Applications" subtitle="Overview of all 7 systems" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {appData.map(({ app, tasks, inProgress, blocked, done, todo, waiting, pct }) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <AppWindow size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{app.name}</h3>
                  <p className="text-xs text-gray-400">{tasks.length} tasks total</p>
                </div>
              </div>
              {blocked.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                  <AlertTriangle size={11} />
                  {blocked.length} blocked
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{app.description}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall completion</span>
                <span className="font-medium text-gray-700">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-lg font-bold text-blue-700">{todo.length}</p>
                <p className="text-xs text-blue-500">To Do</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <PlayCircle size={12} className="text-amber-600" />
                  <p className="text-lg font-bold text-amber-700">{inProgress.length}</p>
                </div>
                <p className="text-xs text-amber-500">In Progress</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <Clock size={12} className="text-purple-600" />
                  <p className="text-lg font-bold text-purple-700">{waiting.length}</p>
                </div>
                <p className="text-xs text-purple-500">Waiting</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} className="text-green-600" />
                  <p className="text-lg font-bold text-green-700">{done.length}</p>
                </div>
                <p className="text-xs text-green-500">Done</p>
              </div>
            </div>

            {/* In Progress preview */}
            {inProgress.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Currently working on:</p>
                <div className="space-y-1">
                  {inProgress.slice(0, 2).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-gray-700 truncate">{t.title}</span>
                    </div>
                  ))}
                  {inProgress.length > 2 && (
                    <p className="text-xs text-gray-400 pl-3.5">+{inProgress.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
