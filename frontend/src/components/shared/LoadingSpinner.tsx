import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface LoadingSpinnerProps {
  size?: number
  className?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 24, className, fullScreen }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={size} className={cn('animate-spin text-blue-600', className)} />
      </div>
    )
  }

  return <Loader2 size={size} className={cn('animate-spin text-blue-600', className)} />
}

