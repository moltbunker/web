import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning'
  children: React.ReactNode
}

const Badge = ({ variant = 'default', children, className = '', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-muted text-foreground',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
