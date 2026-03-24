const defaultUploadsURL = import.meta.env.MODE === 'development'
  ? '/uploads'
  : 'https://dgs-1.onrender.com/uploads'

const rawUploadsURL = import.meta.env.VITE_UPLOADS_URL || defaultUploadsURL
const uploadsBaseURL = rawUploadsURL.endsWith('/') ? rawUploadsURL.slice(0, -1) : rawUploadsURL

export function uploadSrc(path = '') {
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return normalizedPath ? `${uploadsBaseURL}/${normalizedPath}` : uploadsBaseURL
}

