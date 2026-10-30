import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <Sidebar />
        <main
          className="flex-1 flex flex-col min-w-0"
          style={{
            backgroundColor: 'var(--bg-app)',
            padding: '30px',
            gap: '24px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
