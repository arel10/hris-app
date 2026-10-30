import { cn } from '@/lib/utils/utils'

interface LoadingSpinnerProps {
  size?: number
  className?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 24, className, fullScreen }: LoadingSpinnerProps) {
  const spinner = (
    <i
      className={cn('fa-solid fa-circle-notch fa-spin', className)}
      style={{ fontSize: `${size}px`, color: 'var(--primary)' }}
    />
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
