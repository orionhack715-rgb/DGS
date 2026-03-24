import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast, Modal } from '../../hooks/useAdmin'
import { uploadSrc } from '../../utils/uploads'

// ─── Shared image form helper ─────────────────────────────────────────────────
function ImgPreview({ path, prefix = 'images' }) {
  if (!path) return null
  return <img src={uploadSrc(`${prefix}/${path}`)} alt="" className="img-fluid rounded mb-2" style={{ maxHeight: 100, objectFit: 'cover' }} />
}

// ─── AdminProjects ────────────────────────────────────────────────────────────
export function AdminProjects() {
  const [projects, setProjects] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '', lien_button: '', criteres_services: '', categorie: '' })
  const [imgFile, setImgFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { const r = await api.get('/admin/projects'); setProjects(r.data.projects) }

  async function save(e) {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imgFile) fd.append('image', imgFile)
      if (modal?.item) await api.put(`/admin/projects/${modal.item.id}`, fd)
      else await api.post('/admin/projects', fd)
      showToast('success', 'Projet sauvegardé.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function del(id) {
    if (!confirm('Supprimer ce projet ?')) return
    await api.delete(`/admin/projects/${id}`); showToast('success', 'Supprimé.'); load()
  }

  function openEdit(item) {
    setForm({ nom: item.nom || '', description: item.description || '', lien_button: item.lien_button || '', criteres_services: item.criteres_services || '', categorie: item.categorie || '' })
    setImgFile(null); setModal({ item })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Projets / Réalisations</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ nom: '', description: '', lien_button: '', criteres_services: '', categorie: '' }); setImgFile(null); setModal({}) }}>
          <i className="ri-add-line me-1"></i>Ajouter
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />

      <div className="row g-3">
        {projects.map(p => (
          <div className="col-md-4" key={p.id}>
            <div className="admin-card h-100">
              {p.libelleImage && <ImgPreview path={p.libelleImage} />}
              <h5 className="h6 fw-bold">{p.nom}</h5>
              {p.categorie && <span className="badge bg-info text-dark me-1 mb-1">{p.categorie}</span>}
              <p className="small text-muted mb-2">{p.description}</p>
              <div className="d-flex gap-1 mt-auto">
                <button className="btn btn-xs btn-outline-primary" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => openEdit(p)}>Éditer</button>
                <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => del(p.id)}>Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={!!modal} title={modal?.item ? 'Éditer projet' : 'Ajouter projet'} onClose={() => setModal(null)}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Catégorie</label><input className="form-control" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Lien</label><input className="form-control" value={form.lien_button} onChange={e => setForm(f => ({ ...f, lien_button: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Critères</label><input className="form-control" value={form.criteres_services} onChange={e => setForm(f => ({ ...f, criteres_services: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Image</label><input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setImgFile(e.target.files[0])} /></div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── AdminMembers ─────────────────────────────────────────────────────────────
export function AdminMembers() {
  const [members, setMembers] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nom: '', role: '' })
  const [imgFile, setImgFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { const r = await api.get('/admin/members'); setMembers(r.data.members) }

  async function save(e) {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imgFile) fd.append('photo', imgFile)
      if (modal?.item) await api.put(`/admin/members/${modal.item.id}`, fd)
      else await api.post('/admin/members', fd)
      showToast('success', 'Membre sauvegardé.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function toggle(id) { await api.patch(`/admin/members/${id}/toggle`); load() }
  async function del(id) { if (!confirm('Supprimer ?')) return; await api.delete(`/admin/members/${id}`); showToast('success', 'Supprimé.'); load() }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Membres — Notre Équipe</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ nom: '', role: '' }); setImgFile(null); setModal({}) }}>
          <i className="ri-add-line me-1"></i>Ajouter
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />
      <div className="row g-3">
        {members.map(m => (
          <div className="col-md-3 col-sm-4" key={m.id}>
            <div className="admin-card text-center h-100">
              {m.libelleImage
                ? <img src={uploadSrc(`images/${m.libelleImage}`)} alt={m.nom} className="rounded-circle mb-2" style={{ width: 70, height: 70, objectFit: 'cover' }} />
                : <div className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 70, height: 70, color: '#fff', fontSize: '1.8rem' }}>{m.nom?.[0]}</div>}
              <div className="fw-semibold small">{m.nom}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>{m.role}</div>
              <span className={`badge ${m.is_suspended ? 'bg-secondary' : 'bg-success'} mt-1 mb-2`}>{m.is_suspended ? 'Suspendu' : 'Actif'}</span>
              <div className="d-flex gap-1 justify-content-center">
                <button className="btn btn-xs btn-outline-primary" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => { setForm({ nom: m.nom || '', role: m.role || '' }); setImgFile(null); setModal({ item: m }) }}>Éditer</button>
                <button className="btn btn-xs btn-outline-secondary" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => toggle(m.id)}>{m.is_suspended ? 'Activer' : 'Suspendre'}</button>
                <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => del(m.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={!!modal} title={modal?.item ? 'Éditer membre' : 'Ajouter membre'} onClose={() => setModal(null)}>
        <form onSubmit={save}>
          <div className="mb-3"><label className="form-label">Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required /></div>
          <div className="mb-3"><label className="form-label">Rôle / Poste</label><input className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label">Photo</label><input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setImgFile(e.target.files[0])} /></div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── AdminDomaines ────────────────────────────────────────────────────────────
export function AdminDomaines() {
  const [items, setItems] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ icon: '', nom: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { const r = await api.get('/admin/domaines'); setItems(r.data.domaines) }

  async function save(e) {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.item) await api.put(`/admin/domaines/${modal.item.id}`, form)
      else await api.post('/admin/domaines', form)
      showToast('success', 'Domaine sauvegardé.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function toggle(id) { await api.patch(`/admin/domaines/${id}/toggle`); load() }
  async function del(id) { if (!confirm('Supprimer ?')) return; await api.delete(`/admin/domaines/${id}`); showToast('success', 'Supprimé.'); load() }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Domaines d'accueil</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ icon: '', nom: '', description: '' }); setModal({}) }}>
          <i className="ri-add-line me-1"></i>Ajouter
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />
      <div className="admin-card">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th>Icône</th><th>Nom</th><th>Description</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><i className={item.icon} style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i></td>
                <td className="fw-semibold">{item.nom}</td>
                <td className="text-muted small">{item.description}</td>
                <td><span className={`badge ${item.is_suspended ? 'bg-secondary' : 'bg-success'}`}>{item.is_suspended ? 'Suspendu' : 'Actif'}</span></td>
                <td>
                  <button className="btn btn-xs btn-outline-primary me-1" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    onClick={() => { setForm({ icon: item.icon || '', nom: item.nom || '', description: item.description || '' }); setModal({ item }) }}>Éditer</button>
                  <button className="btn btn-xs btn-outline-secondary me-1" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => toggle(item.id)}>{item.is_suspended ? 'Activer' : 'Suspendre'}</button>
                  <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => del(item.id)}>Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={!!modal} title={modal?.item ? 'Éditer domaine' : 'Ajouter domaine'} onClose={() => setModal(null)}>
        <form onSubmit={save}>
          <div className="mb-3"><label className="form-label">Classe icône (ex: ri-code-line)</label><input className="form-control" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="ri-code-s-slash-line" /></div>
          <div className="mb-3"><label className="form-label">Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required /></div>
          <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── AdminEquipePropos ────────────────────────────────────────────────────────
export function AdminEquipePropos() {
  const [items, setItems] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ icon: '', nom: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { const r = await api.get('/admin/equipe-propos'); setItems(r.data.items) }

  async function save(e) {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.item) await api.put(`/admin/equipe-propos/${modal.item.id}`, form)
      else await api.post('/admin/equipe-propos', form)
      showToast('success', 'Sauvegardé.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function toggle(id) { await api.patch(`/admin/equipe-propos/${id}/toggle`); load() }
  async function del(id) { if (!confirm('Supprimer ?')) return; await api.delete(`/admin/equipe-propos/${id}`); showToast('success', 'Supprimé.'); load() }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Équipe — Page À propos</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ icon: '', nom: '', description: '' }); setModal({}) }}>
          <i className="ri-add-line me-1"></i>Ajouter
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />
      <div className="row g-3">
        {items.map(item => (
          <div className="col-md-4" key={item.id}>
            <div className="admin-card h-100">
              <i className={`${item.icon} fs-2 text-primary mb-2 d-block`}></i>
              <h5 className="h6 fw-bold">{item.nom}</h5>
              <p className="small text-muted mb-2">{item.description}</p>
              <span className={`badge ${item.is_suspended ? 'bg-secondary' : 'bg-success'} mb-2`}>{item.is_suspended ? 'Suspendu' : 'Actif'}</span>
              <div className="d-flex gap-1 mt-2">
                <button className="btn btn-xs btn-outline-primary" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => { setForm({ icon: item.icon || '', nom: item.nom || '', description: item.description || '' }); setModal({ item }) }}>Éditer</button>
                <button className="btn btn-xs btn-outline-secondary" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => toggle(item.id)}>{item.is_suspended ? 'Activer' : 'Suspendre'}</button>
                <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => del(item.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={!!modal} title={modal?.item ? 'Éditer' : 'Ajouter'} onClose={() => setModal(null)}>
        <form onSubmit={save}>
          <div className="mb-3"><label className="form-label">Classe icône</label><input className="form-control" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label">Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required /></div>
          <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
