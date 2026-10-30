import { useState } from 'react'
import { useCreateEmployee } from '../hooks/useEmployees'
import { useDepartments, usePositions } from '@/features/organization/hooks/useOrganization'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">Tambah Data Karyawan Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Section: Biodata Pribadi */}
          <div>
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">
              Informasi Pribadi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nama Depan *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nama Belakang</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email Perusahaan / Kerja *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">No. Handphone / WA</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+628123456789"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nomor KTP / NIK</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="3171xxxxxxxxxxxx"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Penempatan & Pekerjaan */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">
              Penempatan & Tanggal Mulai
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Departemen</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-xs text-gray-600 mb-1">Jabatan / Posisi</label>
                <select
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-xs text-gray-600 mb-1">Status Ikatan Kerja *</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="permanent">Tetap (PKWTT)</option>
                  <option value="contract">Kontrak (PKWT)</option>
                  <option value="probation">Masa Percobaan (Probation)</option>
                  <option value="internship">Magang (Intern)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tanggal Bergabung *</label>
                <input
                  type="date"
                  required
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Akun Login */}
          <div className="pt-2 border-t border-gray-100 bg-gray-50/70 p-3 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
              <input
                type="checkbox"
                checked={createUserAccount}
                onChange={(e) => setCreateUserAccount(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Buatkan akun akses sistem (Email & Password login)
            </label>
            {createUserAccount && (
              <div className="mt-2 text-xs">
                <label className="block text-gray-600 mb-1">Password Sementara</label>
                <input
                  type="text"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full sm:w-1/2 rounded-md border border-gray-300 px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" isLoading={createEmployee.isPending}>
              Simpan Data Karyawan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

