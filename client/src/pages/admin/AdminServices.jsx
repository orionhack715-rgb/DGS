import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast, Modal } from '../../hooks/useAdmin'
import { uploadSrc } from '../../utils/uploads'

export default function AdminServices() {
  const [catalog, setCatalog] = useState([])
  const [legacy, setLegacy] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [legacyForm, setLegacyForm] = useState({ nom: '', description: '', criteres_services: '' })
  const [imgFile, setImgFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/admin/services')
    setCatalog(r.data.services)
    setLegacy(r.data.legacy_services)
  }

  async function saveCatalog(e) {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.item) await api.put(`/admin/services/catalog/${modal.item.id}`, form)
      else await api.post('/admin/services/catalog', form)
      showToast('success', 'Service catalogue sauvegardé.')
      setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function deleteCatalog(id) {
    if (!confirm('Supprimer ce service ?')) return
    await api.delete(`/admin/services/catalog/${id}`)
    showToast('success', 'Supprimé.'); load()
  }

  async function saveLegacy(e) {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(legacyForm).forEach(([k, v]) => fd.append(k, v))
      if (imgFile) fd.append('image', imgFile)
      if (modal?.legacyItem) await api.put(`/admin/services/legacy/${modal.legacyItem.id}`, fd)
      else await api.post('/admin/services/legacy', fd)
      showToast('success', 'Service visuel sauvegardé.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function deleteLegacy(id) {
    if (!confirm('Supprimer ?')) return
    await api.delete(`/admin/services/legacy/${id}`)
    showToast('success', 'Supprimé.'); load()
  }

  return (
    <div>
      <h2 className="fw-bold mb-3">Services</h2>
      <Toast msg={toast} onClose={clearToast} />

      {/* Catalog */}
      <div className="admin-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Catalogue de services</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ name: '', description: '', status: 'active' }); setModal('catalog') }}>
            <i className="ri-add-line me-1"></i>Ajouter
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th>Nom</th><th>Description</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {catalog.map(s => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.name}</td>
                  <td className="text-muted small">{s.description}</td>
                  <td><span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{s.status}</span></td>
                  <td>
                    <button className="btn btn-xs btn-outline-primary me-1" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => { setForm({ name: s.name, description: s.description || '', status: s.status }); setModal({ type: 'catalog', item: s }) }}>
                      Éditer
                    </button>
                    <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => deleteCatalog(s.id)}>Suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legacy */}
      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Services visuels (avec image)</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setLegacyForm({ nom: '', description: '', criteres_services: '' }); setImgFile(null); setModal('legacy') }}>
            <i className="ri-add-line me-1"></i>Ajouter
          </button>
        </div>
        <div className="row g-3">
          {legacy.map(s => (
            <div className="col-md-4" key={s.id}>
              <div className="border rounded p-3 h-100">
                {s.libelleImage && <img src={uploadSrc(`images/${s.libelleImage}`)} alt={s.nom} className="img-fluid rounded mb-2" style={{ height: 120, objectFit: 'cover', width: '100%' }} />}
                <h5 className="h6 fw-bold">{s.nom}</h5>
                <p className="small text-muted mb-2">{s.description}</p>
                <div className="d-flex gap-1">
                  <button className="btn btn-xs btn-outline-primary" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    onClick={() => { setLegacyForm({ nom: s.nom || '', description: s.description || '', criteres_services: s.criteres_services || '' }); setImgFile(null); setModal({ type: 'legacy', legacyItem: s }) }}>
                    Éditer
                  </button>
                  <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => deleteLegacy(s.id)}>Suppr.</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Modal */}
      <Modal show={modal === 'catalog' || modal?.type === 'catalog'} title={modal?.item ? 'Éditer service' : 'Ajouter service'} onClose={() => setModal(null)}>
        <form onSubmit={saveCatalog}>
          <div className="mb-3"><label className="form-label">Nom</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label">Statut</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Actif</option><option value="inactive">Inactif</option>
            </select>
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
          </div>
        </form>
      </Modal>

      {/* Legacy Modal */}
      <Modal show={modal === 'legacy' || modal?.type === 'legacy'} title={modal?.legacyItem ? 'Éditer service visuel' : 'Ajouter service visuel'} onClose={() => setModal(null)}>
        <form onSubmit={saveLegacy}>
          <div className="mb-3"><label className="form-label">Nom</label><input className="form-control" value={legacyForm.nom} onChange={e => setLegacyForm(f => ({ ...f, nom: e.target.value }))} required /></div>
          <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={legacyForm.description} onChange={e => setLegacyForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label">Critères (séparés par virgules)</label><input className="form-control" value={legacyForm.criteres_services} onChange={e => setLegacyForm(f => ({ ...f, criteres_services: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label">Image</label><input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setImgFile(e.target.files[0])} /></div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
