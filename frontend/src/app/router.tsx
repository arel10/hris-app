import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage'
import { EmployeeDetailPage } from '@/features/employees/pages/EmployeeDetailPage'
import { OrganizationPage } from '@/features/organization/pages/OrganizationPage'
import { useAuthStore } from '@/stores/authStore'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-6xl">🚧</div>
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="mt-2 text-sm text-gray-400">Modul ini sedang dalam pengembangan</p>
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
      { path: 'employees', element: <EmployeeListPage /> },
      { path: 'employees/:id', element: <EmployeeDetailPage /> },
      { path: 'organization', element: <OrganizationPage /> },
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
