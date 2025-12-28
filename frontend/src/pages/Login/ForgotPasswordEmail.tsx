import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { otpService } from '../../services/otpService';

const { Title, Text } = Typography;

const ForgotPasswordEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await otpService.sendOtp({
        email: values.email,
        purpose: 'RESET_PASSWORD'
      });

      if (response.success) {
        message.success(response.message);
        navigate('/forgot-password/verify', { 
          state: { email: values.email, purpose: 'RESET_PASSWORD' } 
        });
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send OTP');
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
              Forgot Password
            </Title>
            <Text type="secondary">
              Enter your email to receive an OTP
            </Text>
          </div>

          <Form
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
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
                Send OTP
              </Button>
            </Form.Item>
          </Form>

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

export default ForgotPasswordEmail;