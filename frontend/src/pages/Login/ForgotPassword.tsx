import React, { useState } from 'react'
import { Card, Form, Input, Button, message, Steps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { sendOtp, verifyOtp, resetPassword } from '../../services/forgotPasswordService'

const { Step } = Steps

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [identifier, setIdentifier] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSendOtp = async (values: any) => {
    setLoading(true)
    try {
      const result = await sendOtp(values.identifier)
      if (result.success) {
        message.success(result.message)
        setIdentifier(values.identifier)
        setCurrentStep(1)
        setResendTimer(60)
      } else {
        if (result.resendAfterSeconds) {
          setResendTimer(result.resendAfterSeconds)
        }
        message.error(result.message)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (values: any) => {
    setLoading(true)
    try {
      const result = await verifyOtp(identifier, values.otp)
      if (result.success) {
        message.success(result.message)
        setCurrentStep(2)
      } else {
        message.error(result.message)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword(identifier, form.getFieldValue('otp'), values.newPassword)
      if (result.success) {
        message.success(result.message)
        setTimeout(() => navigate('/login'), 2000)
      } else {
        message.error(result.message)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      message.warning(`Please wait ${resendTimer} seconds before resending`)
      return
    }
    await handleSendOtp({ identifier })
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        title="Forgot Password" 
        style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Enter Details" />
          <Step title="Verify OTP" />
          <Step title="Reset Password" />
        </Steps>

        {currentStep === 0 && (
          <Form form={form} layout="vertical" onFinish={handleSendOtp}>
            <Form.Item
              name="identifier"
              label="Email or Mobile Number"
              rules={[{ required: true, message: 'Please enter your email or mobile number' }]}
            >
              <Input placeholder="Enter registered email or 10-digit mobile" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send OTP
              </Button>
            </Form.Item>
            <Button type="link" onClick={() => navigate('/login')} block>
              Back to Login
            </Button>
          </Form>
        )}

        {currentStep === 1 && (
          <Form form={form} layout="vertical" onFinish={handleVerifyOtp}>
            <Form.Item
              name="otp"
              label="Enter OTP"
              rules={[
                { required: true, message: 'Please enter OTP' },
                { len: 6, message: 'OTP must be 6 digits' }
              ]}
            >
              <Input placeholder="Enter 6-digit OTP" size="large" maxLength={6} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Verify OTP
              </Button>
            </Form.Item>
            <Button 
              type="link" 
              onClick={handleResendOtp} 
              disabled={resendTimer > 0}
              block
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </Button>
          </Form>
        )}

        {currentStep === 2 && (
          <Form form={form} layout="vertical" onFinish={handleResetPassword}>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter new password" size="large" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[{ required: true, message: 'Please confirm your password' }]}
            >
              <Input.Password placeholder="Confirm new password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default ForgotPassword