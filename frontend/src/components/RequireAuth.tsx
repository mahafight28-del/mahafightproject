import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spin, Result, Button } from 'antd'

type RequireAuthProps = { roles?: string[] }

export const RequireAuth: React.FC<RequireAuthProps> = ({ roles }) => {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="Access Denied"
          subTitle={`You need ${roles.join(' or ')} role to access this page.`}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    )
  }
  
  return <Outlet />
}

export default RequireAuth
