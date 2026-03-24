import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

export default function AdminChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const wsRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { loadConversations() }, [])

  async function loadConversations() {
    const r = await api.get('/chat/admin/conversations')
    setConversations(r.data.conversations)
  }

  async function selectConversation(conv) {
    setActiveConv(conv)
    const r = await api.get(`/chat/admin/messages/${conv.id}`)
    setMessages(r.data.messages)
  }

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === 'chat:new_message') {
          loadConversations()
          if (activeConv && payload.conversation_id === activeConv.id) {
            setMessages(prev => {
              if (prev.find(m => m.id === payload.message_id)) return prev
              return [...prev, { id: payload.message_id, sender_id: payload.sender_id, sender_name: payload.sender_name, content: payload.content, created_at: payload.created_at }]
            })
          }
        }
      } catch {}
    }
    return () => ws.close()
  }, [activeConv])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || !activeConv) return
    try {
      const r = await api.post('/chat/admin/send', { conversation_id: activeConv.id, message: input.trim() })
      const newMsg = { id: r.data.message_id, sender_id: user.id, sender_name: user.full_name, content: input.trim(), created_at: new Date().toISOString() }
      setMessages(prev => [...prev, newMsg])
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'chat:new_message', message_id: r.data.message_id, conversation_id: activeConv.id, sender_id: user.id, sender_name: user.full_name, content: input.trim(), created_at: newMsg.created_at }))
      }
      setInput('')
      loadConversations()
    } catch {}
  }

  function getOtherUser(conv) {
    return conv.user_one?.id === user?.id ? conv.user_two : conv.user_one
  }

  return (
    <div>
      <h2 className="fw-bold mb-3">Chat — Support</h2>
      <div className="chat-layout">
        {/* Conversations list */}
        <div className="chat-users-panel">
          <div className="chat-header">Conversations ({conversations.length})</div>
          <div className="chat-users-list">
            {conversations.length === 0 && <p className="text-muted small text-center mt-3">Aucune conversation</p>}
            {conversations.map(conv => {
              const other = getOtherUser(conv)
              return (
                <div
                  key={conv.id}
                  className={`chat-user-item${activeConv?.id === conv.id ? ' active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="fw-semibold small">{other?.full_name || 'Utilisateur'}</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{other?.email}</div>
                  {conv.last_message && (
                    <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: '100%' }}>
                      {conv.last_message.content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat window */}
        <div className="chat-main-panel">
          {!activeConv ? (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{ minHeight: 400 }}>
              <div className="text-center">
                <i className="ri-chat-3-line" style={{ fontSize: '3rem', opacity: 0.4 }}></i>
                <p className="mt-2">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <i className="ri-user-line me-2"></i>{getOtherUser(activeConv)?.full_name}
                <span className="text-muted small ms-2">{getOtherUser(activeConv)?.email}</span>
              </div>
              <div className="chat-messages">
                {messages.map(m => (
                  <div key={m.id} className={`chat-bubble ${m.sender_id === user?.id ? 'self' : 'other'}`}>
                    {m.content}
                    <span className="chat-meta">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="chat-form">
                <input className="form-control" value={input} onChange={e => setInput(e.target.value)} placeholder="Répondre..." />
                <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                  <i className="ri-send-plane-line"></i>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
