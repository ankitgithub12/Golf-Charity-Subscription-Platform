import React from 'react';
import { Trophy, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const DrawCard = ({ latestDraw }) => {
  return (
    <div className="next-draw-premium glass-card animate-fade-in">
      <div className="draw-header">
        <Trophy size={18} className="icon-gold" />
        <h4>Next Draw</h4>
      </div>
      
      <div className="draw-main">
        <div className="jackpot-label">Projected Prize Pool</div>
        <div className="jackpot-amount gold-gradient-text">₹5,250.00</div>
        
        <div className="draw-meta">
          <div className="meta-item">
            <span className="label">Next Draw:</span>
            <span className="val">April 30, 2026</span>
          </div>
          <div className="meta-item">
            <span className="label">Entries:</span>
            <span className="val">1,248 Players</span>
          </div>
        </div>
      </div>

      <div className="draw-footer">
        <Link to="/draws" className="view-details-btn">
          View Draw Details <ArrowRight size={14} />
        </Link>
      </div>
      
      <style>{`
        .next-draw-premium {
          padding: 1.5rem !important;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(2, 6, 23, 0.9));
        }
        .draw-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .draw-header h4 { margin: 0; font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
        .icon-gold { color: var(--accent); }

        .draw-main { margin-bottom: 1.5rem; }
        .jackpot-label { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem; font-weight: 600; }
        .gold-gradient-text {
          font-size: 1.75rem;
          font-weight: 900;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.3));
        }
        
        .draw-meta { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .meta-item { display: flex; justify-content: space-between; font-size: 0.75rem; }
        .meta-item .label { color: var(--text-dim); }
        .meta-item .val { color: var(--text-main); font-weight: 700; }

        .draw-footer { border-top: 1px solid var(--glass-border); padding-top: 1rem; }
        .view-details-btn { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          font-size: 0.75rem; 
          color: var(--primary); 
          font-weight: 700; 
          text-decoration: none; 
          transition: 0.2s;
        }
        .view-details-btn:hover { transform: translateX(3px); color: var(--primary-light); }

      `}</style>
    </div>
  );
};

export default DrawCard;
