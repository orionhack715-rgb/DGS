import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function Dashboard() {
  const [stats, setStats] = useState({ userCount: 0, serviceCount: 0, projectCount: 0, memberCount: 0 })

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Utilisateurs', value: stats.userCount, icon: 'ri-user-line', link: '/backoffice/users', color: '#0b5ed7' },
    { label: 'Services', value: stats.serviceCount, icon: 'ri-service-line', link: '/backoffice/services', color: '#198754' },
    { label: 'Projets', value: stats.projectCount, icon: 'ri-folder-line', link: '/backoffice/projects', color: '#fd7e14' },
    { label: 'Membres équipe', value: stats.memberCount, icon: 'ri-team-line', link: '/backoffice/members', color: '#6f42c1' },
  ]

  const quickLinks = [
    ['/backoffice/site-content', 'ri-layout-line', 'Contenu site'],
    ['/backoffice/domaines', 'ri-apps-line', "Domaines d'accueil"],
    ['/backoffice/equipe-propos', 'ri-info-i', 'Équipe à propos'],
    ['/backoffice/people', 'ri-group-line', 'Prestataires'],
    ['/backoffice/mailing', 'ri-mail-send-line', 'Mailing'],
    ['/backoffice/chat', 'ri-chat-1-line', 'Chat support'],
  ]

  return (
    <div>
      <h2 className="mb-1 fw-bold">Dashboard</h2>
      <p className="text-muted mb-4">Vue d'ensemble de votre plateforme Digital Get Services.</p>

      <div className="row g-3 mb-4">
        {cards.map(c => (
          <div className="col-sm-6 col-xl-3" key={c.label}>
            <Link to={c.link} style={{ textDecoration: 'none' }}>
              <div className="admin-card d-flex align-items-center gap-3" style={{ borderLeft: `4px solid ${c.color}` }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: `${c.color}18`, color: c.color, fontSize: '1.4rem', flexShrink: 0 }}>
                  <i className={c.icon}></i>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{c.value}</div>
                  <div className="text-muted small">{c.label}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h3 className="fw-semibold mb-3">Accès rapides</h3>
        <div className="row g-2">
          {quickLinks.map(([to, icon, label]) => (
            <div className="col-sm-4 col-lg-2" key={to}>
              <Link to={to} className="d-flex flex-column align-items-center justify-content-center gap-1 p-3 rounded text-decoration-none"
                style={{ border: '1px solid var(--admin-border)', borderRadius: 12, background: '#f8fafc', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8f0ff'; e.currentTarget.style.borderColor = '#0b5ed7' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--admin-border)' }}>
                <i className={`${icon} text-primary`} style={{ fontSize: '1.6rem' }}></i>
                <span className="small fw-semibold text-center" style={{ color: 'var(--admin-text)' }}>{label}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
