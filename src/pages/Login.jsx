import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to reach or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-placeholder">V</div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage Vasista Man Power</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={20} className="icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vasista.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={20} className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <><Loader className="spin" size={20} /> Signing in...</>
            ) : (
              <><LogIn size={20} /> Sign In</>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-placeholder {
          width: 64px;
          height: 64px;
          background: #062b67;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          margin: 0 auto 16px;
        }

        .login-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .login-header p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff2f0;
          border: 1px solid #ffccc7;
          color: #ff4d4f;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .input-with-icon input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
        }

        .input-with-icon input:focus {
          border-color: #062b67;
          box-shadow: 0 0 0 4px rgba(6, 43, 103, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #062b67;
        }

        .input-with-icon input {
          padding-right: 44px;
        }

        .login-submit-btn {
          background: #062b67;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .login-submit-btn:hover {
          background: #041e4a;
          transform: translateY(-1px);
        }

        .login-submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
