import React from 'react';
import { Trophy, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const WinningsCard = ({ winnings = [] }) => {
  return (
    <div className="dashboard-card glass-card">
      <div className="card-header">
        <div className="icon-box warning"><Trophy size={20} /></div>
        <h3>My Winnings</h3>
      </div>
      <div className="winnings-list">
        {winnings.length > 0 ? (
          winnings.map(win => (
            <div key={win._id} className="winning-row">
              <div className="win-info">
                <span className="win-date">{formatDate(win.createdAt)}</span>
                <span className="win-tier">{win.matchType} Matches</span>
              </div>
              <div className="win-amount">{formatCurrency(win.prizeAmount)}</div>
              <div className="win-payout">
                {win.payoutStatus === 'paid' ? (
                  <span className="status-badge success">Paid</span>
                ) : win.verificationStatus === 'pending' && !win.proofUrl ? (
                  <Link to={`/winnings/${win._id}/upload`} className="btn-tiny">Upload Proof</Link>
                ) : (
                  <span className="status-badge warning">{win.verificationStatus}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">No winnings yet. Good luck for the next draw!</p>
        )}
      </div>
    </div>
  );
};

export default WinningsCard;
