import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
  }, [])

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password })
    setUser(r.data.user)
    return r.data.user
  }

  async function register(data) {
    const r = await api.post('/auth/register', data)
    setUser(r.data.user)
    return r.data.user
  }

  async function logout() {
    await api.post('/auth/logout')
    setUser(null)
  }

  async function updateProfile(data) {
    const r = await api.put('/auth/profile', data)
    setUser(r.data.user)
    return r.data
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
