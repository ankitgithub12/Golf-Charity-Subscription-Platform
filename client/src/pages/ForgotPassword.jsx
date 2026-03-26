import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/auth/forgotpassword', { email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container auth-inner">
        <div className="auth-card glass-card animate-fade-in">

          {!submitted ? (
            <>
              <div className="auth-header">
                <div className="fp-icon-wrapper">
                  <Mail size={32} />
                </div>
                <h2>Forgot Password?</h2>
                <p>No worries! Enter your registered email address and we'll send you a reset link.</p>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <Loader size={18} className="animate-spin" /> : 'Send Reset Link'}
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
              <h2>Check Your Inbox</h2>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                The link will expire in <strong>10 minutes</strong>.
              </p>
              <p className="success-note">Didn't receive it? Check your spam folder or try resending.</p>
              <button
                className="btn btn-outline"
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '1.5rem' }}
              >
                Resend Email
              </button>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/login" className="back-link">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
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
        .auth-header {
          margin-bottom: 2.5rem;
        }
        .fp-icon-wrapper {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #fff;
          box-shadow: 0 8px 24px rgba(var(--primary-rgb, 99, 102, 241), 0.35);
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
        .input-with-icon .form-input { padding-left: 3rem; }
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

        /* Success State */
        .success-state { padding: 0.5rem 0; }
        .success-icon {
          color: #22c55e;
          margin-bottom: 1.25rem;
          display: flex;
          justify-content: center;
        }
        .success-state h2 { font-size: 1.75rem; margin-bottom: 1rem; }
        .success-state p { color: var(--text-muted); margin-bottom: 0.5rem; }
        .success-state strong { color: var(--text); }
        .success-note { font-size: 0.875rem; }
        .btn-outline {
          background: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: var(--primary);
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
