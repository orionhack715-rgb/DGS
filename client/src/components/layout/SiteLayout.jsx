import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSiteData } from '../../contexts/SiteDataContext'
import { uploadSrc } from '../../utils/uploads'

const NAV_ITEMS = [
  ['accueil', 'Accueil'],
  ['propos', 'Propos'],      
  ['services', 'Services'],
  ['realisation', 'Réalisations'], 
  ['notreEquipe', 'Équipe'],   
  ['formulaire', 'Contact'],
]

export default function SiteLayout() {
  const { header, socials, footerServices, footerContact } = useSiteData()
  const navigate = useNavigate()
  const location = useLocation()
  const hideFooter = ['/login', '/register', '/compte'].includes(location.pathname)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('site-theme') || 'light')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof window.AOS !== 'undefined') window.AOS.init({ duration: 800, once: true })
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('site-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }


  return (
    <>
      <header className="sticky-top">
        <nav className={`navbar navbar-expand-lg${scrolled ? ' is-scrolled' : ''}`}>
          <div className="container">
            <Link to="/accueil" className="brand-wrap d-flex align-items-center">
              <img
                src={header?.logo ? uploadSrc(`images/${header.logo}`) : '/logo1.jpeg'}
                alt="Logo"
                className="me-2"
                style={{ width: 50, height: 'auto' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <span className="navbar-brand">{header?.nom || 'Digital Get Services'}</span>
                <div className="slogan">{header?.slogan || 'Vos solutions digitales'}</div>
              </div>
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto nav-pill-menu flex-nowrap align-items-center" style={{ marginRight: '3rem' }}>
                {NAV_ITEMS.map(([key, label]) => (
                  <li className="nav-item" key={key}>
                    <NavLink
                      to={`/${key}`}
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="nav-actions ms-lg-2" style={{ gap: '0.4rem' }}>
                <button
                  className="theme-toggle-btn magnetic-btn"
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Changer le thème"
                >
                  <i className={theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'}></i>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
      
      {!hideFooter && (
      <footer>
        <div className="container">
          <div className="row g-5 pb-5">

            {/* Colonne 1 — Marque */}
            <div className="col-lg-5">
              <h5 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Digital Get Services</h5>
              <p className="text-muted small" style={{ lineHeight: 1.8 }}>
                Agence digitale nouvelle génération. Nous concevons et déployons des solutions web
                performantes pour accélérer votre croissance.
              </p>
              <div className="d-flex gap-2 mt-4">
                {socials?.map(s => (
                  <a key={s.id} href={s.lien} className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className={s.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Colonne 2 — Navigation */}
            <div className="col-6 col-lg-2">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.5 }}>Navigation</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {NAV_ITEMS.map(([key, label]) => (
                  <li key={key}>
                    <Link to={`/${key}`} className="text-muted small" style={{ transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.target.style.color = ''}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 — Contact */}
            <div className="col-6 col-lg-3">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.5 }}>Contact</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {footerContact?.email && (
                  <li className="d-flex align-items-center gap-2">
                    <i className="ri-mail-line" style={{ color: 'var(--primary)', fontSize: '0.95rem' }}></i>
                    <span className="text-muted small">{footerContact.email}</span>
                  </li>
                )}
                {footerContact?.telephone && (
                  <li className="d-flex align-items-center gap-2">
                    <i className="ri-phone-line" style={{ color: 'var(--primary)', fontSize: '0.95rem' }}></i>
                    <span className="text-muted small">{footerContact.telephone}</span>
                  </li>
                )}
                <li className="d-flex align-items-center gap-2 mt-1">
                  <i className="ri-time-line" style={{ color: 'var(--primary)', fontSize: '0.95rem' }}></i>
                  <span className="text-muted small">Réponse en moins de 48h</span>
                </li>
              </ul>
            </div>


          </div>

          {/* Footer bottom */}
          <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
            <p className="mb-0 text-muted small text-center text-lg-start">
              &copy; {new Date().getFullYear()} <strong>Digital Get Services</strong>. Tous droits réservés.
            </p>
            <a href="/backoffice/login"
              style={{
                fontSize: '0.65rem',
                opacity: 0.25,
                color: 'inherit',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => e.target.style.opacity = 0.6}
              onMouseLeave={e => e.target.style.opacity = 0.25}
            >
              espace pro
            </a>
          </div>
        </div>
      </footer>
      )}
    </>
  )
}
