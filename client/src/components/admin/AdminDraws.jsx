import React, { useState, useEffect } from 'react';
import { Trophy, Play, Send, AlertTriangle, Loader, CheckCircle, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDraws = () => {
  const [latestDraw, setLatestDraw] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          api.get('/draws/latest'),
          api.get('/draws')
        ]);
        setLatestDraw(latestRes.data.draw);
        setHistory(historyRes.data.draws);
      } catch (err) {
        console.error("Draw data error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async (type) => {
    try {
      setProcessing(true);
      const monthStr = new Date().toISOString().slice(0, 7);
      const res = await api.post('/draws/generate', { drawType: type, month: monthStr });
      setLatestDraw(res.data.draw);
      toast.success(`${type === 'random' ? 'Random' : 'Algorithmic'} draw generated as draft.`);
      setSimResults(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate draw");
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulate = async () => {
    if (!latestDraw) return;
    try {
      setProcessing(true);
      const res = await api.post('/draws/simulate', { drawId: latestDraw._id });
      setSimResults(res.data.simulation);
      toast.success("Simulation complete.");
    } catch (err) {
      toast.error("Simulation failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!latestDraw || !window.confirm("ARE YOU SURE? This will finalize winners, distribute prize pools, and notify users. This cannot be undone.")) return;
    try {
      setProcessing(true);
      await api.post(`/draws/${latestDraw._id}/publish`);
      toast.success("DRAW PUBLISHED SUCCESSFULLY!");
      setSimResults(null);
      // Refresh
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Critical error publishing draw");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-state"><Loader className="animate-spin" /></div>;

  const isDraft = latestDraw?.status === 'draft';

  return (
    <div className="admin-draws animate-fade-in">
      <div className="draw-workflow">
        {/* Step 1: Generation */}
        <section className="workflow-card glass-card">
          <div className="card-badge">Step 1</div>
          <h3>Generate New Draw</h3>
          <p>Create a draft draw for the current month ({new Date().toISOString().slice(0, 7)}).</p>
          <div className="btn-group">
            <button className="btn btn-secondary" disabled={processing} onClick={() => handleGenerate('random')}>
              Random (Pure Luck)
            </button>
            <button className="btn btn-primary" disabled={processing} onClick={() => handleGenerate('algorithm')}>
              Weighted Algorithm
            </button>
          </div>
          <p className="note">Weighted algorithm prioritizes active players and rolls over under-subscribed tiers.</p>
        </section>

        {/* Step 2: Simulation */}
        <section className={`workflow-card glass-card ${!isDraft ? 'disabled' : ''}`}>
          <div className="card-badge">Step 2</div>
          <h3>Simulate Results</h3>
          <p>Test the generated numbers against current subscriber scores to see the winner distribution.</p>
          <button className="btn btn-secondary btn-full" disabled={processing || !isDraft} onClick={handleSimulate}>
            {processing ? <Loader className="animate-spin" /> : <><Play size={16} /> Run Simulation</>}
          </button>
          
          {simResults && (
            <div className="sim-results animate-fade-in">
              <div className="sim-stat"><span>5 Matches:</span> <strong>{simResults.tier5Count}</strong></div>
              <div className="sim-stat"><span>4 Matches:</span> <strong>{simResults.tier4Count}</strong></div>
              <div className="sim-stat"><span>3 Matches:</span> <strong>{simResults.tier3Count}</strong></div>
              <div className="sim-stat"><span>Total Participants:</span> <strong>{simResults.participantCount}</strong></div>
              <div className="sim-pool">Expected Pool: ₹{(simResults.totalPool / 100).toFixed(2)}</div>
            </div>
          )}
        </section>

        {/* Step 3: Publish */}
        <section className={`workflow-card glass-card highlight ${!isDraft ? 'disabled' : ''}`}>
          <div className="card-badge">Step 3</div>
          <h3>Publish & Finalize</h3>
          <p>Commit results to the blockchain (simulated), create winner records, and announce publicly.</p>
          <button className="btn btn-primary btn-full btn-danger" disabled={processing || !isDraft} onClick={handlePublish}>
            <Send size={16} /> PUBLISH DRAW
          </button>
          <div className="warning">
            <AlertTriangle size={14} /> DANGER: Irreversibly updates all user balances and pools.
          </div>
        </section>
      </div>

      <div className="draw-history-table glass-card">
        <h4>Publication History</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Type</th>
                <th>Numbers</th>
                <th>Participants</th>
                <th>Winners</th>
                <th>Pool</th>
                <th>Audit Trail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(draw => (
                <tr key={draw._id}>
                  <td><strong>{draw.month}</strong></td>
                  <td><span className="capitalize">{draw.drawType}</span></td>
                  <td><div className="num-row">{draw.numbers.map(n => <span key={n}>{n}</span>)}</div></td>
                  <td>{draw.pool?.subscriberCount || 0}</td>
                  <td>{(draw.results?.fiveMatch?.length || 0) + (draw.results?.fourMatch?.length || 0) + (draw.results?.threeMatch?.length || 0)}</td>
                  <td>₹{(draw.results?.totalPool / 100 || 0).toFixed(0)}</td>
                  <td>
                    {draw.blockchainHash ? (
                      <div className="audit-hash" title={draw.blockchainHash}>
                        <Shield size={12} className="text-primary" />
                        <span>{draw.blockchainHash.substring(0, 8)}...</span>
                      </div>
                    ) : <span className="text-dim">-</span>}
                  </td>
                  <td><span className={`status-pill ${draw.status}`}>{draw.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .draw-workflow { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
        .workflow-card { padding: 2rem !important; position: relative; }
        .workflow-card.disabled { opacity: 0.5; pointer-events: none; }
        .workflow-card.highlight { border-color: var(--error); border-width: 2px; }
        .card-badge { position: absolute; top: 1rem; right: 1rem; font-size: 0.6rem; font-weight: 800; background: var(--glass); padding: 0.2rem 0.5rem; border-radius: 4px; }
        
        .btn-group { display: flex; gap: 0.5rem; margin: 1.5rem 0; }
        .note { font-size: 0.75rem; color: var(--text-dim); }
        .warning { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; color: var(--error); font-size: 0.75rem; font-weight: 700; }
        
        .sim-results { margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .sim-stat { display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.25rem; }
        .sim-pool { margin-top: 0.75rem; border-top: 1px solid var(--glass-border); padding-top: 0.5rem; color: var(--primary); font-weight: 700; text-align: center; }

        .draw-history-table { padding: 2rem !important; }
        .draw-history-table h4 { margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); padding: 1rem; border-bottom: 1px solid var(--glass-border); }
        td { padding: 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--glass-border); }
        .num-row { display: flex; gap: 4px; }
        .num-row span { width: 20px; height: 20px; background: var(--glass); font-size: 0.65rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        .audit-hash { display: flex; align-items: center; gap: 0.4rem; font-family: monospace; font-size: 0.75rem; color: var(--text-dim); }
        .text-primary { color: var(--primary); }
        
        .status-pill.published { color: var(--primary); }
        .status-pill.draft { color: var(--accent); }
        
        .btn-danger:hover { background-color: var(--error) !important; color: white !important; }
        
        @media (max-width: 1200px) { .draw-workflow { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminDraws;
