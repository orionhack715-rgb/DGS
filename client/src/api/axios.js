import axios from 'axios'

const defaultApiURL = import.meta.env.MODE === 'development'
  ? '/api'
  : 'https://dgs-1.onrender.com'

const rawApiBaseURL = import.meta.env.VITE_API_URL || defaultApiURL
const apiBaseURL = rawApiBaseURL.endsWith('/') ? rawApiBaseURL.slice(0, -1) : rawApiBaseURL

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve())
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original)).catch((e) => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      try {
        await api.post('/auth/refresh')
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
