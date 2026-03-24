import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast, Toast, Modal } from '../../hooks/useAdmin'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const { toast, showToast, clearToast } = useToast()
  const [modal, setModal] = useState(null) // null | 'create' | { type:'reset'|'role', user }
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'client' })
  const [pwForm, setPwForm] = useState({ new_password: '' })
  const [roleForm, setRoleForm] = useState({ role: 'client' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/admin/users')
    setUsers(r.data.users)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/users', form)
      showToast('success', 'Utilisateur créé.')
      setModal(null)
      setForm({ full_name: '', email: '', password: '', role: 'client' })
      load()
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function toggleActive(id) {
    await api.patch(`/admin/users/${id}/toggle`)
    load()
  }

  async function handleResetPw(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/admin/users/${modal.user.id}/password`, pwForm)
      showToast('success', 'Mot de passe réinitialisé.')
      setModal(null)
    } catch (err) { showToast('danger', err.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  async function handleChangeRole(e) {
    e.preventDefault()
    await api.patch(`/admin/users/${modal.user.id}/role`, roleForm)
    showToast('success', 'Rôle mis à jour.')
    setModal(null)
    load()
  }

  const ROLE_BADGE = { admin: 'danger', agent: 'warning', client: 'primary' }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Utilisateurs</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          <i className="ri-user-add-line me-1"></i>Créer
        </button>
      </div>
      <Toast msg={toast} onClose={clearToast} />

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>#</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Créé</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td className="fw-semibold">{u.full_name}</td>
                  <td className="text-muted small">{u.email}</td>
                  <td><span className={`badge bg-${ROLE_BADGE[u.role] || 'secondary'}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="text-muted small">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <button className="btn btn-xs btn-outline-secondary" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => toggleActive(u.id)}>
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button className="btn btn-xs btn-outline-warning" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => { setModal({ type: 'reset', user: u }); setPwForm({ new_password: '' }) }}>
                        MDP
                      </button>
                      <button className="btn btn-xs btn-outline-info" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => { setModal({ type: 'role', user: u }); setRoleForm({ role: u.role }) }}>
                        Rôle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal show={modal === 'create'} title="Créer un utilisateur" onClose={() => setModal(null)}>
        <form onSubmit={handleCreate}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Nom complet</label><input className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Mot de passe</label><input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
            <div className="col-md-6"><label className="form-label">Rôle</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="client">Client</option><option value="agent">Agent</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Créer</button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal show={modal?.type === 'reset'} title={`Réinitialiser MDP — ${modal?.user?.full_name}`} onClose={() => setModal(null)}>
        <form onSubmit={handleResetPw}>
          <label className="form-label">Nouveau mot de passe (min. 8 caractères)</label>
          <input className="form-control mb-3" type="password" value={pwForm.new_password} onChange={e => setPwForm({ new_password: e.target.value })} required />
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-warning" disabled={loading}>Réinitialiser</button>
          </div>
        </form>
      </Modal>

      {/* Change role modal */}
      <Modal show={modal?.type === 'role'} title={`Changer le rôle — ${modal?.user?.full_name}`} onClose={() => setModal(null)}>
        <form onSubmit={handleChangeRole}>
          <label className="form-label">Nouveau rôle</label>
          <select className="form-select mb-3" value={roleForm.role} onChange={e => setRoleForm({ role: e.target.value })}>
            <option value="client">Client</option><option value="agent">Agent</option><option value="admin">Admin</option>
          </select>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn btn-info">Mettre à jour</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
