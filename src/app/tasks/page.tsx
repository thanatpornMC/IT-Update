'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import ProgressBar from '@/components/ProgressBar'
import TaskFormModal from '@/components/TaskFormModal'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Task, APPLICATIONS, TaskStatus, TaskPriority } from '@/types'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react'

const PAGE_SIZE = 10

type SortKey = 'title' | 'application' | 'owner' | 'priority' | 'status' | 'dueDate' | 'updatedAt' | 'progress'
type SortDir = 'asc' | 'desc'

const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
const statusOrder: Record<TaskStatus, number> = { 'in-progress': 0, blocked: 1, waiting: 2, todo: 3, done: 4, cancelled: 5 }

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, resetToDefault } = useTaskStore()

  const [search, setSearch] = useState('')
  const [filterApp, setFilterApp] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const owners = useMemo(() => [...new Set(tasks.map((t) => t.owner))].sort(), [tasks])

  const filtered = useMemo(() => {
    let result = tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.owner.toLowerCase().includes(search.toLowerCase())) return false
      if (filterApp && t.application !== filterApp) return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterOwner && t.owner !== filterOwner) return false
      return true
    })

    result = [...result].sort((a, b) => {
      let va: string | number = a[sortKey] as string | number
      let vb: string | number = b[sortKey] as string | number
      if (sortKey === 'priority') { va = priorityOrder[a.priority]; vb = priorityOrder[b.priority] }
      if (sortKey === 'status') { va = statusOrder[a.status]; vb = statusOrder[b.status] }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [tasks, search, filterApp, filterStatus, filterPriority, filterOwner, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="text-gray-300" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />
  }

  function ThSort({ label, k }: { label: string; k: SortKey }) {
    return (
      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort(k)}>
        <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
      </th>
    )
  }

  function openNew() { setEditingTask(null); setModalOpen(true) }
  function openEdit(t: Task, e: React.MouseEvent) { e.stopPropagation(); setEditingTask(t); setModalOpen(true) }
  function handleDelete(id: string, e: React.MouseEvent) { e.stopPropagation(); setConfirmDelete(id) }

  return (
    <div>
      <Header
        title="All Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''} found`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={resetToDefault} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
              <RotateCcw size={13} /> Reset Data
            </button>
            <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
              <Plus size={15} /> New Task
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search tasks or owner..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" value={filterApp} onChange={(e) => { setFilterApp(e.target.value); setPage(1) }}>
            <option value="">All Apps</option>
            {APPLICATIONS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1) }}>
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" value={filterOwner} onChange={(e) => { setFilterOwner(e.target.value); setPage(1) }}>
            <option value="">All Owners</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {(search || filterApp || filterStatus || filterPriority || filterOwner) && (
            <button className="text-sm text-gray-500 hover:text-red-500 px-2" onClick={() => { setSearch(''); setFilterApp(''); setFilterStatus(''); setFilterPriority(''); setFilterOwner(''); setPage(1) }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <ThSort label="Application" k="application" />
                <ThSort label="Task Title" k="title" />
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Requester</th>
                <ThSort label="Owner" k="owner" />
                <ThSort label="Priority" k="priority" />
                <ThSort label="Status" k="status" />
                <ThSort label="Progress" k="progress" />
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Start</th>
                <ThSort label="Due Date" k="dueDate" />
                <ThSort label="Updated" k="updatedAt" />
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Remark</th>
                <th className="px-3 py-2 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((task) => {
                const today = new Date().toISOString().split('T')[0]
                const isOverdue = task.dueDate < today && task.status !== 'done' && task.status !== 'cancelled'
                const isExpanded = expanded === task.id
                return (
                  <>
                    <tr key={task.id} className={`hover:bg-blue-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`} onClick={() => setExpanded(isExpanded ? null : task.id)}>
                      <td className="px-3 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium whitespace-nowrap">{task.application}</span>
                      </td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{task.requester}</td>
                      <td className="px-3 py-3 text-gray-700 font-medium whitespace-nowrap">{task.owner}</td>
                      <td className="px-3 py-3"><PriorityBadge priority={task.priority} size="sm" /></td>
                      <td className="px-3 py-3"><StatusBadge status={task.status} size="sm" /></td>
                      <td className="px-3 py-3 min-w-[100px]"><ProgressBar progress={task.progress} size="sm" showLabel /></td>
                      <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{task.startDate}</td>
                      <td className={`px-3 py-3 text-xs whitespace-nowrap font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>{task.dueDate}</td>
                      <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{task.updatedAt}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs max-w-[120px] truncate">{task.remark || '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => openEdit(task, e)} className="p-1.5 hover:bg-blue-100 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={(e) => handleDelete(task.id, e)} className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${task.id}-expanded`} className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={12} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="md:col-span-2">
                              <p className="font-semibold text-gray-700 mb-1">Description</p>
                              <p className="text-gray-600 leading-relaxed">{task.description}</p>
                              {task.remark && (
                                <div className="mt-2">
                                  <p className="font-semibold text-gray-700 mb-1">Remark</p>
                                  <p className="text-gray-600">{task.remark}</p>
                                </div>
                              )}
                              {task.attachmentLink && (
                                <div className="mt-2">
                                  <span className="font-semibold text-gray-700">Link: </span>
                                  <a href={task.attachmentLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{task.attachmentLink}</a>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-gray-500">
                              <div><span className="font-medium">ID:</span> {task.id}</div>
                              <div><span className="font-medium">Created:</span> {task.createdAt}</div>
                              {task.completedDate && <div><span className="font-medium">Completed:</span> {task.completedDate}</div>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">No tasks found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40">←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 rounded text-xs font-medium ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>

      <TaskFormModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={(t) => editingTask ? updateTask(t) : addTask(t)}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { deleteTask(confirmDelete); setConfirmDelete(null) }} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
