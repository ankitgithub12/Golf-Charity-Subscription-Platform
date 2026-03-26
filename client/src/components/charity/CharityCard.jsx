import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronRight, Users, Target, Star } from 'lucide-react';

const CharityCard = ({ charity }) => {
  return (
    <div className={`charity-card glass-card hover-glow animate-fade-in ${charity.featured ? 'featured-spotlight' : ''}`}>
      <div className="charity-card-visual-wrapper">
        <div className="charity-card-visual" style={charity.coverImage ? { backgroundImage: `url(${charity.coverImage})` } : {}}>
          <div className="visual-overlay"></div>
          {!charity.coverImage && <Heart size={36} className="visual-icon" />}
          
          {charity.featured && (
            <div className="featured-badge">
              <Star size={12} fill="currentColor" />
              <span>Recommended Cause</span>
            </div>
          )}
          
          <div className="category-tag capitalize">{charity.category}</div>
        </div>
      </div>
      
      <div className="charity-card-body">
        <div className="body-header">
          <h3 className="charity-name">{charity.name}</h3>
          <div className="impact-indicator">
            <span className="pulse"></span>
            Active
          </div>
        </div>
        
        <p className="charity-desc line-clamp-2">{charity.shortDescription || charity.description}</p>
        
        <div className="charity-stats-row">
          <div className="card-stat">
            <div className="stat-icon-wrapper">
              <Users size={14} />
            </div>
            <div>
              <span className="stat-label">Community</span>
              <span className="stat-value">{charity.supporterCount || 0} supporters</span>
            </div>
          </div>
          <div className="card-stat">
            <div className="stat-icon-wrapper highlight">
              <Target size={14} />
            </div>
            <div>
              <span className="stat-label">Impact Total</span>
              <span className="stat-value">₹{(charity.totalDonations / 100 || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Link to={`/charities/${charity._id}`} className="btn btn-primary btn-full btn-premium">
          <span>Support this Cause</span>
          <div className="btn-icon">
            <ChevronRight size={18} />
          </div>
        </Link>
      </div>

      <style>{`
        .charity-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: var(--transition);
          position: relative;
        }
        .charity-card:hover { transform: translateY(-8px); border-color: var(--primary); }
        .featured-spotlight { border: 1px solid rgba(245, 158, 11, 0.4); box-shadow: 0 0 20px rgba(245, 158, 11, 0.1); }

        .charity-card-visual-wrapper {
          height: 180px;
          overflow: hidden;
          position: relative;
        }
        .charity-card-visual {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary-dark), var(--bg-dark));
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .charity-card:hover .charity-card-visual { transform: scale(1.1); }

        .visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,41,0) 100%);
        }
        
        .featured-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(245, 158, 11, 0.2);
          backdrop-filter: blur(4px);
          color: var(--accent);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(245, 158, 11, 0.3);
          z-index: 2;
        }

        .category-tag {
          position: absolute;
          bottom: 1rem;
          left: 1.25rem;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: white;
          background: var(--primary);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          z-index: 2;
        }
        
        .charity-card-body { padding: 1.5rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
        
        .body-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .charity-name { font-size: 1.35rem; margin: 0; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
        
        .impact-indicator { display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; }
        .pulse { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); animation: pulse 2s infinite; }
        
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .charity-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; min-height: 2.5rem; }
        
        .charity-stats-row { 
          display: flex; 
          flex-direction: column; 
          gap: 0.75rem; 
          padding: 1rem 0; 
          border-top: 1px solid var(--glass-border); 
        }
        .card-stat { display: flex; align-items: center; gap: 1rem; }
        .stat-icon-wrapper { 
          width: 32px; 
          height: 32px; 
          background: rgba(255,255,255,0.03); 
          border: 1px solid var(--glass-border); 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: var(--text-dim);
        }
        .stat-icon-wrapper.highlight { color: var(--primary); border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); }
        .stat-label { display: block; font-size: 0.6rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; margin-bottom: 0.1rem; }
        .stat-value { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
        
        .btn-premium { 
          display: flex; 
          justify-content: space-between !important; 
          align-items: center; 
          padding: 0.6rem 1rem !important;
          background: linear-gradient(135deg, var(--primary), #10b981) !important;
          border: none !important;
          overflow: hidden;
          position: relative;
        }
        .btn-premium:hover { transform: scale(1.02); }
        .btn-icon { 
          background: rgba(0,0,0,0.15); 
          width: 28px; 
          height: 28px; 
          border-radius: 6px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-right: -0.25rem;
        }
      `}</style>
    </div>
  );
};

export default CharityCard;
