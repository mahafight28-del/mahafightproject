import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordOtp = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: "RESET_PASSWORD" })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
        setSuccess('OTP sent to your email');
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
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose: "RESET_PASSWORD" })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(3);
        setSuccess('OTP verified. Enter new password.');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: '000000', newPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Reset Password</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
          {success}
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
            {loading ? 'Sending...' : 'Send Reset OTP'}
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
            <small style={{ color: '#666' }}>Check your email for OTP</small>
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
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Enter new password"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Confirm new password"
            />
          </div>
          <button
            onClick={resetPassword}
            disabled={loading || !newPassword || !confirmPassword}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordOtp;