import api from './api'
import { setToken, clearToken, getToken } from '../utils/token'

type LoginResponse = { 
  token: string
  expires: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

type RefreshResponse = {
  token: string
  expires: string
}

export const login = async (email: string, password: string) => {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  const { token, user } = res.data
  
  if (!token) throw new Error('No access token returned')
  
  // Store token and user info
  setToken(token, true)
  localStorage.setItem('user', JSON.stringify(user))
  
  return { token, user }
}

export const refreshToken = async (): Promise<string | null> => {
  try {
    const res = await api.post<RefreshResponse>('/auth/refresh')
    const { token } = res.data
    
    if (token) {
      setToken(token, true)
      return token
    }
    
    return null
  } catch (error) {
    // Refresh failed, user needs to login again
    clearToken()
    localStorage.removeItem('user')
    return null
  }
}

export const logout = async () => {
  try { 
    await api.post('/auth/logout') 
  } catch {}
  
  clearToken()
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Auto-refresh token interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const newToken = await refreshToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } else {
        // Redirect to login
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default { login, logout, refreshToken, getCurrentUser, isTokenExpired }
