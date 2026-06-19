export type TaskStatus = 'todo' | 'in-progress' | 'waiting' | 'blocked' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  application: string
  requester: string
  owner: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  dueDate: string
  completedDate?: string
  progress: number
  remark?: string
  attachmentLink?: string
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  name: string
  description: string
}

export const APPLICATIONS: Application[] = [
  { id: 'crm', name: 'CRM', description: 'Customer Relationship Management system' },
  { id: 'portal', name: 'Portal', description: 'Internal employee and partner portal' },
  { id: 'merchant-app', name: 'Merchant App', description: 'Mobile application for merchants' },
  { id: 'mothercharger-app', name: 'Mothercharger App', description: 'EV charging mobile application' },
  { id: 'back-end-bj', name: 'Back End BJ', description: 'Backend services for BJ settlement' },
  { id: 'screen-for-monitor', name: 'Screen for Monitor', description: 'Operations monitoring dashboard' },
  { id: 'ntt', name: 'NTT', description: 'NTT integration and settlement system' },
]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}
