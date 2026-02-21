import { NavLink } from 'react-router-dom'
import { useWebSocket } from '../../hooks/useWebSocket'

interface NavItem { to: string; label: string; end?: boolean }
interface NavSection { label: string | null; links: NavItem[] }

const sections: NavSection[] = [
  {
    label: null,
    links: [
      { to: '/app', label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Exchange',
    links: [
      { to: '/app/markets', label: 'Markets' },
      { to: '/app/agents', label: 'Agents' },
      { to: '/app/bots', label: 'Bots' },
    ],
  },
  {
    label: 'Research',
    links: [
      { to: '/app/publications', label: 'Publications' },
    ],
  },
  {
    label: 'Develop',
    links: [
      { to: '/app/onboard', label: 'Onboard SDK' },
    ],
  },
]

export function Nav() {
  const { status } = useWebSocket()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: 200,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 10,
      }}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
        }}>
          SIMULACRUM
        </span>
        <span
          role="status"
          aria-label={`WebSocket ${status}`}
          title={status}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: status === 'connected' ? 'var(--success)' : 'var(--text-dim)',
            flexShrink: 0,
          }}
        />
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      <div className="flex flex-col flex-1 py-3 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.label && (
              <div className="label px-4 mb-1.5" style={{ fontSize: 10 }}>
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-px px-2">
              {section.links.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                      isActive ? '' : 'hover:bg-raised'
                    }`
                  }
                  style={({ isActive }) => ({
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: isActive ? 'var(--bg-raised)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
