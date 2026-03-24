import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast } from '../../hooks/useAdmin'
import { uploadSrc } from '../../utils/uploads'

export default function AdminSiteContent() {
  const [data, setData] = useState({ header: null, socials: [], footerServices: [], footerContact: null })
  const { toast, showToast, clearToast } = useToast()
  const [headerForm, setHeaderForm] = useState({ nom: '', slogan: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [contactForm, setContactForm] = useState({ email: '', telephone: '' })
  const [newSocial, setNewSocial] = useState({ icon: '', lien: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/admin/site-content')
    setData(r.data)
    if (r.data.header) setHeaderForm({ nom: r.data.header.nom || '', slogan: r.data.header.slogan || '' })
    if (r.data.footerContact) setContactForm({ email: r.data.footerContact.email || '', telephone: r.data.footerContact.telephone || '' })
  }

  async function saveHeader(e) {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('nom', headerForm.nom)
      fd.append('slogan', headerForm.slogan)
      if (logoFile) fd.append('logo', logoFile)
      await api.post('/admin/site-content/header', fd)
      showToast('success', 'Header mis à jour.'); load()
    } catch { showToast('danger', 'Erreur') } finally { setLoading(false) }
  }

  async function saveContact(e) {
    e.preventDefault()
    await api.post('/admin/site-content/footer-contact', contactForm)
    showToast('success', 'Contact footer mis à jour.')
  }

  async function addSocial(e) {
    e.preventDefault()
    if (!newSocial.icon || !newSocial.lien) return
    await api.post('/admin/site-content/socials', newSocial)
    showToast('success', 'Réseau ajouté.'); setNewSocial({ icon: '', lien: '' }); load()
  }

  async function deleteSocial(id) {
    await api.delete(`/admin/site-content/socials/${id}`); showToast('success', 'Supprimé.'); load()
  }

  return (
    <div>
      <h2 className="fw-bold mb-3">Contenu du site</h2>
      <Toast msg={toast} onClose={clearToast} />

      <div className="row g-4">
        {/* Header */}
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <h3>En-tête (Navbar)</h3>
            <form onSubmit={saveHeader}>
              <div className="mb-3">
                <label className="form-label">Nom de la marque</label>
                <input className="form-control" value={headerForm.nom} onChange={e => setHeaderForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Slogan</label>
                <input className="form-control" value={headerForm.slogan} onChange={e => setHeaderForm(f => ({ ...f, slogan: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Logo</label>
                {data.header?.logo && <div className="mb-2"><img src={uploadSrc(`images/${data.header.logo}`)} alt="Logo" style={{ height: 50 }} /></div>}
                <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setLogoFile(e.target.files[0])} />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>Sauvegarder l'en-tête</button>
            </form>
          </div>
        </div>

        {/* Footer contact */}
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <h3>Footer — Contact</h3>
            <form onSubmit={saveContact}>
              <div className="mb-3">
                <label className="form-label">Email de contact</label>
                <input className="form-control" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Téléphone</label>
                <input className="form-control" value={contactForm.telephone} onChange={e => setContactForm(f => ({ ...f, telephone: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">Sauvegarder</button>
            </form>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="col-12">
          <div className="admin-card">
            <h3>Réseaux sociaux (Footer)</h3>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {data.socials.map(s => (
                <div key={s.id} className="border rounded p-2 d-flex align-items-center gap-2">
                  <i className={s.icon} style={{ fontSize: '1.2rem' }}></i>
                  <span className="small text-muted">{s.lien}</span>
                  <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.7rem', padding: '1px 6px' }} onClick={() => deleteSocial(s.id)}>✕</button>
                </div>
              ))}
            </div>
            <form onSubmit={addSocial} className="d-flex gap-2 flex-wrap">
              <input className="form-control" style={{ flex: '1 1 160px' }} placeholder="ri-facebook-line" value={newSocial.icon} onChange={e => setNewSocial(f => ({ ...f, icon: e.target.value }))} />
              <input className="form-control" style={{ flex: '2 1 220px' }} placeholder="https://facebook.com/..." value={newSocial.lien} onChange={e => setNewSocial(f => ({ ...f, lien: e.target.value }))} />
              <button type="submit" className="btn btn-primary">Ajouter</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
