import clsx from 'clsx'

interface ProgressBarProps {
  progress: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function ProgressBar({ progress, showLabel = true, size = 'md' }: ProgressBarProps) {
  const color =
    progress === 100
      ? 'bg-green-500'
      : progress >= 60
      ? 'bg-blue-500'
      : progress >= 30
      ? 'bg-amber-500'
      : 'bg-gray-400'

  return (
    <div className="flex items-center gap-2">
      <div className={clsx('flex-1 bg-gray-200 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>}
    </div>
  )
}
