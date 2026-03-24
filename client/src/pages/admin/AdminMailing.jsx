import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast } from '../../hooks/useAdmin'

export default function AdminMailing() {
  const [smtpStatus, setSmtpStatus] = useState(null)
  const [form, setForm] = useState({ to_email: '', subject: '', html_body: '' })
  const { toast, showToast, clearToast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/mail-test').then(r => setSmtpStatus(r.data)).catch(() => {})
  }, [])

  async function sendTest() {
    const r = await api.get('/admin/mail-test')
    setSmtpStatus(r.data)
    showToast(r.data.status === 'success' ? 'success' : 'warning', r.data.message)
  }

  async function handleSend(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/mailing/send', form)
      showToast('success', 'Email envoyé.')
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  const statusColor = { success: 'success', error: 'danger', disabled: 'secondary', not_configured: 'warning' }

  return (
    <div>
      <h2 className="fw-bold mb-3">Mailing</h2>
      <Toast msg={toast} onClose={clearToast} />

      <div className="row g-4">
        {/* SMTP Status */}
        <div className="col-lg-5">
          <div className="admin-card">
            <h3>Configuration SMTP</h3>
            {smtpStatus && (
              <div className={`alert alert-${statusColor[smtpStatus.status] || 'info'} mb-3`}>
                <strong>{smtpStatus.status}</strong> — {smtpStatus.message}
              </div>
            )}
            {smtpStatus?.config && (
              <ul className="list-unstyled small text-muted mb-3">
                <li><strong>Host:</strong> {smtpStatus.config.host || '—'}</li>
                <li><strong>Port:</strong> {smtpStatus.config.port}</li>
                <li><strong>From:</strong> {smtpStatus.config.from || '—'}</li>
                <li><strong>TLS:</strong> {smtpStatus.config.use_tls ? 'Oui' : 'Non'}</li>
                <li><strong>Contact email:</strong> {smtpStatus.config.contact_email || '—'}</li>
              </ul>
            )}
            <button className="btn btn-outline-primary w-100" onClick={sendTest}>
              <i className="ri-refresh-line me-1"></i>Tester la connexion SMTP
            </button>
          </div>
        </div>

        {/* Send email */}
        <div className="col-lg-7">
          <div className="admin-card">
            <h3>Envoyer un email</h3>
            <form onSubmit={handleSend}>
              <div className="mb-3">
                <label className="form-label">Destinataire</label>
                <input className="form-control" type="email" value={form.to_email} onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Sujet</label>
                <input className="form-control" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Corps (HTML)</label>
                <textarea className="form-control" rows={8} value={form.html_body} onChange={e => setForm(f => ({ ...f, html_body: e.target.value }))} placeholder="<h1>Bonjour</h1><p>Votre message...</p>" required />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi...</> : <><i className="ri-send-plane-line me-1"></i>Envoyer</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
