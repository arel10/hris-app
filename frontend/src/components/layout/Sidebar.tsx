import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Target,
  UserPlus,
  GraduationCap,
  FolderOpen,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/lib/constants/permissions'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { label: 'Karyawan', href: '/employees', icon: Users, permission: PERMISSIONS.EMPLOYEES_READ },
  { label: 'Organisasi', href: '/organization', icon: Building2, permission: PERMISSIONS.ORGANIZATION_READ },
  { label: 'Kehadiran', href: '/attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_READ },
  { label: 'Cuti', href: '/leave', icon: Calendar, permission: PERMISSIONS.LEAVES_READ },
  { label: 'Penggajian', href: '/payroll', icon: DollarSign, permission: PERMISSIONS.PAYROLL_READ },
  { label: 'Kontrak', href: '/contracts', icon: FileText, permission: PERMISSIONS.CONTRACTS_READ },
  { label: 'Kinerja', href: '/performance', icon: Target, permission: PERMISSIONS.PERFORMANCE_READ },
  { label: 'Rekrutmen', href: '/recruitment', icon: UserPlus, permission: PERMISSIONS.RECRUITMENT_READ },
  { label: 'Pelatihan', href: '/training', icon: GraduationCap, permission: PERMISSIONS.TRAINING_READ },
  { label: 'Dokumen', href: '/documents', icon: FolderOpen, permission: PERMISSIONS.DOCUMENTS_READ },
  { label: 'Laporan', href: '/reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_READ },
]

export function Sidebar() {
  const { hasPermission } = usePermission()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">PeopleCore</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">HRIS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) return null
            const Icon = item.icon

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

