import { useState } from 'react'
import api from '../../api/axios'

export default function Formulaire() {
  const [form, setForm] = useState({ nom: '', prenom: '', tel: '', email: '', entreprise: '', message: '', website: '' })
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const r = await api.post('/site/contact', form)
      setMsg(r.data.message || 'Message envoyé avec succès.')
      setStatus('success')
      setForm({ nom: '', prenom: '', tel: '', email: '', entreprise: '', message: '', website: '' })
    } catch (err) {
      setMsg(err.response?.data?.error || "Erreur lors de l'envoi.")
      setStatus('error')
    }
  }

  return (
    <>
      <section className="hero-section" style={{ padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
        <div className="container text-center">
          <span className="hero-kicker"><i className="ri-mail-send-line"></i> Contact</span>
          <h1 className="mt-2">Contactez-Nous</h1>
          <p className="lead">Audit initial offert, sans engagement. Réponse en moins de 24h.</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-lg-7">
              <div className="auth-card contact-panel p-4">
                <h2 className="h4 mb-1">Envoyez-nous un message</h2>
                <p className="text-muted small mb-4">Tous les champs sont obligatoires.</p>

                {status === 'success' && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="ri-checkbox-circle-line me-2"></i>{msg}
                    <button type="button" className="btn-close" onClick={() => setStatus(null)}></button>
                  </div>
                )}
                {status === 'error' && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="ri-error-warning-line me-2"></i>{msg}
                    <button type="button" className="btn-close" onClick={() => setStatus(null)}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Honeypot */}
                  <input type="text" name="website" value={form.website} onChange={handleChange} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nom</label>
                      <input className="form-control" name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Prénom</label>
                      <input className="form-control" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Votre prénom" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Téléphone</label>
                      <input className="form-control" name="tel" value={form.tel} onChange={handleChange} placeholder="+33 6 00 00 00 00" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Entreprise</label>
                      <input className="form-control" name="entreprise" value={form.entreprise} onChange={handleChange} placeholder="Nom de votre entreprise" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Message</label>
                      <textarea className="form-control" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Décrivez votre projet..." required />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary w-100 submit-btn" disabled={status === 'loading'}>
                        {status === 'loading'
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi en cours...</>
                          : <><i className="ri-send-plane-line me-2"></i>Envoyer le message</>
                        }
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="contact-aside h-100">
                <h3 className="h5 mb-3">Pourquoi nous choisir ?</h3>
                <ul className="contact-points">
                  <li><i className="ri-shield-check-line"></i> Audit initial offert</li>
                  <li><i className="ri-time-line"></i> Réponse en moins de 24h</li>
                  <li><i className="ri-team-line"></i> Équipe dédiée à votre projet</li>
                  <li><i className="ri-award-line"></i> 120+ missions réussies</li>
                  <li><i className="ri-thumb-up-line"></i> 98% de satisfaction client</li>
                </ul>
                <div className="trust-box mt-4">
                  <i className="ri-lock-line"></i>
                  <span className="small">Vos données sont protégées et confidentielles.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
