import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../admin.css'

export default function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role === 'admin') return <Navigate to="/backoffice" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      if (u.role !== 'admin') { setError('Accès réservé aux administrateurs.'); return }
      navigate('/backoffice')
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-body">
      <div className="admin-login-card">
        <div className="text-center mb-4">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🔐 Back-office</h1>
          <p className="text-muted small">Digital Get Services — Administration</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email administrateur</label>
            <input className="form-control" type="email" placeholder="admin@exemple.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold small">Mot de passe</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
