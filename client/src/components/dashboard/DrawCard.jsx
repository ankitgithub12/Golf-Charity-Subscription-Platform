import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const DrawCard = ({ latestDraw }) => {
  return (
    <div className="side-card glass-card">
      <div className="side-card-header">
        <Calendar size={18} />
        <h4>Next Draw</h4>
      </div>
      {latestDraw ? (
        <div className="next-draw-msg">
          <p>The <strong>{latestDraw.month}</strong> draw results are out!</p>
          <Link to="/draws" className="sub-manage">View Results</Link>
        </div>
      ) : (
        <div className="next-draw-msg">
          <p>Draws are executed at the end of every month. Keep your scores updated!</p>
          <Link to="/draws" className="sub-manage">View History</Link>
        </div>
      )}
      
      <style>{`
        .side-card { padding: 1.5rem !important; }
        .side-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; color: var(--primary); }
        .side-card-header h4 { margin-bottom: 0; color: var(--text-main); font-size: 1rem; flex: 1; }
        .next-draw-msg p { font-size: 0.875rem; color: var(--text-muted); }
        .sub-manage { display: block; margin-top: 1.25rem; font-size: 0.8125rem; color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default DrawCard;
