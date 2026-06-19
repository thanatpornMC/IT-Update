import { TaskStatus, STATUS_LABELS } from '@/types'
import clsx from 'clsx'

interface StatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md'
}

const statusClasses: Record<TaskStatus, string> = {
  todo: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  waiting: 'bg-purple-100 text-purple-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        statusClasses[status],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
