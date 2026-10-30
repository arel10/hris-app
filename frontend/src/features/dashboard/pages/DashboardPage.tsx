import { useDashboardSummary } from '../hooks/useDashboard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Clock,
  Building2,
  Briefcase,
  ArrowRight,
  UserPlus,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/utils'

export function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Karyawan',
      value: summary?.total_employees || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Karyawan Aktif',
      value: summary?.active_employees || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Masa Percobaan',
      value: summary?.probation_employees || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Departemen',
      value: summary?.total_departments || 0,
      icon: Building2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total Jabatan',
      value: summary?.total_positions || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama</h1>
          <p className="text-sm text-gray-500">
            Selamat datang di PeopleCore HRIS — Ringkasan metrik SDM dan organisasi perusahaan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/employees"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Kelola Karyawan
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Karyawan Terbaru Bergabung</h2>
            <Link
              to="/employees"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight size={14} />
            </Link>
          </div>

          {!summary?.recent_employees || summary.recent_employees.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">Belum ada data karyawan</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {summary.recent_employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center text-sm">
                      {emp.full_name[0]}
                    </div>
                    <div>
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-semibold text-sm text-gray-900 hover:text-blue-600"
                      >
                        {emp.full_name}
                      </Link>
                      <div className="text-xs text-gray-500 font-mono">
                        {emp.employee_number} • {emp.position_title || 'Staf'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium">
                      {emp.department_name || '-'}
                    </span>
                    <div className="text-[11px] text-gray-400">{formatDate(emp.join_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">Aksi Cepat</h2>
          <div className="space-y-2">
            <Link
              to="/organization"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                    Struktur Organisasi
                  </div>
                  <div className="text-xs text-gray-400">Atur departemen dan jabatan</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link
              to="/employees"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                    Direktori Karyawan
                  </div>
                  <div className="text-xs text-gray-400">Lihat dan filter seluruh profil staf</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

