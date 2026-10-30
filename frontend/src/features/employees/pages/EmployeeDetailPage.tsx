import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEmployee, useEmploymentHistories, useUpdateEmployeeStatus } from '../hooks/useEmployees'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/utils'
import {
  ArrowLeft,
  User,
  Briefcase,
  Phone,
  CreditCard,
  History,
  Building,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'banks' | 'history'>('profile')

  const { data: employee, isLoading } = useEmployee(id!)
  const { data: histories = [] } = useEmploymentHistories(id!)
  const updateStatus = useUpdateEmployeeStatus(id!)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('active')

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-gray-800">Karyawan tidak ditemukan</h2>
        <Link to="/employees" className="text-blue-600 hover:underline mt-2 inline-block">
          Kembali ke Direktori
        </Link>
      </div>
    )
  }

  const fullName = `${employee.first_name} ${employee.last_name || ''}`.trim()
  const statusColors: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    probation: 'bg-amber-50 text-amber-700 border-amber-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
    terminated: 'bg-red-50 text-red-700 border-red-200',
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateStatus.mutateAsync({ status: newStatus })
    setShowStatusModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Direktori
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
            {employee.first_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                  statusColors[employee.employment_status] || 'bg-gray-50 text-gray-700'
                }`}
              >
                {employee.employment_status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="font-mono text-blue-600 font-medium">
                {employee.employee_number}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {employee.position_title || 'Belum ada jabatan'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building size={14} />
                {employee.department_name || 'Belum ada departemen'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setNewStatus(employee.employment_status)
              setShowStatusModal(true)
            }}
          >
            Ubah Status
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={16} />
          Profil & Penempatan
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contacts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Phone size={16} />
          Kontak & Alamat
        </button>
        <button
          onClick={() => setActiveTab('banks')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'banks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={16} />
          Rekening Bank
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={16} />
          Riwayat Karir ({histories.length})
        </button>
      </div>

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Biodata Pribadi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Biodata Pribadi
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Email Resmi</dt>
                <dd className="font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-400" />
                  {employee.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Nomor Telepon</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {employee.phone || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Jenis Kelamin</dt>
                <dd className="font-medium text-gray-900 mt-0.5 capitalize">
                  {employee.gender === 'male' ? 'Laki-laki' : employee.gender === 'female' ? 'Perempuan' : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Nomor KTP / NIK</dt>
                <dd className="font-medium font-mono text-gray-900 mt-0.5">
                  {employee.national_id || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Tempat, Tanggal Lahir</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {employee.birth_place || ''}{' '}
                  {employee.birth_date ? `(${formatDate(employee.birth_date)})` : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status Pernikahan</dt>
                <dd className="font-medium text-gray-900 mt-0.5 capitalize">
                  {employee.marital_status || '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card: Penempatan & Pekerjaan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Penempatan & Kepegawaian
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Departemen</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {employee.department_name || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Jabatan / Posisi</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {employee.position_title || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Atasan Langsung (Manager)</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {employee.manager_name || 'Tidak ada (Top Level)'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Jenis Perjanjian Kerja</dt>
                <dd className="font-medium text-gray-900 mt-0.5 capitalize">
                  {employee.employment_type}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Tanggal Mulai Bekerja</dt>
                <dd className="font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  {formatDate(employee.join_date)}
                </dd>
              </div>
              {employee.termination_date && (
                <div>
                  <dt className="text-xs text-gray-400">Tanggal Berakhir / Resign</dt>
                  <dd className="font-medium text-red-600 mt-0.5">
                    {formatDate(employee.termination_date)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Tab Content: Contacts & Addresses */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contacts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Daftar Kontak
            </h3>
            {employee.contacts && employee.contacts.length > 0 ? (
              <div className="space-y-3">
                {employee.contacts.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">{c.contact_type}</div>
                      <div className="text-sm font-medium text-gray-900">{c.contact_value}</div>
                    </div>
                    {c.is_primary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data kontak tambahan</p>
            )}
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Alamat Tinggal
            </h3>
            {employee.addresses && employee.addresses.length > 0 ? (
              <div className="space-y-3">
                {employee.addresses.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-gray-50 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{a.address_type}</span>
                      {a.is_primary && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-gray-900">{a.street}</div>
                    <div className="text-xs text-gray-500">
                      {a.city}, {a.province} {a.postal_code || ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data alamat</p>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Banks */}
      {activeTab === 'banks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Rekening Bank untuk Payroll
          </h3>
          {employee.bank_accounts && employee.bank_accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {employee.bank_accounts.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{b.bank_name}</span>
                    {b.is_primary && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold uppercase">
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-base font-semibold text-gray-800">
                    {b.account_number}
                  </div>
                  <div className="text-xs text-gray-500">a.n. {b.account_holder}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada rekening bank yang didaftarkan</p>
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Riwayat Penempatan & Promosi
          </h3>
          {histories.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada catatan riwayat pekerjaan</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {histories.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {h.position_title || 'Posisi tidak spesifik'}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {formatDate(h.effective_from)}{' '}
                        {h.effective_until ? `- ${formatDate(h.effective_until)}` : '(Sekarang)'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Departemen: <span className="font-medium">{h.department_name || '-'}</span>
                    </div>
                    {h.change_reason && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        Alasan: {h.change_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Ubah Status Karyawan</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Aktif</option>
                  <option value="probation">Masa Percobaan (Probation)</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="terminated">Terminasi (Keluar)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowStatusModal(false)}>
                  Batal
                </Button>
                <Button type="submit" isLoading={updateStatus.isPending}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

