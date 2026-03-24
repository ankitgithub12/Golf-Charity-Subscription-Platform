import React, { useState, useEffect } from 'react';
import { ShieldCheck, IndianRupee, ExternalLink, Check, X, Loader, User, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await api.get('/winners');
      setWinners(res.data.winners);
    } catch (err) {
      toast.error("Failed to load winners");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      setProcessingId(id);
      await api.put(`/winners/${id}/verify`, { status });
      setWinners(winners.map(w => w._id === id ? { ...w, verificationStatus: status } : w));
      toast.success(`Winner ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePayout = async (id) => {
    try {
      setProcessingId(id);
      await api.put(`/winners/${id}/payout`, { status: 'paid' });
      setWinners(winners.map(w => w._id === id ? { ...w, payoutStatus: 'paid' } : w));
      toast.success("Marked as paid");
    } catch (err) {
      toast.error("Failed to update payout");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading-state h-60"><Loader className="animate-spin" /></div>;

  return (
    <div className="admin-winners animate-fade-in">
      <div className="table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Winner</th>
              <th>Prize</th>
              <th>Tier</th>
              <th>Verification</th>
              <th>Payout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {winners.map(win => (
              <tr key={win._id}>
                <td>
                  <div className="user-cell">
                    <User size={16} className="text-dim" />
                    <div>
                      <div className="user-name">{win.userId?.name}</div>
                      <div className="user-email text-xs">{win.userId?.email}</div>
                    </div>
                  </div>
                </td>
                <td><strong className="text-primary">₹{(win.prizeAmount / 100).toFixed(2)}</strong></td>
                <td>{win.matchType} Matches</td>
                <td>
                  <span className={`status-pill ${win.verificationStatus}`}>
                    {win.verificationStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${win.payoutStatus}`}>
                    {win.payoutStatus}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {win.proofUrl && (
                      <a href={win.proofUrl} target="_blank" rel="noopener noreferrer" className="icon-btn" title="View Proof">
                        <Eye size={16} />
                      </a>
                    )}
                    
                    {win.verificationStatus === 'pending' && (
                      <>
                        <button 
                          className="icon-btn success" 
                          onClick={() => handleVerify(win._id, 'approved')}
                          disabled={processingId === win._id}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleVerify(win._id, 'rejected')}
                          disabled={processingId === win._id}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}

                    {win.verificationStatus === 'approved' && win.payoutStatus === 'pending' && (
                      <button 
                        className="btn btn-secondary btn-xs" 
                        onClick={() => handlePayout(win._id)}
                        disabled={processingId === win._id}
                      >
                         <IndianRupee size={14} /> Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {winners.length === 0 && <p className="empty-msg">No winners recorded yet.</p>}
      </div>

      <style>{`
        .table-wrapper { padding: 0 !important; overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1rem 1.5rem; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; border-bottom: 1px solid var(--glass-border); }
        td { padding: 1.25rem 1.5rem; font-size: 0.875rem; border-bottom: 1px solid var(--glass-border); }
        
        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .text-xs { font-size: 0.75rem; color: var(--text-dim); }
        
        .status-pill { font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 4px; text-transform: uppercase; font-weight: 700; background: var(--glass); }
        .status-pill.approved, .status-pill.paid { color: var(--primary); background: rgba(16, 185, 129, 0.1); }
        .status-pill.pending { color: var(--accent); background: rgba(245, 158, 11, 0.1); }
        .status-pill.rejected { color: var(--error); background: rgba(239, 68, 68, 0.1); }
        
        .action-btns { display: flex; gap: 0.5rem; align-items: center; }
        .icon-btn.success:hover { color: var(--primary); }
        .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
        .empty-msg { padding: 4rem; text-align: center; color: var(--text-dim); }
      `}</style>
    </div>
  );
};

export default AdminWinners;
