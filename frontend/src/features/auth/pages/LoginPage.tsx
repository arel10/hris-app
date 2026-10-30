import { LoginForm } from '../components/LoginForm'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      <div className="w-full max-w-[420px]">
        <div className="card-deck p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex items-center justify-center rounded-2xl text-white shadow-sm"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--primary)',
              }}
            >
              <i className="fa-solid fa-layer-group text-xl" />
            </div>
            <h1
              className="font-extrabold tracking-tight"
              style={{ fontSize: '24px', letterSpacing: '-0.5px', color: 'var(--dark)' }}
            >
              PeopleCore HRIS
            </h1>
            <p
              className="mt-1"
              style={{ fontSize: '13px', color: 'var(--muted)' }}
            >
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>
          <LoginForm />
        </div>
        <p
          className="mt-5 text-center"
          style={{ fontSize: '11px', color: 'var(--muted)' }}
        >
          © 2026 PeopleCore HRIS. Built with DealDeck Design System.
        </p>
      </div>
    </div>
  )
}
