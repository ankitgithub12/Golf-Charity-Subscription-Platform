import React from 'react';
import { Trophy, ArrowUpRight, Award, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const WinningsCard = ({ winnings = [] }) => {
  return (
    <div className="winnings-cabinet animate-fade-in">
      <div className="cabinet-header">
        <div className="header-left">
          <div className="trophy-glow">
            <Trophy size={24} className="icon-gold" />
          </div>
          <h3>My Winnings</h3>
        </div>
        {winnings.length > 0 && (
          <span className="win-count badge-gold">{winnings.length} Prizes Won</span>
        )}
      </div>

      <div className="cabinet-grid">
        {winnings.length > 0 ? (
          winnings.map((win, i) => (
            <div key={win._id} className="win-entry glass-card premium-border" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="win-top">
                <div className="tier-badge">
                   <Award size={14} />
                   <span>{win.matchType} Matches</span>
                </div>
                <div className={`status-pill ${win.payoutStatus === 'paid' ? 'paid' : 'pending'}`}>
                   {win.payoutStatus === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                   {win.payoutStatus === 'paid' ? 'Paid' : 'Pending'}
                </div>
              </div>
              
              <div className="win-main">
                <div className="prize-label">Prize Amount</div>
                <div className="prize-val shimmer-text">{formatCurrency(win.prizeAmount)}</div>
              </div>

              <div className="win-footer">
                <span className="win-date">{formatDate(win.createdAt)}</span>
                {win.payoutStatus !== 'paid' && win.verificationStatus === 'pending' && !win.proofUrl ? (
                  <Link to={`/winnings/${win._id}/upload`} className="claim-btn">
                    Claim Prize <ArrowUpRight size={14} />
                  </Link>
                ) : (
                  <span className="verified-note">Verified</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="cabinet-empty">
            <Trophy size={48} className="empty-icon" />
            <p>Your prize cabinet is empty. Keep playing to win!</p>
            <Link to="/draws" className="view-draws-link">View latest draws <ExternalLink size={14} /></Link>
          </div>
        )}
      </div>

      <style>{`
        .winnings-cabinet {
          margin-bottom: 2rem;
        }
        .cabinet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .header-left h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
        
        .trophy-glow {
          width: 44px;
          height: 44px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
        }
        .icon-gold { color: var(--accent); }
        
        .badge-gold {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent);
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .cabinet-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        
        .win-entry {
          padding: 1.5rem !important;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
          position: relative;
          overflow: hidden;
        }
        .premium-border {
          border-left: 4px solid var(--accent) !important;
        }
        
        .win-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .tier-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }
        .status-pill.paid { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
        .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
        
        .win-main { margin-bottom: 1.5rem; }
        .prize-label { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem; font-weight: 600; }
        .prize-val {
          font-size: 2rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        
        .win-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid var(--glass-border);
        }
        .win-date { font-size: 0.75rem; color: var(--text-dim); }
        .verified-note { font-size: 0.75rem; color: var(--primary); font-weight: 700; }
        
        .claim-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          transition: 0.2s;
        }
        .claim-btn:hover { transform: translateX(3px); color: var(--primary-light); }
        
        .cabinet-empty {
          padding: 3rem;
          text-align: center;
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px dashed var(--glass-border);
        }
        .empty-icon { color: var(--text-dim); opacity: 0.2; margin-bottom: 1.5rem; }
        .cabinet-empty p { color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 1rem; }
        .view-draws-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          color: var(--primary);
          font-size: 0.8125rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default WinningsCard;
