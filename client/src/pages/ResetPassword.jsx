import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Lock, Eye, EyeOff, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password: formData.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Weak', color: '#ef4444', pct: 33 };
    if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
      return { label: 'Fair', color: '#f59e0b', pct: 66 };
    return { label: 'Strong', color: '#22c55e', pct: 100 };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="container auth-inner">
        <div className="auth-card glass-card animate-fade-in">

          {!success ? (
            <>
              <div className="auth-header">
                <div className="rp-icon-wrapper">
                  <Lock size={32} />
                </div>
                <h2>Reset Password</h2>
                <p>Choose a strong new password for your account.</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 8 characters"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {strength && (
                    <div className="strength-bar-wrap">
                      <div
                        className="strength-bar"
                        style={{ width: `${strength.pct}%`, background: strength.color }}
                      />
                      <span className="strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Repeat your password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="match-error">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <Loader size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>

              <p className="auth-footer">
                <Link to="/login" className="back-link">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </p>
            </>
          ) : (
            <div className="success-state">
              <div className="success-icon">
                <CheckCircle size={56} />
              </div>
              <h2>Password Reset!</h2>
              <p>Your password has been updated successfully.</p>
              <p className="success-note">Redirecting you to login in 3 seconds…</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          )}
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
          max-width: 460px;
          margin: 0 auto;
          text-align: center;
        }
        .auth-header { margin-bottom: 2.5rem; }
        .rp-icon-wrapper {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #fff;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
        }
        .auth-header h2 { font-size: 2rem; margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-muted); }
        .auth-form { text-align: left; }
        .input-with-icon { position: relative; }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .input-with-icon .form-input {
          padding-left: 3rem;
          padding-right: 3rem;
        }
        .toggle-visibility {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-dim);
          padding: 0;
          display: flex;
          align-items: center;
        }
        .toggle-visibility:hover { color: var(--primary); }
        .strength-bar-wrap {
          margin-top: 0.5rem;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          height: 4px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .strength-bar {
          height: 4px;
          border-radius: 4px;
          transition: width 0.3s, background 0.3s;
        }
        .strength-label {
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .match-error {
          font-size: 0.8125rem;
          color: #ef4444;
          margin-top: 0.4rem;
        }
        .btn-full { width: 100%; margin-top: 1rem; }
        .auth-footer {
          margin-top: 1.75rem;
          color: var(--text-muted);
          font-size: 0.9375rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .back-link:hover { opacity: 0.75; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .success-state { padding: 0.5rem 0; }
        .success-icon { color: #22c55e; margin-bottom: 1.25rem; display: flex; justify-content: center; }
        .success-state h2 { font-size: 1.75rem; margin-bottom: 1rem; }
        .success-state p { color: var(--text-muted); margin-bottom: 0.5rem; }
        .success-note { font-size: 0.875rem; }
      `}</style>
    </div>
  );
};

export default ResetPassword;
