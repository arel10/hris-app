import { cn } from '@/lib/utils/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

const variantClasses = {
  default: 'text-white shadow-sm hover:opacity-95',
  destructive: 'bg-[var(--danger)] text-white hover:opacity-95',
  outline: 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--dark)] hover:bg-gray-50',
  ghost: 'text-[var(--dark)] hover:bg-[var(--bg-subtle)]',
  secondary: 'bg-[var(--bg-subtle)] text-[var(--dark)] hover:bg-gray-100',
}

const sizeClasses = {
  default: 'h-9 px-4 py-2 text-xs font-bold rounded-[10px]',
  sm: 'h-8 px-3 text-[11px] font-bold rounded-[8px]',
  lg: 'h-11 px-5 text-sm font-bold rounded-[12px]',
  icon: 'h-9 w-9 rounded-[10px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, disabled, children, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          ...(variant === 'default' ? { backgroundColor: 'var(--primary)' } : {}),
          ...style,
        }}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && <i className="fa-solid fa-circle-notch fa-spin mr-2 text-xs" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
