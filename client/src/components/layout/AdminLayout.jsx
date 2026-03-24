import { Outlet, NavLink, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../admin.css'

const NAV_LINKS = [
  ['/backoffice', 'Dashboard', 'ri-dashboard-line'],
  ['/backoffice/users', 'Utilisateurs', 'ri-user-line'],
  ['/backoffice/services', 'Services', 'ri-service-line'],
  ['/backoffice/people', 'People', 'ri-team-line'],
  ['/backoffice/projects', 'Projets', 'ri-folder-line'],
  ['/backoffice/members', 'Membres', 'ri-group-line'],
  ['/backoffice/site-content', 'Site', 'ri-layout-line'],
  ['/backoffice/domaines', 'Domaines', 'ri-apps-line'],
  ['/backoffice/equipe-propos', 'Équipe Propos', 'ri-info-i'],
  ['/backoffice/mailing', 'Mailing', 'ri-mail-send-line'],
  ['/backoffice/chat', 'Chat', 'ri-chat-1-line'],
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user === undefined) return null // loading
  if (!user || user.role !== 'admin') return <Navigate to="/backoffice/login" replace />

  async function handleLogout() {
    await logout()
    navigate('/backoffice/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h1>🚀 DGS Admin</h1>
          <p>Back-office</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_LINKS.map(([to, label, icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/backoffice'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className={`${icon} me-2`}></i>{label}
            </NavLink>
          ))}
          <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '12px 0' }} />
          <a href="/accueil" target="_blank" rel="noopener noreferrer">
            <i className="ri-external-link-line me-2"></i>Voir le site
          </a>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textAlign: 'left', borderRadius: 10, padding: '11px 12px', width: '100%' }}
          >
            <i className="ri-logout-box-line me-2"></i>Déconnexion
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <span className="fw-semibold">Bienvenue, <strong>{user?.full_name}</strong></span>
          <span className="badge bg-primary">{user?.role}</span>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
