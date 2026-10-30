import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmployees } from '../hooks/useEmployees'
import { useDepartments } from '@/features/organization/hooks/useOrganization'
import { CreateEmployeeModal } from '../components/CreateEmployeeModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/utils'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/lib/constants/permissions'
import { ContentHeader } from '@/components/layout/ContentHeader'

export function EmployeeListPage() {
  const { hasPermission } = usePermission()
  const canCreate = hasPermission(PERMISSIONS.EMPLOYEES_CREATE)

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
    <div className="flex flex-col gap-6">
      {/* Content Header */}
      <ContentHeader
        title="Direktori Karyawan"
        subtitle="Kelola data seluruh karyawan, status penempatan, dan riwayat pekerjaan"
        action={
          canCreate ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--primary)',
                padding: '10px 18px',
                fontSize: '12px',
              }}
            >
              <i className="fa-solid fa-user-plus text-xs" />
              Tambah Karyawan
            </button>
          ) : undefined
        }
      />

      {/* Main Table Card */}
      <div className="card-deck">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1 max-w-md">
            <i
              className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted)' }}
            />
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor karyawan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 rounded-[10px] focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--dark)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-[10px] focus:outline-none transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--dark)',
              }}
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
              className="px-3 py-2 rounded-[10px] focus:outline-none transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--dark)',
              }}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="probation">Probation</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner size={28} />
          </div>
        ) : employees.length === 0 ? (
          <div
            className="p-16 text-center"
            style={{ fontSize: '12px', color: 'var(--muted)' }}
          >
            Tidak ada data karyawan yang sesuai kriteria pencarian
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    No. Karyawan
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Karyawan
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Departemen
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Jabatan
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Status
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Bergabung
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold tracking-wider uppercase text-right"
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const fullName = `${emp.first_name} ${emp.last_name || ''}`.trim()
                  const isPositive = emp.employment_status === 'active'
                  const isDanger = emp.employment_status === 'terminated'

                  return (
                    <tr
                      key={emp.id}
                      className="transition-colors hover:bg-gray-50/50"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td
                        className="py-3.5 px-4 font-bold tabular-nums"
                        style={{ fontSize: '11px', color: 'var(--muted)' }}
                      >
                        {emp.employee_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold leading-tight"
                          style={{ fontSize: '12px', color: 'var(--dark)' }}
                        >
                          {fullName}
                        </div>
                        <div
                          style={{ fontSize: '10px', color: 'var(--muted)' }}
                        >
                          {emp.email}
                        </div>
                      </td>
                      <td
                        className="py-3.5 px-4 font-semibold"
                        style={{ fontSize: '12px', color: 'var(--muted)' }}
                      >
                        {emp.department_name || '-'}
                      </td>
                      <td
                        className="py-3.5 px-4 font-semibold"
                        style={{ fontSize: '12px', color: 'var(--dark)' }}
                      >
                        {emp.position_title || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="badge-trend-deck capitalize"
                          style={{
                            backgroundColor: isPositive
                              ? 'var(--success-bg)'
                              : isDanger
                              ? 'var(--danger-bg)'
                              : 'var(--bg-subtle)',
                            color: isPositive
                              ? 'var(--success)'
                              : isDanger
                              ? 'var(--danger)'
                              : 'var(--muted)',
                          }}
                        >
                          {emp.employment_status}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4"
                        style={{ fontSize: '10px', color: 'var(--muted)' }}
                      >
                        {formatDate(emp.join_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="inline-flex items-center gap-1.5 font-bold rounded-[8px] transition-all hover:opacity-85"
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(27, 81, 244, 0.08)',
                            color: 'var(--primary)',
                            padding: '6px 12px',
                          }}
                        >
                          <i className="fa-solid fa-eye text-[10px]" />
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
          <div
            className="flex items-center justify-between pt-4 mt-2"
            style={{ fontSize: '12px', color: 'var(--muted)' }}
          >
            <div>
              Menampilkan {employees.length} dari {meta.total} karyawan (Halaman {meta.page} dari{' '}
              {meta.total_pages})
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="flex items-center justify-center rounded-[8px] transition-all disabled:opacity-30 cursor-pointer"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--dark)',
                }}
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>
              <button
                type="button"
                disabled={page >= meta.total_pages}
                onClick={() => setPage((prev) => prev + 1)}
                className="flex items-center justify-center rounded-[8px] transition-all disabled:opacity-30 cursor-pointer"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--dark)',
                }}
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
