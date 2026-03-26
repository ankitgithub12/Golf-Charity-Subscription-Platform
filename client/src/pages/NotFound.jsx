import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page container section animate-fade-in">
      <div className="not-found-content glass-card">
        <motion.div 
          className="golf-animation"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="hole">
            <div className="flag-pole">
                <Flag size={24} className="flag-icon" />
            </div>
          </div>
          <div className="ball-bunker">
            <div className="golf-ball"></div>
          </div>
        </motion.div>

        <h1 className="error-code">404</h1>
        <h2>Oops! You're Out of Bounds.</h2>
        <p>It looks like your shot landed in the deep rough. Even the best pros lose their way sometimes.</p>
        
        <div className="actions">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} /> Take a Mulligan (Back Home)
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .not-found-content {
          max-width: 600px;
          padding: 4rem !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .golf-animation {
          position: relative;
          width: 200px;
          height: 120px;
          margin-bottom: 2rem;
        }
        .hole {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 15px;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
        }
        .flag-pole {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 4px;
          height: 80px;
          background: #94a3b8;
        }
        .flag-icon {
          position: absolute;
          top: 0;
          left: 4px;
          color: var(--error);
        }
        .ball-bunker {
          position: absolute;
          bottom: 0;
          left: 80%;
          width: 80px;
          height: 40px;
          background: #fde68a;
          border-radius: 40px 40px 10px 10px;
          opacity: 0.8;
          z-index: -1;
        }
        .golf-ball {
          position: absolute;
          bottom: 10px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          box-shadow: inset -2px -2px 2px rgba(0,0,0,0.1);
        }
        
        .error-code {
          font-size: 6rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          line-height: 1;
        }
        h2 { font-size: 2rem; margin: 0; }
        p { color: var(--text-muted); font-size: 1.125rem; line-height: 1.6; }
        
        .actions { margin-top: 2rem; }
      `}</style>
    </div>
  );
};

export default NotFound;
