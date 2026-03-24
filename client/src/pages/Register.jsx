import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Weak', color: '#ef4444', width: '33%', score };
    if (score <= 4) return { label: 'Medium', color: '#f59e0b', width: '66%', score };
    return { label: 'Strong', color: '#10b981', width: '100%', score };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created! Let\'s get started.');
      navigate('/subscribe');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container auth-inner">
        <div className="auth-layout">
          <div className="auth-benefit-side desktop">
            <span className="badge">Welcome to the Club</span>
            <h2>Join the elite community of <span className="highlight">Digital Golfers.</span></h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={20} className="icon" />
                <div>
                  <h4>Performance Tracking</h4>
                  <p>Our rolling 5-score logic keeps your game sharp.</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={20} className="icon" />
                <div>
                  <h4>Monthly Prize Pools</h4>
                  <p>Automatic entry into cash draws every month.</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={20} className="icon" />
                <div>
                  <h4>Charity First</h4>
                  <p>10% of your fee supports those in need.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-card glass-card animate-fade-in">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Start your subscription journey today.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

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
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
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
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar-bg">
                      <div className="strength-bar-fill" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label} Password</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="Repeat your password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <Loader className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 4rem 0;
        }
        .auth-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }
        .auth-benefit-side h2 {
          font-size: 2.5rem;
          margin-bottom: 3rem;
        }
        .highlight {
          color: var(--primary);
        }
        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .benefit-item {
          display: flex;
          gap: 1.5rem;
        }
        .benefit-item .icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        .benefit-item h4 {
          margin-bottom: 0.25rem;
          font-size: 1.125rem;
        }
        .benefit-item p {
          color: var(--text-muted);
          font-size: 0.9375rem;
        }
        
        .auth-card {
          width: 100%;
          max-width: 450px;
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
        .password-strength {
          margin-top: 0.5rem;
        }
        .strength-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }
        .strength-bar-fill {
          height: 100%;
          transition: var(--transition);
        }
        .strength-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-benefit-side { display: none; }
          .auth-card { margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default Register;
