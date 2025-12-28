import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import OtpLogin from './components/OtpLogin';
import ForgotPasswordOtp from './components/ForgotPasswordOtp';

// Simple Login component
const Login = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h2>Login</h2>
      <div style={{ marginBottom: '20px' }}>
        <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', margin: '5px 0' }} />
        <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', margin: '5px 0' }} />
        <button style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Login
        </button>
      </div>
      <div>
        <button 
          onClick={() => navigate('/otp-login')}
          style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer', marginRight: '20px' }}
        >
          Login with OTP
        </button>
        <button 
          onClick={() => navigate('/forgot-password')}
          style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

// Simple Dashboard component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h2>Dashboard</h2>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Welcome, {user.firstName || 'User'}!</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Token:</strong> {token?.substring(0, 20)}...</p>
      </div>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/forgot-password" element={<ForgotPasswordOtp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;