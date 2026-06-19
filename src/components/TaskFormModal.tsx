'use client'

import { useEffect, useState } from 'react'
import { Task, TaskStatus, TaskPriority, APPLICATIONS } from '@/types'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  task?: Task | null
  onClose: () => void
  onSave: (task: Task) => void
}

const emptyForm = (): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  description: '',
  application: APPLICATIONS[0].name,
  requester: '',
  owner: '',
  status: 'todo',
  priority: 'medium',
  startDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  progress: 0,
  remark: '',
  attachmentLink: '',
})

function generateId(application: string): string {
  const prefix = application.replace(/\s+/g, '').slice(0, 4).toUpperCase()
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export default function TaskFormModal({ open, task, onClose, onSave }: Props) {
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (task) {
      const { id, createdAt, updatedAt, ...rest } = task
      void id; void createdAt; void updatedAt
      setForm({ ...emptyForm(), ...rest })
    } else {
      setForm(emptyForm())
    }
  }, [task, open])

  if (!open) return null

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const now = new Date().toISOString().split('T')[0]
    const saved: Task = task
      ? { ...task, ...form, updatedAt: now, completedDate: form.status === 'done' ? (task.completedDate ?? now) : undefined }
      : { ...form, id: generateId(form.application), createdAt: now, updatedAt: now, completedDate: form.status === 'done' ? now : undefined }
    onSave(saved)
    onClose()
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelCls}>Title *</label>
            <input required className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Task title" />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the task..." />
          </div>

          {/* Row: Application + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Application *</label>
              <select required className={inputCls} value={form.application} onChange={(e) => set('application', e.target.value)}>
                {APPLICATIONS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority *</label>
              <select required className={inputCls} value={form.priority} onChange={(e) => set('priority', e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row: Status + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status *</label>
              <select required className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value as TaskStatus)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Progress ({form.progress}%)</label>
              <input type="range" min={0} max={100} step={5} className="w-full mt-2" value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} />
            </div>
          </div>

          {/* Row: Requester + Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Requester *</label>
              <input required className={inputCls} value={form.requester} onChange={(e) => set('requester', e.target.value)} placeholder="e.g. Manee" />
            </div>
            <div>
              <label className={labelCls}>Owner *</label>
              <input required className={inputCls} value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="e.g. Somchai" />
            </div>
          </div>

          {/* Row: Start + Due */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input required type="date" className={inputCls} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Due Date *</label>
              <input required type="date" className={inputCls} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className={labelCls}>Remark / Note</label>
            <input className={inputCls} value={form.remark ?? ''} onChange={(e) => set('remark', e.target.value)} placeholder="Optional note..." />
          </div>

          {/* Link */}
          <div>
            <label className={labelCls}>Attachment Link</label>
            <input type="url" className={inputCls} value={form.attachmentLink ?? ''} onChange={(e) => set('attachmentLink', e.target.value)} placeholder="https://..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
