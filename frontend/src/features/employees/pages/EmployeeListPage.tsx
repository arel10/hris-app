import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmployees } from '../hooks/useEmployees'
import { useDepartments } from '@/features/organization/hooks/useOrganization'
import { CreateEmployeeModal } from '../components/CreateEmployeeModal'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/utils'
import { UserPlus, Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

export function EmployeeListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: departments = [] } = useDepartments()

  const { data, isLoading } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    department_id: selectedDept || undefined,
    status: selectedStatus || undefined,
  })

  const employees = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direktori Karyawan</h1>
          <p className="text-sm text-gray-500">
            Kelola data seluruh karyawan, status penempatan, dan riwayat pekerjaan
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
          <UserPlus size={16} />
          Tambah Karyawan
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau nomor karyawan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 hidden sm:block" />
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="probation">Probation</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size={28} />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Tidak ada data karyawan yang sesuai kriteria pencarian
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">No. Karyawan</th>
                  <th className="px-6 py-3">Karyawan</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Jabatan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Bergabung</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => {
                  const fullName = `${emp.first_name} ${emp.last_name || ''}`.trim()
                  const statusColors: Record<string, string> = {
                    active: 'bg-green-50 text-green-700 border-green-200',
                    probation: 'bg-amber-50 text-amber-700 border-amber-200',
                    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
                    terminated: 'bg-red-50 text-red-700 border-red-200',
                  }

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-blue-600">
                        {emp.employee_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{fullName}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{emp.department_name || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {emp.position_title || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                            statusColors[emp.employment_status] || 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {emp.employment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(emp.join_date)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={14} />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-600 bg-gray-50/50">
            <div>
              Menampilkan {employees.length} dari {meta.total} karyawan (Halaman {meta.page} dari{' '}
              {meta.total_pages})
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.total_pages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

