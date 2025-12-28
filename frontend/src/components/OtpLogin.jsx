import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: "LOGIN" })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
        startCountdown();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      console.log('Login Response:', data);
      
      if (response.ok && data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login with OTP</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Enter your email"
            />
          </div>
          <button
            onClick={sendOtp}
            disabled={loading || !email}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label>Enter OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontSize: '18px' }}
              placeholder="000000"
            />
            <small style={{ color: '#666' }}>OTP sent to {email}</small>
          </div>
          
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            onClick={() => countdown === 0 ? sendOtp() : null}
            disabled={countdown > 0}
            style={{ 
              width: '100%', 
              padding: '8px', 
              backgroundColor: countdown > 0 ? '#6c757d' : '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Back to Password Login
        </button>
      </div>
    </div>
  );
};

export default OtpLogin;