import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ContentHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function ContentHeader({ title, subtitle, action }: ContentHeaderProps) {
  const { user } = useAuthStore()
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U'
  const userRole = user?.roles?.[0] ? user.roles[0].replace('_', ' ') : 'User'

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      {/* Title & Subtitle */}
      <div>
        <h1
          className="font-extrabold tracking-tight"
          style={{ fontSize: '26px', letterSpacing: '-0.5px', color: 'var(--dark)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-0.5"
            style={{ fontSize: '13px', color: 'var(--muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {action}

        {/* Notification Button */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex items-center justify-center rounded-full transition-all hover:bg-gray-50"
          style={{
            width: '42px',
            height: '42px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
            color: 'var(--muted)',
          }}
        >
          <i className="fa-solid fa-bell text-base" />
          <span
            className="absolute top-2.5 right-2.5 rounded-full"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
            }}
          />
        </button>

        {/* Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 rounded-full transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
            padding: '3px 14px 3px 3px',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full font-bold text-sm"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--primary)',
            }}
          >
            {userInitial}
          </div>
          <div className="text-left hidden sm:block">
            <p
              className="font-bold leading-tight truncate max-w-[120px]"
              style={{ fontSize: '12px', color: 'var(--dark)' }}
            >
              {user?.email?.split('@')[0]}
            </p>
            <p
              className="capitalize leading-tight"
              style={{ fontSize: '10px', color: 'var(--muted)' }}
            >
              {userRole}
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}

