import { NavLink } from 'react-router-dom'
import { usePermission } from '@/hooks/usePermission'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface NavItemDef {
  label: string
  href: string
  icon: string
  permission?: string | null
}

interface NavGroupDef {
  label: string
  items: NavItemDef[]
}

const navGroups: NavGroupDef[] = [
  {
    label: 'MENU',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'fa-solid fa-chart-pie' },
      { label: 'Karyawan', href: '/employees', icon: 'fa-solid fa-users', permission: PERMISSIONS.EMPLOYEES_READ },
      { label: 'Organisasi', href: '/organization', icon: 'fa-solid fa-sitemap', permission: PERMISSIONS.ORGANIZATION_READ },
    ],
  },
  {
    label: 'SDM',
    items: [
      { label: 'Kehadiran', href: '/attendance', icon: 'fa-solid fa-clock', permission: PERMISSIONS.ATTENDANCE_READ },
      { label: 'Cuti', href: '/leave', icon: 'fa-solid fa-calendar-days', permission: PERMISSIONS.LEAVES_READ },
      { label: 'Kontrak', href: '/contracts', icon: 'fa-solid fa-file-contract', permission: PERMISSIONS.CONTRACTS_READ },
      { label: 'Kinerja', href: '/performance', icon: 'fa-solid fa-bullseye', permission: PERMISSIONS.PERFORMANCE_READ },
      { label: 'Rekrutmen', href: '/recruitment', icon: 'fa-solid fa-user-plus', permission: PERMISSIONS.RECRUITMENT_READ },
      { label: 'Pelatihan', href: '/training', icon: 'fa-solid fa-graduation-cap', permission: PERMISSIONS.TRAINING_READ },
    ],
  },
  {
    label: 'FINANCIAL',
    items: [
      { label: 'Penggajian', href: '/payroll', icon: 'fa-solid fa-money-bill-wave', permission: PERMISSIONS.PAYROLL_READ },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { label: 'Dokumen', href: '/documents', icon: 'fa-solid fa-folder-open', permission: PERMISSIONS.DOCUMENTS_READ },
      { label: 'Laporan', href: '/reports', icon: 'fa-solid fa-chart-simple', permission: PERMISSIONS.REPORTS_READ },
    ],
  },
]

export function Sidebar() {
  const { hasPermission } = usePermission()
  const { mutate: logout } = useLogout()
  const { user } = useAuthStore()

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        padding: '30px 20px',
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2" style={{ marginBottom: '35px' }}>
        <div
          className="flex items-center justify-center rounded-xl text-white shadow-sm"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary)',
          }}
        >
          <i className="fa-solid fa-layer-group text-base" />
        </div>
        <div>
          <h2
            className="font-extrabold tracking-tight text-gray-900 leading-tight"
            style={{ fontSize: '18px', color: 'var(--dark)' }}
          >
            PeopleCore
          </h2>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">HRIS</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          )

          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <div className="deck-nav-group-label">{group.label}</div>
              <ul className="space-y-1.5">
                {visibleItems.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `deck-nav-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <i className={`${item.icon} text-base w-5 text-center`} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {/* Logout in Tools */}
        <div>
          <div className="deck-nav-group-label">AKUN</div>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => logout()}
                className="deck-nav-item w-full text-left"
                style={{ color: 'var(--danger)' }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-base w-5 text-center" />
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
