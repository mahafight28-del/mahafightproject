import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Statistic } from 'antd';
import { SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { otpService } from '../../services/otpService';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const OtpVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(Input | null)[]>([]);

  const { email, purpose } = location.state || {};

  useEffect(() => {
    if (!email || !purpose) {
      navigate('/forgot-password');
      return;
    }
    
    // Focus first input
    inputRefs.current[0]?.focus();
  }, [email, purpose, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      message.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await otpService.verifyOtp({
        email,
        otp: otpCode,
        purpose
      });

      if (response.success) {
        message.success(response.message);
        
        if (purpose === 'RESET_PASSWORD') {
          navigate('/forgot-password/reset', { 
            state: { email, otp: otpCode } 
          });
        } else {
          // Handle login OTP
          navigate('/dashboard');
        }
      } else {
        message.error(response.message);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await otpService.sendOtp({ email, purpose });
      
      if (response.success) {
        message.success('OTP sent successfully');
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
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
            <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={3} style={{ margin: 0 }}>
              Enter OTP
            </Title>
            <Text type="secondary">
              We've sent a 6-digit code to<br />
              <strong>{email}</strong>
            </Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
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
            onClick={handleVerify}
            loading={loading}
            block
            size="large"
            disabled={otp.join('').length !== 6}
          >
            Verify OTP
          </Button>

          <div style={{ textAlign: 'center' }}>
            {!canResend ? (
              <div>
                <Text type="secondary">Resend OTP in </Text>
                <Countdown
                  value={Date.now() + 60000}
                  format="ss"
                  onFinish={() => setCanResend(true)}
                  valueStyle={{ fontSize: 14, color: '#1890ff' }}
                />
                <Text type="secondary"> seconds</Text>
              </div>
            ) : (
              <Button
                type="link"
                onClick={handleResend}
                loading={resendLoading}
              >
                Resend OTP
              </Button>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/forgot-password')}
            >
              Change Email
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default OtpVerification;