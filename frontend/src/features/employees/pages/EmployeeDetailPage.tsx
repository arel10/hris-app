import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useEmployee,
  useEmploymentHistories,
  useUpdateEmployeeStatus,
  useAddContact,
  useDeleteContact,
  useAddAddress,
  useDeleteAddress,
  useAddBankAccount,
  useDeleteBankAccount,
} from '../hooks/useEmployees'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/lib/constants/permissions'
import { EditEmployeeModal } from '../components/EditEmployeeModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/utils'

export function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id || 'me'
  const isSelfProfile = !params.id || params.id === 'me'
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'banks' | 'history'>('profile')

  // Permission checks
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission(PERMISSIONS.EMPLOYEES_UPDATE)

  const { data: employee, isLoading } = useEmployee(id)
  const { data: histories = [] } = useEmploymentHistories(id)
  const updateStatus = useUpdateEmployeeStatus(id)

  const addContact = useAddContact(id)
  const deleteContact = useDeleteContact(id)
  const addAddress = useAddAddress(id)
  const deleteAddress = useDeleteAddress(id)
  const addBankAccount = useAddBankAccount(id)
  const deleteBankAccount = useDeleteBankAccount(id)

  // Modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('active')

  // Sub-resource Modal states
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState('personal_phone')
  const [contactValue, setContactValue] = useState('')
  const [contactIsPrimary, setContactIsPrimary] = useState(false)

  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressType, setAddressType] = useState('current')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [addressIsPrimary, setAddressIsPrimary] = useState(false)

  const [showBankModal, setShowBankModal] = useState(false)
  const [bankName, setBankName] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [bankIsPrimary, setBankIsPrimary] = useState(false)

  if (isLoading) {
    return (
      <div className="p-16 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="card-deck py-16 text-center">
        <h2 className="font-bold text-lg" style={{ color: 'var(--dark)' }}>
          Karyawan tidak ditemukan
        </h2>
        <Link
          to="/employees"
          className="font-semibold text-xs mt-3 inline-block"
          style={{ color: 'var(--primary)' }}
        >
          Kembali ke Direktori
        </Link>
      </div>
    )
  }

  const fullName = `${employee.first_name} ${employee.last_name || ''}`.trim()
  const isPositive = employee.employment_status === 'active'
  const isDanger = employee.employment_status === 'terminated'

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateStatus.mutateAsync({ status: newStatus })
    setShowStatusModal(false)
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactValue) return
    await addContact.mutateAsync({
      contact_type: contactType,
      contact_value: contactValue,
      is_primary: contactIsPrimary,
    })
    setContactValue('')
    setContactIsPrimary(false)
    setShowContactModal(false)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!street) return
    await addAddress.mutateAsync({
      address_type: addressType,
      street,
      city: city || undefined,
      province: province || undefined,
      postal_code: postalCode || undefined,
      is_primary: addressIsPrimary,
    })
    setStreet('')
    setCity('')
    setProvince('')
    setPostalCode('')
    setAddressIsPrimary(false)
    setShowAddressModal(false)
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountNumber || !accountHolder) return
    await addBankAccount.mutateAsync({
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      is_primary: bankIsPrimary,
    })
    setAccountNumber('')
    setAccountHolder('')
    setBankIsPrimary(false)
    setShowBankModal(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link
          to={isSelfProfile ? '/dashboard' : '/employees'}
          className="inline-flex items-center gap-2 font-semibold transition-colors"
          style={{ fontSize: '12px', color: 'var(--muted)' }}
        >
          <i className="fa-solid fa-arrow-left text-xs" />
          {isSelfProfile ? 'Kembali ke Dashboard' : 'Kembali ke Direktori'}
        </Link>
      </div>

      {/* Header Card */}
      <div className="card-deck flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-full font-extrabold text-2xl shrink-0"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--primary)',
            }}
          >
            {employee.first_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="font-extrabold tracking-tight"
                style={{ fontSize: '26px', letterSpacing: '-0.5px', color: 'var(--dark)' }}
              >
                {fullName}
              </h1>
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
                {employee.employment_status}
              </span>
            </div>
            <div
              className="flex flex-wrap items-center gap-3 mt-1"
              style={{ fontSize: '12px', color: 'var(--muted)' }}
            >
              <span className="font-bold tabular-nums" style={{ color: 'var(--muted)' }}>
                {employee.employee_number}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--dark)' }}>
                <i className="fa-solid fa-briefcase text-xs" style={{ color: 'var(--muted)' }} />
                {employee.position_title || 'Belum ada jabatan'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                <i className="fa-solid fa-sitemap text-xs" />
                {employee.department_name || 'Belum ada departemen'}
              </span>
            </div>
          </div>
        </div>

        {canUpdate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-[10px] text-white font-semibold transition-all hover:opacity-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--primary)',
                padding: '9px 16px',
                fontSize: '12px',
              }}
            >
              <i className="fa-solid fa-pen text-xs" />
              Edit Profil
            </button>
            <button
              type="button"
              onClick={() => {
                setNewStatus(employee.employment_status)
                setShowStatusModal(true)
              }}
              className="inline-flex items-center gap-2 rounded-[10px] font-semibold transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--dark)',
                padding: '9px 16px',
                fontSize: '12px',
              }}
            >
              Ubah Status
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'profile', label: 'Profil & Penempatan', icon: 'fa-solid fa-id-card' },
          { key: 'contacts', label: 'Kontak & Alamat', icon: 'fa-solid fa-address-book' },
          { key: 'banks', label: 'Rekening Bank', icon: 'fa-solid fa-credit-card' },
          { key: 'history', label: `Riwayat Karir (${histories.length})`, icon: 'fa-solid fa-clock-rotate-left' },
        ].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2 rounded-[10px] transition-all cursor-pointer"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 600,
                backgroundColor: isActive ? 'rgba(27,81,244,0.08)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
              }}
            >
              <i className={`${tab.icon} text-xs`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card: Biodata Pribadi */}
          <div className="card-deck">
            <h3
              className="font-bold pb-3 border-b mb-4"
              style={{ fontSize: '16px', color: 'var(--dark)', borderColor: 'var(--border)' }}
            >
              Biodata Pribadi
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Email Resmi</dt>
                <dd
                  className="font-semibold mt-1 flex items-center gap-1.5"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  <i className="fa-solid fa-envelope text-xs" style={{ color: 'var(--muted)' }} />
                  {employee.email}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Nomor Telepon</dt>
                <dd
                  className="font-semibold mt-1"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.phone || '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Jenis Kelamin</dt>
                <dd
                  className="font-semibold mt-1 capitalize"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.gender === 'male' ? 'Laki-laki' : employee.gender === 'female' ? 'Perempuan' : '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Nomor KTP / NIK</dt>
                <dd
                  className="font-semibold mt-1 tabular-nums"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.national_id || '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Tempat, Tanggal Lahir</dt>
                <dd
                  className="font-semibold mt-1"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.birth_place || ''}{' '}
                  {employee.birth_date ? `(${formatDate(employee.birth_date)})` : '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Status Pernikahan</dt>
                <dd
                  className="font-semibold mt-1 capitalize"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.marital_status || '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card: Penempatan & Kepegawaian */}
          <div className="card-deck">
            <h3
              className="font-bold pb-3 border-b mb-4"
              style={{ fontSize: '16px', color: 'var(--dark)', borderColor: 'var(--border)' }}
            >
              Penempatan & Kepegawaian
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Departemen</dt>
                <dd
                  className="font-bold mt-1"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.department_name || '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Jabatan / Posisi</dt>
                <dd
                  className="font-bold mt-1"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.position_title || '-'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Atasan Langsung (Manager)</dt>
                <dd
                  className="font-semibold mt-1"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.manager_name || 'Tidak ada (Top Level)'}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Jenis Perjanjian Kerja</dt>
                <dd
                  className="font-semibold mt-1 capitalize"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  {employee.employment_type}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Tanggal Mulai Bekerja</dt>
                <dd
                  className="font-semibold mt-1 flex items-center gap-1.5"
                  style={{ fontSize: '12px', color: 'var(--dark)' }}
                >
                  <i className="fa-solid fa-calendar text-xs" style={{ color: 'var(--muted)' }} />
                  {formatDate(employee.join_date)}
                </dd>
              </div>
              {employee.termination_date && (
                <div>
                  <dt style={{ fontSize: '11px', fontWeight: 600, color: 'var(--danger)' }}>Tanggal Resign</dt>
                  <dd
                    className="font-semibold mt-1"
                    style={{ fontSize: '12px', color: 'var(--danger)' }}
                  >
                    {formatDate(employee.termination_date)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Tab 2: Contacts & Addresses */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contacts */}
          <div className="card-deck">
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
                Daftar Kontak
              </h3>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(27, 81, 244, 0.08)',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    fontSize: '11px',
                  }}
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  Tambah Kontak
                </button>
              )}
            </div>

            {employee.contacts && employee.contacts.length > 0 ? (
              <div className="space-y-2.5">
                {employee.contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div>
                      <div
                        className="font-bold uppercase tracking-wider"
                        style={{ fontSize: '10px', color: 'var(--muted)' }}
                      >
                        {c.contact_type.replace('_', ' ')}
                      </div>
                      <div
                        className="font-bold mt-0.5"
                        style={{ fontSize: '12px', color: 'var(--dark)' }}
                      >
                        {c.contact_value}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.is_primary && (
                        <span
                          className="badge-trend-deck positive"
                          style={{ fontSize: '10px' }}
                        >
                          Utama
                        </span>
                      )}
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => deleteContact.mutate(c.id)}
                          className="p-1.5 rounded-lg transition-colors hover:text-red-600 cursor-pointer"
                          style={{ color: 'var(--muted)' }}
                          title="Hapus Kontak"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Belum ada data kontak tambahan</p>
            )}
          </div>

          {/* Addresses */}
          <div className="card-deck">
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
                Alamat Tinggal
              </h3>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(27, 81, 244, 0.08)',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    fontSize: '11px',
                  }}
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  Tambah Alamat
                </button>
              )}
            </div>

            {employee.addresses && employee.addresses.length > 0 ? (
              <div className="space-y-2.5">
                {employee.addresses.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl flex items-start justify-between"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold uppercase tracking-wider"
                          style={{ fontSize: '10px', color: 'var(--muted)' }}
                        >
                          {a.address_type}
                        </span>
                        {a.is_primary && (
                          <span
                            className="badge-trend-deck positive"
                            style={{ fontSize: '10px' }}
                          >
                            Utama
                          </span>
                        )}
                      </div>
                      <div
                        className="font-bold mt-1"
                        style={{ fontSize: '12px', color: 'var(--dark)' }}
                      >
                        {a.street}
                      </div>
                      <div
                        className="mt-0.5"
                        style={{ fontSize: '11px', color: 'var(--muted)' }}
                      >
                        {a.city}, {a.province} {a.postal_code || ''}
                      </div>
                    </div>
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => deleteAddress.mutate(a.id)}
                        className="p-1.5 rounded-lg transition-colors hover:text-red-600 cursor-pointer"
                        style={{ color: 'var(--muted)' }}
                        title="Hapus Alamat"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Belum ada data alamat</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Bank Accounts */}
      {activeTab === 'banks' && (
        <div className="card-deck">
          <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
                Rekening Bank Payroll
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Rekening terdaftar untuk transfer penggajian</p>
            </div>
            {canUpdate && (
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                className="inline-flex items-center gap-1.5 rounded-[8px] font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: 'rgba(27, 81, 244, 0.08)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  fontSize: '11px',
                }}
              >
                <i className="fa-solid fa-plus text-[10px]" />
                Tambah Rekening
              </button>
            )}
          </div>

          {employee.bank_accounts && employee.bank_accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {employee.bank_accounts.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    minHeight: '110px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold" style={{ fontSize: '14px', color: 'var(--dark)' }}>
                      {b.bank_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {b.is_primary && (
                        <span className="badge-trend-deck positive" style={{ fontSize: '10px' }}>
                          Utama
                        </span>
                      )}
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => deleteBankAccount.mutate(b.id)}
                          className="p-1 rounded hover:text-red-600 transition-colors cursor-pointer"
                          style={{ color: 'var(--muted)' }}
                          title="Hapus Rekening"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-extrabold tabular-nums tracking-wide mt-2" style={{ fontSize: '15px', color: 'var(--dark)' }}>
                      {b.account_number}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      a.n. {b.account_holder}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Belum ada rekening bank yang didaftarkan</p>
          )}
        </div>
      )}

      {/* Tab 4: Employment History */}
      {activeTab === 'history' && (
        <div className="card-deck">
          <h3
            className="font-bold pb-3 border-b mb-4"
            style={{ fontSize: '16px', color: 'var(--dark)', borderColor: 'var(--border)' }}
          >
            Riwayat Penempatan & Promosi
          </h3>
          {histories.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Belum ada catatan riwayat pekerjaan</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {histories.map((h) => (
                <div key={h.id} className="py-3.5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--primary)',
                      }}
                    >
                      <i className="fa-solid fa-check text-xs" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ fontSize: '13px', color: 'var(--dark)' }}>
                        {h.position_title || 'Posisi tidak spesifik'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Departemen: <span className="font-semibold">{h.department_name || '-'}</span>
                      </div>
                      {h.change_reason && (
                        <div className="italic mt-0.5" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          Alasan: {h.change_reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right tabular-nums" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {formatDate(h.effective_from)} {h.effective_until ? `- ${formatDate(h.effective_until)}` : '(Sekarang)'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditEmployeeModal
          employee={employee}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Ubah Status Karyawan
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="active">Aktif</option>
                  <option value="probation">Masa Percobaan (Probation)</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="terminated">Terminasi (Keluar)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="rounded-[10px] px-4 py-2 font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--dark)',
                    fontSize: '12px',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateStatus.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Tambah Kontak Baru
            </h3>
            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Tipe Kontak
                </label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="personal_phone">No. Handphone Pribadi</option>
                  <option value="work_phone">No. Handphone Kerja</option>
                  <option value="personal_email">Email Pribadi</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nilai Kontak *
                </label>
                <input
                  type="text"
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="Contoh: +62812345678"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                  <input
                    type="checkbox"
                    checked={contactIsPrimary}
                    onChange={(e) => setContactIsPrimary(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Jadikan Kontak Utama
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="rounded-[10px] px-4 py-2 font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--dark)',
                    fontSize: '12px',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addContact.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Tambah Alamat
            </h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Tipe Alamat
                </label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="current">Domisili Saat Ini</option>
                  <option value="ktp">Sesuai KTP</option>
                  <option value="emergency">Alamat Keluarga</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Jalan / Alamat Lengkap *
                </label>
                <textarea
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  rows={2}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    Kota / Kab
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs tabular-nums focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                  <input
                    type="checkbox"
                    checked={addressIsPrimary}
                    onChange={(e) => setAddressIsPrimary(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Jadikan Alamat Utama
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-[10px] px-4 py-2 font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--dark)',
                    fontSize: '12px',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addAddress.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Tambah Rekening Bank
            </h3>
            <form onSubmit={handleAddBank} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Bank *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="BCA">Bank Central Asia (BCA)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">Bank Negara Indonesia (BNI)</option>
                  <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Bank Permata</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nomor Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className="w-full rounded-[10px] px-3 py-2 text-xs tabular-nums focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Sesuai buku tabungan"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                  <input
                    type="checkbox"
                    checked={bankIsPrimary}
                    onChange={(e) => setBankIsPrimary(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Jadikan Rekening Utama untuk Payroll
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="rounded-[10px] px-4 py-2 font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--dark)',
                    fontSize: '12px',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addBankAccount.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
