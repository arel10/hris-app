import { useState } from 'react'
import {
  useDepartments,
  usePositions,
  useJobGrades,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from '../hooks/useOrganization'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/lib/constants/permissions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ContentHeader } from '@/components/layout/ContentHeader'
import type { Department, Position } from '../types/organization.types'

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'positions' | 'grades'>('departments')

  // Permission checks
  const { hasPermission } = usePermission()
  const canCreate = hasPermission(PERMISSIONS.ORGANIZATION_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.ORGANIZATION_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.ORGANIZATION_DELETE)

  // Modals for Create
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showPosModal, setShowPosModal] = useState(false)

  // Modals for Edit
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [editingPos, setEditingPos] = useState<Position | null>(null)

  // Create Form states
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [deptDesc, setDeptDesc] = useState('')

  const [posTitle, setPosTitle] = useState('')
  const [posDesc, setPosDesc] = useState('')
  const [posDeptId, setPosDeptId] = useState('')
  const [posGradeId, setPosGradeId] = useState('')

  // Edit Form states
  const [editDeptName, setEditDeptName] = useState('')
  const [editDeptCode, setEditDeptCode] = useState('')
  const [editDeptDesc, setEditDeptDesc] = useState('')

  const [editPosTitle, setEditPosTitle] = useState('')
  const [editPosDesc, setEditPosDesc] = useState('')
  const [editPosDeptId, setEditPosDeptId] = useState('')
  const [editPosGradeId, setEditPosGradeId] = useState('')

  // Queries & Mutations
  const { data: departments = [], isLoading: loadingDepts } = useDepartments()
  const { data: positions = [], isLoading: loadingPositions } = usePositions()
  const { data: jobGrades = [], isLoading: loadingGrades } = useJobGrades()

  const createDept = useCreateDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()

  const createPos = useCreatePosition()
  const updatePos = useUpdatePosition()
  const deletePos = useDeletePosition()

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName || !deptCode) return
    await createDept.mutateAsync({
      name: deptName,
      code: deptCode,
      description: deptDesc || undefined,
    })
    setDeptName('')
    setDeptCode('')
    setDeptDesc('')
    setShowDeptModal(false)
  }

  const handleOpenEditDept = (d: Department) => {
    setEditingDept(d)
    setEditDeptName(d.name)
    setEditDeptCode(d.code)
    setEditDeptDesc(d.description || '')
  }

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDept || !editDeptName || !editDeptCode) return
    await updateDept.mutateAsync({
      id: editingDept.id,
      data: {
        name: editDeptName,
        code: editDeptCode,
        description: editDeptDesc || undefined,
      },
    })
    setEditingDept(null)
  }

  const handleCreatePos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!posTitle) return
    await createPos.mutateAsync({
      title: posTitle,
      description: posDesc || undefined,
      department_id: posDeptId || undefined,
      job_grade_id: posGradeId || undefined,
    })
    setPosTitle('')
    setPosDesc('')
    setPosDeptId('')
    setPosGradeId('')
    setShowPosModal(false)
  }

  const handleOpenEditPos = (p: Position) => {
    setEditingPos(p)
    setEditPosTitle(p.title)
    setEditPosDesc(p.description || '')
    setEditPosDeptId(p.department_id || '')
    setEditPosGradeId(p.job_grade_id || '')
  }

  const handleUpdatePos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPos || !editPosTitle) return
    await updatePos.mutateAsync({
      id: editingPos.id,
      data: {
        title: editPosTitle,
        description: editPosDesc || undefined,
        department_id: editPosDeptId || undefined,
        job_grade_id: editPosGradeId || undefined,
      },
    })
    setEditingPos(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Content Header */}
      <ContentHeader
        title="Struktur Organisasi"
        subtitle="Kelola master data departemen, jabatan, dan jenjang organisasi perusahaan"
        action={
          canCreate ? (
            activeTab === 'departments' ? (
              <button
                type="button"
                onClick={() => setShowDeptModal(true)}
                className="inline-flex items-center gap-2 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary)',
                  padding: '10px 18px',
                  fontSize: '12px',
                }}
              >
                <i className="fa-solid fa-plus text-xs" />
                Tambah Departemen
              </button>
            ) : activeTab === 'positions' ? (
              <button
                type="button"
                onClick={() => setShowPosModal(true)}
                className="inline-flex items-center gap-2 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary)',
                  padding: '10px 18px',
                  fontSize: '12px',
                }}
              >
                <i className="fa-solid fa-plus text-xs" />
                Tambah Jabatan
              </button>
            ) : undefined
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'departments', label: `Departemen (${departments.length})`, icon: 'fa-solid fa-sitemap' },
          { key: 'positions', label: `Jabatan / Posisi (${positions.length})`, icon: 'fa-solid fa-briefcase' },
          { key: 'grades', label: `Jenjang Jabatan (${jobGrades.length})`, icon: 'fa-solid fa-award' },
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

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="card-deck">
          {loadingDepts ? (
            <div className="p-16 flex justify-center">
              <LoadingSpinner size={28} />
            </div>
          ) : departments.length === 0 ? (
            <div className="p-16 text-center" style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Belum ada departemen
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Kode
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Nama Departemen
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Deskripsi
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Status
                    </th>
                    {(canUpdate || canDelete) && (
                      <th className="py-3.5 px-4 font-bold tracking-wider uppercase text-right" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-gray-50/50"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {d.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                        {d.name}
                      </td>
                      <td className="py-3.5 px-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {d.description || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="badge-trend-deck positive">Aktif</span>
                      </td>
                      {(canUpdate || canDelete) && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditDept(d)}
                                className="p-1.5 rounded-lg transition-colors hover:text-blue-600 cursor-pointer"
                                style={{ color: 'var(--muted)' }}
                                title="Edit Departemen"
                              >
                                <i className="fa-solid fa-pen text-xs" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus departemen "${d.name}"?`)) {
                                    deleteDept.mutate(d.id)
                                  }
                                }}
                                className="p-1.5 rounded-lg transition-colors hover:text-red-600 cursor-pointer"
                                style={{ color: 'var(--muted)' }}
                                title="Hapus Departemen"
                              >
                                <i className="fa-solid fa-trash text-xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="card-deck">
          {loadingPositions ? (
            <div className="p-16 flex justify-center">
              <LoadingSpinner size={28} />
            </div>
          ) : positions.length === 0 ? (
            <div className="p-16 text-center" style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Belum ada jabatan
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Nama Jabatan
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Departemen
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Jenjang (Grade)
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Status
                    </th>
                    {(canUpdate || canDelete) && (
                      <th className="py-3.5 px-4 font-bold tracking-wider uppercase text-right" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-gray-50/50"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="py-3.5 px-4 font-bold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                        {p.title}
                      </td>
                      <td className="py-3.5 px-4 font-semibold" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {p.department_name || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                        {p.job_grade_name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="badge-trend-deck positive">Aktif</span>
                      </td>
                      {(canUpdate || canDelete) && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditPos(p)}
                                className="p-1.5 rounded-lg transition-colors hover:text-blue-600 cursor-pointer"
                                style={{ color: 'var(--muted)' }}
                                title="Edit Jabatan"
                              >
                                <i className="fa-solid fa-pen text-xs" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus jabatan "${p.title}"?`)) {
                                    deletePos.mutate(p.id)
                                  }
                                }}
                                className="p-1.5 rounded-lg transition-colors hover:text-red-600 cursor-pointer"
                                style={{ color: 'var(--muted)' }}
                                title="Hapus Jabatan"
                              >
                                <i className="fa-solid fa-trash text-xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Job Grades Tab */}
      {activeTab === 'grades' && (
        <div className="card-deck">
          {loadingGrades ? (
            <div className="p-16 flex justify-center">
              <LoadingSpinner size={28} />
            </div>
          ) : jobGrades.length === 0 ? (
            <div className="p-16 text-center" style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Belum ada jenjang jabatan
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Tingkat (Level)
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Nama Jenjang
                    </th>
                    <th className="py-3.5 px-4 font-bold tracking-wider uppercase" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobGrades.map((g) => (
                    <tr
                      key={g.id}
                      className="transition-colors hover:bg-gray-50/50"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                        Level {g.level}
                      </td>
                      <td className="py-3.5 px-4 font-bold" style={{ fontSize: '12px', color: 'var(--dark)' }}>
                        {g.name}
                      </td>
                      <td className="py-3.5 px-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {g.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah Departemen */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Tambah Departemen Baru
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Contoh: Operasional & Logistik"
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
                  Kode Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: OPS"
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
                  Deskripsi
                </label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
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
                  disabled={createDept.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Departemen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Departemen */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Ubah Data Departemen
            </h3>
            <form onSubmit={handleUpdateDept} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
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
                  Kode Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={editDeptCode}
                  onChange={(e) => setEditDeptCode(e.target.value.toUpperCase())}
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
                  Deskripsi
                </label>
                <textarea
                  value={editDeptDesc}
                  onChange={(e) => setEditDeptDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
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
                  disabled={updateDept.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Perbarui Departemen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Posisi */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Tambah Posisi / Jabatan
            </h3>
            <form onSubmit={handleCreatePos} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  placeholder="Contoh: QA Automation Engineer"
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
                  Departemen
                </label>
                <select
                  value={posDeptId}
                  onChange={(e) => setPosDeptId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Departemen...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Jenjang Jabatan (Grade)
                </label>
                <select
                  value={posGradeId}
                  onChange={(e) => setPosGradeId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Jenjang...</option>
                  {jobGrades.map((g) => (
                    <option key={g.id} value={g.id}>
                      Level {g.level} - {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Deskripsi / Tugas
                </label>
                <textarea
                  value={posDesc}
                  onChange={(e) => setPosDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPosModal(false)}
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
                  disabled={createPos.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Posisi */}
      {editingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-deck max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold" style={{ fontSize: '16px', color: 'var(--dark)' }}>
              Ubah Posisi / Jabatan
            </h3>
            <form onSubmit={handleUpdatePos} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Nama Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={editPosTitle}
                  onChange={(e) => setEditPosTitle(e.target.value)}
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
                  Departemen
                </label>
                <select
                  value={editPosDeptId}
                  onChange={(e) => setEditPosDeptId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Departemen...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Jenjang Jabatan (Grade)
                </label>
                <select
                  value={editPosGradeId}
                  onChange={(e) => setEditPosGradeId(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                >
                  <option value="">Pilih Jenjang...</option>
                  {jobGrades.map((g) => (
                    <option key={g.id} value={g.id}>
                      Level {g.level} - {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Deskripsi / Tugas
                </label>
                <textarea
                  value={editPosDesc}
                  onChange={(e) => setEditPosDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-[10px] px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--dark)',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPos(null)}
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
                  disabled={updatePos.isPending}
                  className="rounded-[10px] px-4 py-2 font-semibold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '12px',
                  }}
                >
                  Perbarui Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
