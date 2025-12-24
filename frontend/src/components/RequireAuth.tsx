import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spin } from 'antd'

type RequireAuthProps = { roles?: string[] }

export const RequireAuth: React.FC<RequireAuthProps> = ({ roles }) => {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && roles.length > 0 && !hasRole(roles)) return <Navigate to="/" replace />
  return <Outlet />
}

export default RequireAuth
