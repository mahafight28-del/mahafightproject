import axios from 'axios'
import { getToken, setToken, clearToken } from '../utils/token'

// Production API URL for Render deployment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Check if we're on production domain
    if (window.location.hostname.includes('mahafight-front.onrender.com')) {
      return 'https://mahafight-api.onrender.com/api'
    }
  }
  // Fallback to environment variable or localhost
  return (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const originalRequest = err?.config
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      // try refresh via cookie-based refresh endpoint
      return fetch((api.defaults.baseURL || '/api') + '/auth/refresh', { method: 'POST', credentials: 'include' })
        .then(async (r) => {
          if (!r.ok) throw new Error('Refresh failed')
          const data = await r.json()
          const newToken = data?.accessToken || data?.token
          if (newToken) {
            setToken(newToken, true)
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axios(originalRequest)
          }
          throw new Error('No token from refresh')
        })
        .catch(() => {
          try { clearToken() } catch {}
          window.location.href = '/login'
          return Promise.reject(err)
        })
    }
    return Promise.reject(err)
  }
)

export default api
