import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, IndianRupee, ChevronRight, Loader, Info } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const DrawResults = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const res = await api.get('/draws/public');
        setDraws(res.data.draws);
      } catch (err) {
        console.error('Error fetching draws', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDraws();
  }, []);

  if (loading) return <div className="loading-state h-80"><Loader className="animate-spin" /></div>;

  return (
    <div className="draw-results container section animate-fade-in">
      <div className="section-header">
        <span className="badge">Draw History</span>
        <h2>Transparency & Results</h2>
        <p>View the winning numbers, prize distributions, and jackpot rollovers from our past monthly draws.</p>
      </div>

      <div className="latest-draw-hero glass-card">
        {draws.length > 0 ? (
          <div className="draw-hero-content">
            <div className="hero-draw-info">
              <span className="current-month">Latest: {draws[0].month}</span>
              <div className="winning-numbers">
                {draws[0].numbers.map((num, i) => (
                  <motion.div 
                    key={i} 
                    className="ball"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hero-draw-stats">
              <div className="h-stat">
                <Users size={18} />
                <div>
                  <span className="label">Participants</span>
                  <span className="val">{draws[0].pool?.subscriberCount || 0}</span>
                </div>
              </div>
              <div className="h-stat">
                <IndianRupee size={18} />
                <div>
                  <span className="label">Total Pool</span>
                  <span className="val">₹{((draws[0].pool?.totalPool || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
              {draws[0].jackpotCarriedOver && (
                <div className="jackpot-alert">
                  <Trophy size={14} /> Jackpot Rolled Over!
                </div>
              )}
              {draws[0].blockchainHash && (
                <div className="blockchain-badge" title={draws[0].blockchainHash}>
                  <Shield size={14} /> <span>Verified Hash: {draws[0].blockchainHash.substring(0, 12)}...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-draws">
            <Info size={40} />
            <p>Our first draw is scheduled for the end of this month. Join now to participate!</p>
          </div>
        )}
      </div>

      <div className="draw-history-grid">
        {draws.slice(1).map((draw, i) => (
          <div key={draw._id} className="draw-row glass-card">
            <div className="row-date">
              <Calendar size={18} />
              <span>{draw.month}</span>
            </div>
            <div className="row-numbers">
              {draw.numbers.map((n, j) => <span key={j} className="mini-ball">{n}</span>)}
            </div>
            <div className="row-stats">
              <span className="row-pool">₹{((draw.pool?.totalPool || 0) / 100).toFixed(0)}</span>
              {draw.blockchainHash && <span className="row-hash">Hash: {draw.blockchainHash.substring(0, 8)}...</span>}
              <span className="row-participants">{draw.pool?.subscriberCount || 0} Participants</span>
              <span className="row-winners">{draw.results?.fiveMatch?.length || 0} Jackpots</span>
            </div>
            <ChevronRight className="row-arrow" size={18} />
          </div>
        ))}
      </div>

      <style>{`
        .latest-draw-hero {
          padding: 4rem !important;
          margin-bottom: 4rem;
          background: linear-gradient(135deg, var(--card-bg), rgba(16, 185, 129, 0.1));
          border-color: var(--primary);
        }
        .draw-hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4rem;
        }
        .current-month {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary);
          display: block;
          margin-bottom: 2rem;
        }
        .winning-numbers {
          display: flex;
          gap: 1.5rem;
        }
        .ball {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle at 30% 30%, var(--primary-light), var(--primary-dark));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.75rem;
          font-weight: 900;
          box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        }
        .hero-draw-stats {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .h-stat {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-dim);
        }
        .h-stat .label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .h-stat .val { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
        .jackpot-alert {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .draw-history-grid { display: flex; flex-direction: column; gap: 1rem; }
        .draw-row {
          display: grid;
          grid-template-columns: 180px 1fr 200px 40px;
          align-items: center;
          padding: 1.25rem 2rem !important;
          transition: var(--transition);
        }
        .draw-row:hover { transform: translateX(5px); border-color: var(--primary); }
        .row-date { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; }
        .row-numbers { display: flex; gap: 0.5rem; justify-content: center; }
        .mini-ball {
          width: 32px;
          height: 32px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .row-stats { display: flex; flex-direction: column; align-items: flex-end; }
        .row-pool { font-weight: 800; color: var(--primary); }
        .row-hash { font-size: 0.65rem; color: var(--text-dim); font-family: monospace; letter-spacing: 0.05em; margin: 0.25rem 0; }
        .row-participants { font-size: 0.75rem; color: var(--text-muted); }
        .row-winners { font-size: 0.75rem; color: var(--text-dim); }
        .row-arrow { color: var(--text-dim); }

        .blockchain-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 4px;
          border: 1px solid rgba(16, 185, 129, 0.15);
          margin-top: 1rem;
        }

        .no-draws { text-align: center; color: var(--text-dim); }
        .no-draws p { margin-top: 1rem; font-size: 1.125rem; }

        @media (max-width: 1024px) {
          .draw-hero-content { flex-direction: column; gap: 3rem; text-align: center; }
          .winning-numbers { justify-content: center; }
          .draw-row { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .row-numbers { grid-row: 2; grid-column: 1 / span 2; }
          .row-stats { align-items: flex-start; }
          .row-arrow { display: none; }
        }
      `}</style>
    </div>
  );
};

export default DrawResults;
