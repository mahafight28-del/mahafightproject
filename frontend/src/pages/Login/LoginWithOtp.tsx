import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Steps } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { otpService } from '../../services/otpService';
import { useAuth } from '../../context/AuthContext';
import { setToken } from '../../utils/token';

const { Title, Text } = Typography;
const { Step } = Steps;

const LoginWithOtp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOtp = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await otpService.sendOtp({
        email: values.email,
        purpose: 'LOGIN'
      });

      if (response.success) {
        message.success(response.message);
        setEmail(values.email);
        setCurrentStep(1);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleLogin = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      message.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await otpService.loginWithOtp({
        email,
        otp: otpCode
      });

      if (response.success && response.token) {
        setToken(response.token, true);
        localStorage.setItem('user', JSON.stringify(response.user));
        message.success('Login successful');
        navigate('/dashboard');
      } else {
        message.error(response.message);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              Login with OTP
            </Title>
            <Text type="secondary">
              Password-less secure login
            </Text>
          </div>

          <Steps current={currentStep} size="small">
            <Step title="Email" />
            <Step title="OTP" />
          </Steps>

          {currentStep === 0 && (
            <Form onFinish={handleSendOtp} layout="vertical" size="large">
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Send Login OTP
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  Enter the OTP sent to<br />
                  <strong>{email}</strong>
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    style={{ 
                      width: 50, 
                      height: 50, 
                      textAlign: 'center', 
                      fontSize: 20,
                      fontWeight: 'bold'
                    }}
                    maxLength={1}
                  />
                ))}
              </div>

              <Button
                type="primary"
                onClick={handleLogin}
                loading={loading}
                block
                size="large"
                disabled={otp.join('').length !== 6}
              >
                Login
              </Button>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="link"
                  onClick={() => {
                    setCurrentStep(0);
                    setOtp(['', '', '', '', '', '']);
                  }}
                >
                  Change Email
                </Button>
              </div>
            </Space>
          )}

          <div style={{ textAlign: 'center' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginWithOtp;