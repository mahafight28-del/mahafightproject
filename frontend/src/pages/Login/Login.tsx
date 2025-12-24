import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Form, Input, Button, Card } from 'antd'

const Login: React.FC = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const onFinish = async (values: any) => {
    try {
      await auth.login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err: any) {
      alert(err?.message || 'Login failed')
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ maxWidth: 420, width: '100%', margin: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24, padding: '20px', borderRadius: '8px' }}>
          <img 
            src="/src/assets/IMG_9357.JPG" 
            alt="MAHA FIGHT" 
            style={{ height: 80, marginBottom: 16 }} 
          />
          <h2 style={{ margin: 0, color: '#333' }}>MAHA FIGHT</h2>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>Dealer Management System</p>
        </div>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign in
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Button type="link" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
