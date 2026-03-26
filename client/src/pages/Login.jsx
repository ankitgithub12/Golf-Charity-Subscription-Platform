import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      if (res.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container auth-inner">
        <div className="auth-card glass-card animate-fade-in">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Enter your details to access your platform dashboard.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="forgot-link-wrap">
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : <>Login to Dashboard <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one for free</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
          text-align: center;
        }
        .auth-header {
          margin-bottom: 2.5rem;
        }
        .auth-header h2 {
          font-size: 2rem;
        }
        .auth-header p {
          color: var(--text-muted);
        }
        .auth-form {
          text-align: left;
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .input-with-icon .form-input {
          padding-left: 3rem;
        }
        .btn-full {
          width: 100%;
          margin-top: 1rem;
        }
        .forgot-link-wrap {
          text-align: right;
          margin-top: 0.25rem;
        }
        .forgot-link {
          font-size: 0.875rem;
          color: var(--primary);
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 0.75; }
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: var(--transition);
        }
        .password-toggle:hover {
          color: var(--primary);
        }
        .auth-footer {
          margin-top: 2rem;
          color: var(--text-muted);
          font-size: 0.9375rem;
        }
        .auth-footer a {
          color: var(--primary);
          font-weight: 600;
        }
        .animate-spin {
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
