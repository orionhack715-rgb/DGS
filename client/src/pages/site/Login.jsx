import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/backoffice' : '/compte')
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section-shell auth-shell">
      <div className="container py-5">
        <div className="auth-card mx-auto">
          <div className="text-center mb-4">
            <span className="badge-soft mb-2"><i className="ri-lock-line"></i> Connexion</span>
            <h1 className="h3 fw-bold">Bon retour !</h1>
            <p className="text-muted">Connectez-vous à votre espace personnel.</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="ri-error-warning-line me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                className="form-control" type="email" placeholder="vous@exemple.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Mot de passe</label>
              <input
                className="form-control" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</>
                : <><i className="ri-login-box-line me-2"></i>Se connecter</>
              }
            </button>
          </form>

          <p className="text-center mt-3 mb-0 text-muted small">
            Pas encore de compte ? <Link to="/register" className="fw-semibold">S'inscrire</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
