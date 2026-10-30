import { LogOut, User, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'

export function Navbar() {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          type="button"
          aria-label="Notifikasi"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.roles?.[0] ?? 'User'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}

