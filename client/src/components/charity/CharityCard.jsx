import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronRight } from 'lucide-react';

const CharityCard = ({ charity }) => {
  return (
    <div className="charity-card glass-card hover-glow animate-fade-in">
      <div className="charity-card-visual">
        <div className="visual-overlay"></div>
        <Heart size={32} className="visual-icon" />
      </div>
      
      <div className="charity-card-body">
        <div className="category-row">
          <span className="category-badge capitalize">{charity.category}</span>
          <div className="impact-indicator">
            <span className="pulse"></span>
            High Impact
          </div>
        </div>
        
        <h3 className="charity-name">{charity.name}</h3>
        <p className="charity-desc line-clamp-3">{charity.description}</p>
        
        <div className="charity-stats-row">
          <div className="card-stat">
            <span className="stat-label">Supporters</span>
            <span className="stat-value">{charity.supporterCount || 0}</span>
          </div>
          <div className="card-stat">
            <span className="stat-label">Donated</span>
            <span className="stat-value text-primary">₹{(charity.totalDonations / 100 || 0).toFixed(0)}</span>
          </div>
        </div>

        <Link to={`/charities/${charity._id}`} className="btn btn-primary btn-full btn-sm">
          Support this Cause <ChevronRight size={16} />
        </Link>
      </div>

      <style>{`
        .charity-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: var(--transition);
        }
        .charity-card-visual {
          height: 120px;
          background: linear-gradient(135deg, var(--primary-dark), var(--bg-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .visual-overlay {
          position: absolute;
          inset: 0;
          background: url('https://www.transparenttextures.com/patterns/cubes.png');
          opacity: 0.1;
        }
        .visual-icon { color: var(--primary); z-index: 1; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5)); }
        
        .charity-card-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
        
        .category-row { display: flex; justify-content: space-between; align-items: center; }
        .category-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); background: var(--glass); padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid var(--glass-border); }
        
        .impact-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 700; color: var(--primary); }
        .pulse { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .charity-name { font-size: 1.25rem; margin: 0; }
        .charity-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; }
        
        .charity-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); }
        .card-stat { display: flex; flex-direction: column; gap: 0.25rem; }
        .stat-label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); font-weight: 700; }
        .stat-value { font-size: 1rem; font-weight: 800; }
        
        .btn-sm { padding: 0.75rem !important; font-size: 0.875rem !important; }
      `}</style>
    </div>
  );
};

export default CharityCard;
