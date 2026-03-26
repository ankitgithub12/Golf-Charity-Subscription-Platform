import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Clock, ExternalLink, ShieldCheck, XCircle, Search, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await api.get('/admin/winners');
      setWinners(res.data.winners);
    } catch (err) {
      toast.error("Failed to fetch winners");
    } finally {
      setLoading(false);
    }
  };

  const updatePayout = async (id, data) => {
    setUpdating(id);
    try {
      await api.put(`/admin/winners/${id}/payout`, data);
      toast.success("Winner status updated");
      fetchWinners();
      if (selectedWinner?._id === id) setSelectedWinner(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setUpdating(null);
    }
  };

  const filteredWinners = winners.filter(w => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && w.payoutStatus === 'pending') || 
                         (filter === 'paid' && w.payoutStatus === 'paid') ||
                         (filter === 'verification_pending' && w.verificationStatus === 'pending');
    
    const matchesSearch = w.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.drawId?.month.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center"><Clock className="animate-spin inline mr-2" /> Loading winner records...</div>;

  return (
    <div className="admin-winners animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Winner Payouts</h2>
          <p className="subtitle">Manage prize claims and bank transfers</p>
        </div>
        <div className="header-stats">
          <div className="h-stat">
            <span className="label">Pending Claims</span>
            <span className="value">{winners.filter(w => w.payoutStatus === 'pending').length}</span>
          </div>
          <div className="h-stat highlight">
            <span className="label">Total Paid (INR)</span>
            <span className="value">₹{(winners.filter(w => w.payoutStatus === 'paid').reduce((acc, w) => acc + w.prizeAmount, 0) / 100).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or month..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending Payout</button>
          <button className={filter === 'verification_pending' ? 'active' : ''} onClick={() => setFilter('verification_pending')}>Unverified</button>
          <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>Paid</button>
        </div>
      </div>

      <div className="table-container glass-card">
        <table>
          <thead>
            <tr>
              <th>User / Player</th>
              <th>Draw</th>
              <th>Tier</th>
              <th>Prize (INR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWinners.map(winner => (
              <tr key={winner._id}>
                <td>
                  <div className="user-info">
                    <strong>{winner.userId?.name}</strong>
                    <span className="email">{winner.userId?.email}</span>
                  </div>
                </td>
                <td>{winner.drawId?.month} {winner.drawId?.year}</td>
                <td><span className={`match-badge ${winner.matchType}`}>{winner.matchType}</span></td>
                <td><strong className="text-primary">₹{(winner.prizeAmount / 100).toFixed(2)}</strong></td>
                <td>
                    <div className="status-cell">
                        <span className={`status-pill ${winner.verificationStatus}`}>Verify: {winner.verificationStatus}</span>
                        <span className={`status-pill ${winner.payoutStatus}`}>Payout: {winner.payoutStatus}</span>
                    </div>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" title="View Details" onClick={() => setSelectedWinner(winner)}>
                      <Eye size={18} />
                    </button>
                    {winner.payoutStatus === 'pending' && (
                      <button 
                        className="btn btn-sm btn-primary" 
                        disabled={updating === winner._id}
                        onClick={() => updatePayout(winner._id, { payoutStatus: 'paid', verificationStatus: 'approved' })}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredWinners.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row text-center py-8 text-dim">No records found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedWinner && (
        <div className="modal-overlay" onClick={() => setSelectedWinner(null)}>
          <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Winner Claim Details</h3>
              <button className="close-btn" onClick={() => setSelectedWinner(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Player Name</span>
                  <div className="val">{selectedWinner.userId?.name}</div>
                </div>
                <div className="detail-item">
                  <span className="label">Match Tier</span>
                  <div className="val"><span className={`match-badge ${selectedWinner.matchType}`}>{selectedWinner.matchType}</span></div>
                </div>
                <div className="detail-item">
                  <span className="label">Bank Details / UPI</span>
                  <div className="val bank-box">{selectedWinner.userId?.bankDetails || 'Not provided'}</div>
                </div>
                <div className="detail-item">
                  <span className="label">Prize Amount</span>
                  <div className="val text-primary font-bold">₹{(selectedWinner.prizeAmount / 100).toFixed(2)}</div>
                </div>
              </div>

              <div className="proof-section mt-6">
                <span className="label mb-2 block">Upload Evidence (Score Screenshot)</span>
                {selectedWinner.proofUrl ? (
                  <div className="proof-container">
                    <img src={selectedWinner.proofUrl} alt="Winner Proof" className="proof-img" />
                    <a href={selectedWinner.proofUrl} target="_blank" rel="noreferrer" className="zoom-link">
                      <ExternalLink size={14} /> View Large
                    </a>
                  </div>
                ) : (
                  <div className="no-proof-box">No screenshot uploaded yet.</div>
                )}
              </div>

              <div className="admin-actions mt-8">
                <div className="action-row">
                    <button 
                        className="btn btn-error" 
                        disabled={updating}
                        onClick={() => updatePayout(selectedWinner._id, { verificationStatus: 'rejected', payoutStatus: 'pending' })}
                    >
                        <XCircle size={18} /> Reject Claim
                    </button>
                    <button 
                        className="btn btn-primary" 
                        disabled={updating}
                        onClick={() => updatePayout(selectedWinner._id, { verificationStatus: 'approved', payoutStatus: 'paid' })}
                    >
                        <ShieldCheck size={18} /> Verify & Payout Complete
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-winners { padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
        .subtitle { color: var(--text-dim); font-size: 0.9rem; margin-top: 0.25rem; }
        
        .header-stats { display: flex; gap: 2rem; }
        .h-stat { display: flex; flex-direction: column; align-items: flex-end; }
        .h-stat .label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; }
        .h-stat .value { font-size: 1.5rem; font-weight: 900; }
        .h-stat.highlight .value { color: var(--primary); }

        .controls-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 2rem; }
        .search-box { flex: 1; position: relative; display: flex; align-items: center; padding: 0 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); }
        .search-box input { background: transparent; border: none; padding: 0.75rem; color: white; width: 100%; outline: none; }
        
        .filter-tabs { display: flex; gap: 0.5rem; background: var(--glass); padding: 0.25rem; border-radius: 8px; }
        .filter-tabs button { padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px; border: none; background: transparent; color: var(--text-dim); transition: 0.2s; }
        .filter-tabs button.active { background: var(--primary); color: white; }

        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 1.25rem 1rem; font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em; border-bottom: 1px solid var(--glass-border); }
        td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
        
        .user-info { display: flex; flex-direction: column; }
        .user-info .email { font-size: 0.75rem; color: var(--text-dim); }
        
        .match-badge { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.05); }
        .match-badge.5-match { background: #f59e0b22; color: #f59e0b; }
        
        .status-cell { display: flex; flex-direction: column; gap: 0.4rem; }
        .status-pill { font-size: 0.6rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid transparent; width: fit-content; text-transform: uppercase; }
        .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-pill.approved, .status-pill.paid { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
        .status-pill.rejected { background: rgba(239, 68, 68, 0.1); color: var(--error); }

        .actions { display: flex; gap: 0.75rem; align-items: center; }
        .btn-sm { padding: 0.5rem 0.75rem !important; font-size: 0.75rem !important; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.9); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { width: 100%; max-width: 600px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .close-btn { background: transparent; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .detail-item .label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); font-weight: 800; display: block; margin-bottom: 0.5rem; }
        .detail-item .val { font-size: 1.1rem; font-weight: 700; }
        
        .bank-box { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); font-family: monospace; font-size: 0.9rem !important; }
        
        .proof-container { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--glass-border); }
        .proof-img { width: 100%; height: auto; display: block; }
        .zoom-link { position: absolute; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.6); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.7rem; color: white; display: flex; align-items: center; gap: 0.4rem; backdrop-filter: blur(4px); }
        
        .action-row { display: flex; gap: 1rem; margin-top: 2rem; }
        .action-row button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800; }
      `}</style>
    </div>
  );
};

export default AdminWinners;
