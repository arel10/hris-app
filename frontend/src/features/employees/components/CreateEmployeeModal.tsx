import { useState } from 'react'
import { useCreateEmployee } from '../hooks/useEmployees'
import { useDepartments, usePositions } from '@/features/organization/hooks/useOrganization'

interface CreateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('male')
  const [birthDate, setBirthDate] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [employmentType, setEmploymentType] = useState('permanent')
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0])
  const [createUserAccount, setCreateUserAccount] = useState(true)
  const [userPassword, setUserPassword] = useState('Welcome@123')

  const { data: departments = [] } = useDepartments()
  const { data: positions = [] } = usePositions(departmentId || undefined)
  const createEmployee = useCreateEmployee()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !email || !joinDate) return

    await createEmployee.mutateAsync({
      first_name: firstName,
      last_name: lastName || undefined,
      email,
      phone: phone || undefined,
      gender: gender || undefined,
      birth_date: birthDate || undefined,
      national_id: nationalId || undefined,
      department_id: departmentId || undefined,
      position_id: positionId || undefined,
      employment_type: employmentType,
      join_date: joinDate,
      create_user_account: createUserAccount,
      user_password: createUserAccount ? userPassword : undefined,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="card-deck max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
            Tambah Data Karyawan Baru
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Biodata Pribadi */}
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-2" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Informasi Pribadi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Nama Depan *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Email Perusahaan / Kerja *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  No. Handphone / WA
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+628123456789"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Jenis Kelamin
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Nomor KTP / NIK
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="3171xxxxxxxxxxxx"
                  className="w-full rounded-[10px] px-3 py-2 text-xs tabular-nums focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Penempatan & Pekerjaan */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-bold uppercase tracking-wider mb-2" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Penempatan & Tanggal Mulai
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Departemen
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Departemen...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Jabatan / Posisi
                </label>
                <select
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Posisi...</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Status Ikatan Kerja *
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="permanent">Tetap (PKWTT)</option>
                  <option value="contract">Kontrak (PKWT)</option>
                  <option value="probation">Masa Percobaan (Probation)</option>
                  <option value="internship">Magang (Intern)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--dark)' }}>
                  Tanggal Bergabung *
                </label>
                <input
                  type="date"
                  required
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Akun Login */}
          <div className="p-3.5 rounded-xl space-y-2" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <label className="flex items-center gap-2 cursor-pointer font-bold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
              <input
                type="checkbox"
                checked={createUserAccount}
                onChange={(e) => setCreateUserAccount(e.target.checked)}
                className="rounded text-blue-600"
              />
              Buatkan akun akses sistem (Email & Password login)
            </label>
            {createUserAccount && (
              <div className="mt-2 text-xs">
                <label className="block mb-1 font-semibold" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Password Sementara
                </label>
                <input
                  type="text"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full sm:w-1/2 rounded-[10px] px-3 py-1.5 tabular-nums focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={createEmployee.isPending}
              className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--primary)',
                fontSize: '12px',
              }}
            >
              Simpan Data Karyawan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
