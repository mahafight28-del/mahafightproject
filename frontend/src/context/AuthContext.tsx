import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import * as authService from '../services/authService'
import { setToken as setTokenHelper, getToken, clearToken } from '../utils/token'
import jwtDecode from 'jwt-decode'

type JwtPayload = { 
  sub?: string
  nameid?: string
  email?: string
  role?: string
  roles?: string[]
  [key: string]: any
}
type User = { id: string; name?: string; email?: string; roles?: string[] } | null

type AuthContextType = {
  user: User
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (roles: string[] | string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState<boolean>(!!token)

  useEffect(() => {
    const syncUserFromToken = async () => {
      const t = getToken()
      if (!t) { 
        setUser(null)
        setLoading(false)
        setToken(null)
        return 
      }
      
      setLoading(true)
      try {
        const payload = jwtDecode<JwtPayload>(t)
        console.log('JWT Payload:', payload)
        const userData = {
          id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || payload.nameid || '',
          name: payload.name || 'User',
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || '',
          roles: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']] : (payload.role ? [payload.role] : (payload.roles || []))
        }
        setUser(userData)
        console.log('User set from token:', userData)
      } catch (error) {
        console.error('JWT decode failed:', error)
        clearToken()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    syncUserFromToken()
  }, [token])

  const login = async (email: string, password: string) => {
    const { token: t, user: userData } = await authService.login(email, password)
    setTokenHelper(t, true)
    
    const userObj = {
      id: userData.id,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      roles: [userData.role]
    }
    
    setUser(userObj)
    setToken(t)
    console.log('Login successful, user set:', userObj)
  }

  const logout = async () => {
    await authService.logout()
    clearToken()
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const hasRole = (roles: string[] | string) => {
    if (!user?.roles) return false
    const want = Array.isArray(roles) ? roles : [roles]
    const userRoles = user.roles || []
    return want.some(r => userRoles.includes(r))
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
