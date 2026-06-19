import { TaskPriority, PRIORITY_LABELS } from '@/types'
import clsx from 'clsx'

interface PriorityBadgeProps {
  priority: TaskPriority
  size?: 'sm' | 'md'
}

const priorityClasses: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        priorityClasses[priority],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
