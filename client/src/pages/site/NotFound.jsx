import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section-shell auth-shell d-flex align-items-center">
      <div className="container text-center py-5">
        <h1 style={{ fontSize: '7rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 className="fw-bold mt-2">Page introuvable</h2>
        <p className="text-muted lead">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <Link to="/accueil" className="btn btn-primary btn-lg mt-3">
          <i className="ri-home-line me-2"></i>Retour à l'accueil
        </Link>
      </div>
    </section>
  )
}
