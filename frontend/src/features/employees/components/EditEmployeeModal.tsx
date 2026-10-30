import { useState } from 'react'
import { useUpdateEmployee } from '../hooks/useEmployees'
import { useDepartments, usePositions } from '@/features/organization/hooks/useOrganization'
import type { Employee } from '../types/employee.types'

interface EditEmployeeModalProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
}

export function EditEmployeeModal({ employee, isOpen, onClose }: EditEmployeeModalProps) {
  const [firstName, setFirstName] = useState(employee.first_name)
  const [lastName, setLastName] = useState(employee.last_name || '')
  const [phone, setPhone] = useState(employee.phone || '')
  const [gender, setGender] = useState(employee.gender || 'male')
  const [birthDate, setBirthDate] = useState(employee.birth_date || '')
  const [birthPlace, setBirthPlace] = useState(employee.birth_place || '')
  const [nationalId, setNationalId] = useState(employee.national_id || '')
  const [maritalStatus, setMaritalStatus] = useState(employee.marital_status || 'single')
  const [employmentType, setEmploymentType] = useState(employee.employment_type || 'permanent')
  const [departmentId, setDepartmentId] = useState(employee.department_id || '')
  const [positionId, setPositionId] = useState(employee.position_id || '')
  const [joinDate, setJoinDate] = useState(employee.join_date)
  const [changeReason, setChangeReason] = useState('')

  const { data: departments = [] } = useDepartments()
  const { data: positions = [] } = usePositions(departmentId || undefined)
  const updateEmployee = useUpdateEmployee(employee.id)

  if (!isOpen) return null

  const isPlacementChanged =
    (departmentId || '') !== (employee.department_id || '') ||
    (positionId || '') !== (employee.position_id || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !joinDate) return

    await updateEmployee.mutateAsync({
      first_name: firstName,
      last_name: lastName || undefined,
      phone: phone || undefined,
      gender: gender || undefined,
      birth_date: birthDate || undefined,
      birth_place: birthPlace || undefined,
      national_id: nationalId || undefined,
      marital_status: maritalStatus || undefined,
      employment_type: employmentType || undefined,
      department_id: departmentId || undefined,
      position_id: positionId || undefined,
      join_date: joinDate,
      change_reason: isPlacementChanged ? changeReason || 'Perubahan Posisi / Organisasi' : undefined,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="card-deck max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
            Ubah Data Karyawan (<span className="tabular-nums font-semibold" style={{ color: 'var(--muted)' }}>{employee.employee_number}</span>)
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
                  Status Pernikahan
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="single">Belum Menikah (Single)</option>
                  <option value="married">Menikah (Married)</option>
                  <option value="divorced">Cerai (Divorced)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Penempatan & Pekerjaan */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-bold uppercase tracking-wider mb-2" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Penempatan & Kepegawaian
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
                  Status Ikatan Kerja
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

            {/* Mutasi reason if placement changed */}
            {isPlacementChanged && (
              <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <label className="block mb-1 font-bold" style={{ fontSize: '11px', color: 'var(--primary)' }}>
                  Alasan Perubahan / Mutasi Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Contoh: Promosi jabatan / Rotasi divisi internal"
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
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
              disabled={updateEmployee.isPending}
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
  )
}
