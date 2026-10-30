import { useState } from 'react'
import {
  useDepartments,
  usePositions,
  useJobGrades,
  useCreateDepartment,
  useDeleteDepartment,
  useCreatePosition,
  useDeletePosition,
} from '../hooks/useOrganization'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Plus, Trash2, Building2, Briefcase, Award } from 'lucide-react'

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'positions' | 'grades'>('departments')

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showPosModal, setShowPosModal] = useState(false)

  // Form states
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [deptDesc, setDeptDesc] = useState('')

  const [posTitle, setPosTitle] = useState('')
  const [posDesc, setPosDesc] = useState('')
  const [posDeptId, setPosDeptId] = useState('')
  const [posGradeId, setPosGradeId] = useState('')

  // Queries & Mutations
  const { data: departments = [], isLoading: loadingDepts } = useDepartments()
  const { data: positions = [], isLoading: loadingPositions } = usePositions()
  const { data: jobGrades = [], isLoading: loadingGrades } = useJobGrades()

  const createDept = useCreateDepartment()
  const deleteDept = useDeleteDepartment()
  const createPos = useCreatePosition()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Struktur Organisasi</h1>
          <p className="text-sm text-gray-500">
            Kelola master data departemen, jabatan, dan jenjang organisasi perusahaan
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'departments' && (
            <Button onClick={() => setShowDeptModal(true)} className="flex items-center gap-1.5">
              <Plus size={16} />
              Tambah Departemen
            </Button>
          )}
          {activeTab === 'positions' && (
            <Button onClick={() => setShowPosModal(true)} className="flex items-center gap-1.5">
              <Plus size={16} />
              Tambah Posisi
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 size={16} />
          Departemen ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'positions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase size={16} />
          Jabatan / Posisi ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award size={16} />
          Jenjang Jabatan ({jobGrades.length})
        </button>
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingDepts ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner size={24} />
            </div>
          ) : departments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada departemen</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Nama Departemen</th>
                  <th className="px-6 py-3">Deskripsi</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">{d.code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{d.name}</td>
                    <td className="px-6 py-4 text-gray-500">{d.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus departemen "${d.name}"?`)) {
                            deleteDept.mutate(d.id)
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingPositions ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner size={24} />
            </div>
          ) : positions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada jabatan</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Nama Jabatan</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Jenjang (Grade)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {positions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.title}</td>
                    <td className="px-6 py-4 text-gray-600">{p.department_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{p.job_grade_name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus jabatan "${p.title}"?`)) {
                            deletePos.mutate(p.id)
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Job Grades Tab */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingGrades ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner size={24} />
            </div>
          ) : jobGrades.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada jenjang jabatan</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Tingkat (Level)</th>
                  <th className="px-6 py-3">Nama Jenjang</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">Level {g.level}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{g.name}</td>
                    <td className="px-6 py-4 text-gray-500">{g.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Tambah Departemen */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tambah Departemen Baru</h3>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Contoh: Operasional & Logistik"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Kode Departemen *
                </label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: OPS"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDeptModal(false)}>
                  Batal
                </Button>
                <Button type="submit" isLoading={createDept.isPending}>
                  Simpan Departemen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Posisi */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tambah Posisi / Jabatan</h3>
            <form onSubmit={handleCreatePos} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  placeholder="Contoh: QA Automation Engineer"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Departemen
                </label>
                <select
                  value={posDeptId}
                  onChange={(e) => setPosDeptId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Jenjang Jabatan (Grade)
                </label>
                <select
                  value={posGradeId}
                  onChange={(e) => setPosGradeId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Deskripsi / Tugas
                </label>
                <textarea
                  value={posDesc}
                  onChange={(e) => setPosDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPosModal(false)}>
                  Batal
                </Button>
                <Button type="submit" isLoading={createPos.isPending}>
                  Simpan Jabatan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

