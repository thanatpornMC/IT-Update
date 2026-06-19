import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
}

export default function Header({ title, subtitle, action, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3">
          {action}
          {children}
        </div>
      )}
    </div>
  )
}
