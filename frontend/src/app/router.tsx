import { createBrowserRouter, Navigate, Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage'
import { EmployeeDetailPage } from '@/features/employees/pages/EmployeeDetailPage'
import { OrganizationPage } from '@/features/organization/pages/OrganizationPage'
import { useAuthStore } from '@/stores/authStore'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/lib/constants/permissions'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PermissionRoute({ permission, children }: { permission: string; children: ReactNode }) {
  const { hasPermission } = usePermission()
  if (!hasPermission(permission)) {
    return (
      <div className="card-deck flex flex-col items-center justify-center py-20 text-center">
        <div
          className="mb-4 flex items-center justify-center rounded-2xl"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
          }}
        >
          <i className="fa-solid fa-shield-halved text-2xl" />
        </div>
        <h2 className="font-extrabold text-xl" style={{ color: 'var(--dark)' }}>
          Akses Ditolak (403 Forbidden)
        </h2>
        <p className="mt-2 text-xs max-w-md" style={{ color: 'var(--muted)' }}>
          Anda tidak memiliki izin yang diperlukan (
          <code
            className="tabular-nums font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
          >
            {permission}
          </code>
          ) untuk mengakses halaman ini.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 rounded-[10px] text-white font-bold transition-all hover:opacity-95 shadow-sm"
          style={{
            backgroundColor: 'var(--primary)',
            padding: '10px 20px',
            fontSize: '12px',
          }}
        >
          Kembali ke Dashboard
        </Link>
      </div>
    )
  }
  return <>{children}</>
}

function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="card-deck flex flex-col items-center justify-center py-24 text-center">
      <div
        className="mb-4 flex items-center justify-center rounded-2xl"
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--primary)',
        }}
      >
        <i className="fa-solid fa-screwdriver-wrench text-2xl" />
      </div>
      <h2 className="font-bold text-lg" style={{ color: 'var(--dark)' }}>
        {title}
      </h2>
      <p className="mt-1" style={{ fontSize: '12px', color: 'var(--muted)' }}>
        Modul ini dijadwalkan dalam fase pengembangan berikutnya
      </p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'employees',
        element: (
          <PermissionRoute permission={PERMISSIONS.EMPLOYEES_READ}>
            <EmployeeListPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'employees/:id',
        element: (
          <PermissionRoute permission={PERMISSIONS.EMPLOYEES_READ}>
            <EmployeeDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'profile',
        element: <EmployeeDetailPage />,
      },
      {
        path: 'organization',
        element: (
          <PermissionRoute permission={PERMISSIONS.ORGANIZATION_READ}>
            <OrganizationPage />
          </PermissionRoute>
        ),
      },
      { path: 'attendance', element: <ComingSoonPage title="Manajemen Kehadiran" /> },
      { path: 'leave', element: <ComingSoonPage title="Manajemen Cuti" /> },
      { path: 'payroll', element: <ComingSoonPage title="Penggajian" /> },
      { path: 'contracts', element: <ComingSoonPage title="Manajemen Kontrak" /> },
      { path: 'performance', element: <ComingSoonPage title="Manajemen Kinerja" /> },
      { path: 'recruitment', element: <ComingSoonPage title="Rekrutmen" /> },
      { path: 'training', element: <ComingSoonPage title="Pelatihan & Pengembangan" /> },
      { path: 'documents', element: <ComingSoonPage title="Manajemen Dokumen" /> },
      { path: 'reports', element: <ComingSoonPage title="Laporan & Analitik" /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
