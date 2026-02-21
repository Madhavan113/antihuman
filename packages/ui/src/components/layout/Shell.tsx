import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'

export function Shell() {
  const { pathname } = useLocation()
  const segment = pathname.split('/')[2] ?? 'dashboard'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Nav />
      <main className="flex-1" style={{ marginLeft: 200 }}>
        <div key={segment} className="page-enter" style={{ minHeight: '100vh' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
