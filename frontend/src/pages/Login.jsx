import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [hn, setHn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(hn, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
            <img src="/logo.png" alt="Hospital Logo" className="login-logo"/>
            <h2>หน่วยเคมีบำบัด โรงพยาบาลสงฆ์</h2>
            <p>กรุณาลงชื่อเข้าใช้เพื่อเข้าสู่ระบบ</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="hn">HN หรือ Username</label>
            <input
              type="text"
              id="hn"
              value={hn}
              onChange={(e) => setHn(e.target.value)}
              placeholder="กรอก HN หรือ Username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>
          <button type="submit" className="login-button">ลงชื่อเข้าใช้</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 