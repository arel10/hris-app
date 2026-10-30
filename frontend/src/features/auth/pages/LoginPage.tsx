import { LoginForm } from '../components/LoginForm'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PeopleCore HRIS</h1>
            <p className="mt-1 text-sm text-gray-500">Masuk ke akun Anda</p>
          </div>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          © 2026 PeopleCore HRIS. All rights reserved.
        </p>
      </div>
    </div>
  )
}

