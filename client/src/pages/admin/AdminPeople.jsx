import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast, Modal } from '../../hooks/useAdmin'
import { uploadSrc } from '../../utils/uploads'

export default function AdminPeople() {
  const [people, setPeople] = useState([])
  const [allServices, setAllServices] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', specialty: '', service_ids: [] })
  const [imgFile, setImgFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/admin/people')
    setPeople(r.data.people)
    setAllServices(r.data.all_services)
  }

  async function save(e) {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name)
      fd.append('email', form.email)
      fd.append('phone', form.phone)
      fd.append('specialty', form.specialty)
      form.service_ids.forEach(id => fd.append('service_ids[]', id))
      if (imgFile) fd.append('photo', imgFile)
      await api.post('/admin/people', fd)
      showToast('success', 'Personne ajoutée.'); setModal(null); load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function toggle(id) { await api.patch(`/admin/people/${id}/toggle`); load() }
  async function del(id) {
    if (!confirm('Supprimer cette personne ?')) return
    await api.delete(`/admin/people/${id}`); showToast('success', 'Supprimé.'); load()
  }

  function toggleService(id) {
    setForm(f => ({
      ...f,
      service_ids: f.service_ids.includes(id) ? f.service_ids.filter(s => s !== id) : [...f.service_ids, id]
    }))
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Prestataires de service</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ full_name: '', email: '', phone: '', specialty: '', service_ids: [] }); setImgFile(null); setModal({}) }}>
          <i className="ri-add-line me-1"></i>Ajouter
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />

      <div className="row g-3">
        {people.map(p => (
          <div className="col-md-4 col-lg-3" key={p.id}>
            <div className="admin-card text-center h-100">
              {p.photo_path
                ? <img src={uploadSrc(`service_people/${p.photo_path}`)} alt={p.full_name} className="rounded-circle mb-2" style={{ width: 68, height: 68, objectFit: 'cover' }} />
                : <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 68, height: 68, color: '#fff', fontSize: '1.8rem' }}>{p.full_name?.[0]}</div>
              }
              <div className="fw-semibold small">{p.full_name}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.specialty}</div>
              {p.services?.length > 0 && (
                <div className="d-flex flex-wrap gap-1 justify-content-center mt-1">
                  {p.services.map(s => <span key={s.id} className="badge bg-light text-primary border" style={{ fontSize: '0.7rem' }}>{s.name}</span>)}
                </div>
              )}
              <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'} mt-2 mb-2 d-block`}>{p.is_active ? 'Actif' : 'Inactif'}</span>
              <div className="d-flex gap-1 justify-content-center">
                <button className="btn btn-xs btn-outline-secondary" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => toggle(p.id)}>{p.is_active ? 'Désactiver' : 'Activer'}</button>
                <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => del(p.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={!!modal} title="Ajouter une personne de service" onClose={() => setModal(null)}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Nom complet *</label><input className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Spécialité</label><input className="form-control" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Téléphone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="col-12">
              <label className="form-label">Services associés</label>
              <div className="service-checkboxes">
                {allServices.map(s => (
                  <label key={s.id} className="d-flex align-items-center gap-2 mb-1">
                    <input type="checkbox" checked={form.service_ids.includes(s.id)} onChange={() => toggleService(s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-12"><label className="form-label">Photo</label><input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setImgFile(e.target.files[0])} /></div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Ajouter</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
