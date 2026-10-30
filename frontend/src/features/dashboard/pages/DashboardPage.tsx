import { useDashboardSummary } from '../hooks/useDashboard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils/utils'
import { ContentHeader } from '@/components/layout/ContentHeader'

export function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="p-16 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Karyawan',
      value: summary?.total_employees || 0,
      icon: 'fa-solid fa-users',
      trend: '+3.4%',
      trendType: 'positive',
      isPrimary: true,
      subtext: 'Berdasarkan data aktif',
    },
    {
      label: 'Karyawan Aktif',
      value: summary?.active_employees || 0,
      icon: 'fa-solid fa-user-check',
      trend: '+1.2%',
      trendType: 'positive',
      isPrimary: false,
      subtext: 'Status operasional',
    },
    {
      label: 'Masa Percobaan',
      value: summary?.probation_employees || 0,
      icon: 'fa-solid fa-user-clock',
      trend: '+0.5%',
      trendType: 'positive',
      isPrimary: false,
      subtext: 'Karyawan evaluasi',
    },
    {
      label: 'Total Departemen',
      value: summary?.total_departments || 0,
      icon: 'fa-solid fa-sitemap',
      trend: '0.0%',
      trendType: 'neutral',
      isPrimary: false,
      subtext: 'Struktur divisi',
    },
    {
      label: 'Total Posisi',
      value: summary?.total_positions || 0,
      icon: 'fa-solid fa-briefcase',
      trend: '+2.1%',
      trendType: 'positive',
      isPrimary: false,
      subtext: 'Tingkatan jabatan',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Content Header with CTA */}
      <ContentHeader
        title="Dashboard Utama"
        subtitle="Selamat datang di PeopleCore HRIS — Ringkasan metrik SDM dan organisasi perusahaan"
        action={
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-95"
            style={{
              backgroundColor: 'var(--primary)',
              padding: '10px 18px',
              fontSize: '12px',
            }}
          >
            <i className="fa-solid fa-user-plus text-xs" />
            Kelola Karyawan
          </Link>
        }
      />

      {/* 5-Column Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[18px]">
        {statCards.map((card, idx) => {
          if (card.isPrimary) {
            return (
              <div
                key={idx}
                className="metric-card-deck primary-blue"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center justify-center rounded-[10px]"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                    }}
                  >
                    <i className={`${card.icon} text-sm`} />
                  </div>
                  <span
                    className="badge-trend-deck"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                    }}
                  >
                    {card.trend}
                  </span>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {card.label}
                  </div>
                  <div
                    className="font-extrabold tracking-tight"
                    style={{ fontSize: '26px', letterSpacing: '-0.5px' }}
                  >
                    {card.value}
                  </div>
                  <div
                    className="mt-0.5"
                    style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {card.subtext}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={idx}
              className="metric-card-deck"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center rounded-[10px]"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--muted)',
                  }}
                >
                  <i className={`${card.icon} text-sm`} />
                </div>
                <span
                  className={`badge-trend-deck ${
                    card.trendType === 'positive' ? 'positive' : ''
                  }`}
                  style={
                    card.trendType === 'neutral'
                      ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--muted)' }
                      : undefined
                  }
                >
                  {card.trend}
                </span>
              </div>
              <div>
                <div
                  className="font-semibold"
                  style={{ fontSize: '11px', color: 'var(--muted)' }}
                >
                  {card.label}
                </div>
                <div
                  className="font-extrabold tracking-tight"
                  style={{ fontSize: '26px', letterSpacing: '-0.5px', color: 'var(--dark)' }}
                >
                  {card.value}
                </div>
                <div
                  className="mt-0.5"
                  style={{ fontSize: '10px', color: 'var(--muted)' }}
                >
                  {card.subtext}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Insights Grid (1.8 : 1) */}
      <section className="flex flex-col lg:flex-row gap-5">
        {/* Left: Recent Employees (flex 1.8) */}
        <div
          className="card-deck flex-1 lg:basis-[64%]"
        >
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="font-bold"
                style={{ fontSize: '16px', color: 'var(--dark)' }}
              >
                Karyawan Terbaru Bergabung
              </h2>
              <p
                style={{ fontSize: '11px', color: 'var(--muted)' }}
              >
                Penerimaan staf teranyar di seluruh departemen
              </p>
            </div>
            <Link
              to="/employees"
              className="font-semibold hover:underline flex items-center gap-1.5"
              style={{ fontSize: '12px', color: 'var(--primary)' }}
            >
              Lihat Semua
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>

          {!summary?.recent_employees || summary.recent_employees.length === 0 ? (
            <div
              className="py-12 text-center"
              style={{ fontSize: '12px', color: 'var(--muted)' }}
            >
              Belum ada data karyawan
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {summary.recent_employees.map((emp) => (
                <div
                  key={emp.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full font-bold text-sm shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--primary)',
                      }}
                    >
                      {emp.full_name[0]}
                    </div>
                    <div>
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-bold hover:underline block leading-snug"
                        style={{ fontSize: '12px', color: 'var(--dark)' }}
                      >
                        {emp.full_name}
                      </Link>
                      <div
                        className="tabular-nums"
                        style={{ fontSize: '11px', color: 'var(--muted)' }}
                      >
                        {emp.employee_number} • {emp.position_title || 'Staf'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-semibold block"
                      style={{ fontSize: '12px', color: 'var(--dark)' }}
                    >
                      {emp.department_name || '-'}
                    </span>
                    <span
                      style={{ fontSize: '10px', color: 'var(--muted)' }}
                    >
                      {formatDate(emp.join_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions (flex 1) */}
        <div
          className="card-deck flex-1 lg:basis-[36%]"
        >
          <div className="mb-5">
            <h2
              className="font-bold"
              style={{ fontSize: '16px', color: 'var(--dark)' }}
            >
              Aksi Cepat
            </h2>
            <p
              style={{ fontSize: '11px', color: 'var(--muted)' }}
            >
              Pintasan navigasi penting sistem
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/organization"
              className="flex items-center justify-between p-3.5 rounded-xl transition-all group"
              style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.015)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(27,81,244,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-[10px]"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--primary)',
                  }}
                >
                  <i className="fa-solid fa-sitemap text-sm" />
                </div>
                <div>
                  <div
                    className="font-bold group-hover:text-blue-600 transition-colors"
                    style={{ fontSize: '13px', color: 'var(--dark)' }}
                  >
                    Struktur Organisasi
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Atur hirarki departemen dan jabatan
                  </div>
                </div>
              </div>
              <i
                className="fa-solid fa-chevron-right text-xs transition-colors"
                style={{ color: 'var(--muted)' }}
              />
            </Link>

            <Link
              to="/employees"
              className="flex items-center justify-between p-3.5 rounded-xl transition-all group"
              style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.015)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(27,81,244,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-[10px]"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--primary)',
                  }}
                >
                  <i className="fa-solid fa-users text-sm" />
                </div>
                <div>
                  <div
                    className="font-bold group-hover:text-blue-600 transition-colors"
                    style={{ fontSize: '13px', color: 'var(--dark)' }}
                  >
                    Direktori Karyawan
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--muted)' }}
                  >
                    Lihat dan filter seluruh profil staf
                  </div>
                </div>
              </div>
              <i
                className="fa-solid fa-chevron-right text-xs transition-colors"
                style={{ color: 'var(--muted)' }}
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
