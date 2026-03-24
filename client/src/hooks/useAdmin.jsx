import { useState, useCallback } from 'react'

export function useAdminData(fetchFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetchFn(); setData(r.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  return { data, loading, load, setData }
}

export function Toast({ msg, onClose }) {
  if (!msg) return null
  return (
    <div className={`alert alert-${msg.type} alert-dismissible fade show`} role="alert">
      {msg.text}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000) }
  return { toast, showToast, clearToast: () => setToast(null) }
}

export function Modal({ show, title, onClose, children }) {
  if (!show) return null
  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  )
}
