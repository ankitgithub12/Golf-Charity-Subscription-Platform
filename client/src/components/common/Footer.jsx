import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Send, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-icon">⛳</span>
              <span className="logo-text">Golf<span>Hero</span></span>
            </Link>
            <p className="footer-tagline">
              Elevate your game while empowering communities. The world's first charity-driven golf subscription.
            </p>
            <div className="social-links">
              <a href="#"><Send size={20} /></a>
              <a href="#"><Globe size={20} /></a>
              <a href="#"><Mail size={20} /></a>
            </div>
          </div>
          
          <div className="footer-nav">
            <h4>Platform</h4>
            <Link to="/charities">Browse Charities</Link>
            <Link to="/draws">Latest Draws</Link>
            <Link to="/subscribe">Subscription Plans</Link>
          </div>
          
          <div className="footer-nav">
            <h4>Support</h4>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest draw results and charity news.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className="form-input" />
              <button className="btn btn-primary">Join</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GolfHero Platform. Built with <Heart size={14} className="heart-icon" /> for Digital Heroes.</p>
        </div>
      </div>
      <style>{`
        .footer {
          background: var(--bg-darker);
          border-top: 1px solid var(--glass-border);
          padding: 6rem 0 3rem;
          margin-top: 4rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        .footer-brand p {
          color: var(--text-muted);
          margin-top: 1.5rem;
          max-width: 300px;
        }
        .social-links {
          display: flex;
          gap: 1.5rem;
          margin-top: 2rem;
          color: var(--text-dim);
        }
        .social-links a:hover {
          color: var(--primary);
        }
        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer-nav h4, .footer-newsletter h4 {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }
        .footer-nav a {
          color: var(--text-muted);
          font-size: 0.9375rem;
        }
        .footer-nav a:hover {
          color: var(--primary);
        }
        .footer-newsletter p {
          color: var(--text-muted);
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
        }
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }
        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid var(--glass-border);
          text-align: center;
          color: var(--text-dim);
          font-size: 0.875rem;
        }
        .heart-icon {
          color: var(--error);
          display: inline;
          vertical-align: middle;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: 3rem; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
