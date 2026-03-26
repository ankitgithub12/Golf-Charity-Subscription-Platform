import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Trophy, Heart, CreditCard, ExternalLink, Loader, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { useScores } from '../hooks/useScores';
import api from '../services/api';
import toast from 'react-hot-toast';
import ScoreForm from '../components/dashboard/ScoreForm';
import WinningsCard from '../components/dashboard/WinningsCard';
import DrawCard from '../components/dashboard/DrawCard';
import ProfileModal from '../components/dashboard/ProfileModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import CountdownTimer from '../components/common/CountdownTimer';

const Dashboard = () => {
  const { user } = useAuth();
  const { scores, refresh: refreshScores } = useScores();
  const { subscription, loading: subLoading } = useContext(SubscriptionContext);
  const [loading, setLoading] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [editingScore, setEditingScore] = useState(null); // { _id, value, datePlayed, notes }
  const [showProfile, setShowProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latestDraw, setLatestDraw] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [newPct, setNewPct] = useState(user?.charityContributionPct || 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drawRes, winningsRes] = await Promise.all([
          api.get('/draws/latest'),
          api.get('/winners/my')
        ]);
        setLatestDraw(drawRes.data.draw);
        setWinnings(winningsRes.data.winners);
      } catch (err) {
        console.error("Dashboard metadata fetch error", err);
      }
    };
    fetchData();
  }, []);

  const handleScoreSubmit = async (scoreData) => {
    setSubmitting(true);
    try {
      await api.post('/scores', scoreData);
      refreshScores();
      setShowScoreForm(false);
      toast.success("Score added! Oldest score replaced.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add score");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateScore = async (scoreData) => {
    if (!editingScore) return;
    setSubmitting(true);
    try {
      await api.put(`/scores/${editingScore._id}`, scoreData);
      refreshScores();
      setEditingScore(null);
      toast.success('Score updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (id) => {
    if (!window.confirm("Delete this score?")) return;
    try {
      await api.delete(`/scores/${id}`);
      refreshScores();
      toast.success("Score removed");
    } catch (err) {
      toast.error("Failed to delete score");
    }
  };

  const handleUpdateContribution = async () => {
    setSubmitting(true);
    try {
      await api.post('/charities/select', { 
        charityId: user.selectedCharity._id, 
        charityContributionPct: newPct 
      });
      toast.success(`Contribution updated to ${newPct}%!`);
      setShowContributionModal(false);
      window.location.reload(); // Refresh to get updated user object
    } catch (err) {
      toast.error("Failed to update contribution");
    } finally {
      setSubmitting(false);
    }
  };

  if (subLoading) return <div className="loading-state h-80"><Loader className="animate-spin" /></div>;

  return (
    <div className="dashboard-page container section animate-fade-in">
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      <div className="dashboard-header">
        <div>
          <span className="badge">Welcome back, {user?.name.split(' ')[0]}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>Your Dashboard</h1>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowProfile(true)}>
              <Edit2 size={14} /> Profile Settings
            </button>
          </div>
        </div>
        <div className="dashboard-hero-stats">
          {/* Participation Card */}
          <div className="stat-card participation glass-card">
            <div className="stat-main">
              <div className="radial-progress-wrapper">
                <svg viewBox="0 0 36 36" className="radial-progress">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${(scores.length / 5) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="radial-content">
                  <span className="current">{scores.length}</span>
                  <span className="total">/5</span>
                </div>
              </div>
              <div className="stat-text">
                <h3>Draw Eligibility</h3>
                <p>{user?.role === 'admin' ? "Admin bypass active — you're eligible for all draws." : scores.length < 5 ? `Add ${5 - scores.length} more scores to enter.` : "You're all set for the next draw!"}</p>
              </div>
            </div>
          </div>

          {user?.role !== 'admin' && (
            <div className="stat-card impact glass-card highlight">
              <div className="stat-main">
                <div className="impact-meter">
                   <div className="liquid-container">
                      <div className="liquid" style={{ height: `${user?.charityContributionPct || 10}%` }}></div>
                   </div>
                   <Heart size={20} className="pulse-heart" />
                </div>
                <div className="stat-text">
                  <h3>Your Impact</h3>
                  <p>Contributing <strong className="text-primary">{user?.charityContributionPct || 10}%</strong> of sub fees to your charity.</p>
                  <div className="impact-val">{formatCurrency(user?.totalDonated || 0)} Donated</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Scores */}
        <div className="dash-main">
          <section className="dashboard-section glass-card">
            <div className="section-title">
              <div className="title-left">
                <Trophy size={20} />
                <h3>Your Latest Scores</h3>
                <span className="count-badge">{scores.length}/5</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowScoreForm(!showScoreForm); setEditingScore(null); }}
              >
                {showScoreForm || editingScore ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Score</>}
              </button>
            </div>

            {(showScoreForm || editingScore) && (
              <ScoreForm 
                onAdd={editingScore ? handleUpdateScore : handleScoreSubmit} 
                loading={submitting}
                initialValues={editingScore}
                isEditing={!!editingScore}
              />
            )}

            <div className="scores-grid">
              {scores.length > 0 ? scores.map((score, i) => (
                <div key={score._id} className="score-chip glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="chip-header">
                    <span className="hole-num">#{i + 1}</span>
                    <div className="chip-actions">
                      <button className="icon-btn" onClick={() => { setEditingScore(score); setShowScoreForm(false); }}><Edit2 size={12} /></button>
                      <button className="icon-btn delete" onClick={() => handleDeleteScore(score._id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="chip-body">
                    <span className={`val ${score.value >= 36 ? 'high' : score.value >= 30 ? 'mid' : 'low'}`}>{score.value}</span>
                  </div>
                  <div className="chip-footer">
                    <span>{formatDate(score.datePlayed)}</span>
                  </div>
                </div>
              )) : (
                <div className="empty-scores">
                  <AlertCircle size={32} />
                  <p>No scores entered yet. Add your first 5 scores to enter the draws.</p>
                </div>
              )}
              {scores.length === 5 && !showScoreForm && (
                <p className="score-limit-note">You've reached the 5-score limit. Adding a new one will replace the oldest.</p>
              )}
            </div>
          </section>

          <WinningsCard winnings={winnings} />
        </div>

          {/* Right Column: Sidebar */}
        <div className="dash-side">
          {/* Next Draw Countdown */}
          <CountdownTimer targetDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)} />

          {/* Premium Membership Card - Hidden for Admin */}
          {user?.role !== 'admin' && (
            <div className={`side-card membership-card ${user?.subscriptionStatus}`}>
              <div className="membership-overlay"></div>
              <div className="card-top">
                <div className="status-indicator">
                  {user?.subscriptionStatus === 'active' ? <Trophy size={20} className="icon-gold" /> : <CreditCard size={20} />}
                  <span className="membership-label">Digital Membership</span>
                </div>
                <span className={`status-pill ${user?.subscriptionStatus}`}>{user?.subscriptionStatus}</span>
              </div>
              
              {subscription ? (
                <div className="membership-body">
                  <div className="plan-name">{subscription?.planType} Plan</div>
                  <div className="validity-box">
                    <div className="validity-header">
                      <span>Account Validity</span>
                      <span className="date">{new Date(subscription?.currentPeriodEnd).toLocaleDateString()}</span>
                    </div>
                    <div className="validity-progress">
                      <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                    <p className="validity-note">Your access is secured until renewal.</p>
                  </div>
                  <Link to="/subscribe" className="manage-link">
                    Manage Subscription <ExternalLink size={12} />
                  </Link>
                </div>
              ) : (
                <div className="membership-empty">
                  <p>Unlock premium draws, higher prize pools, and community impact.</p>
                  <Link to="/subscribe" className="btn btn-primary btn-full mt-2">Activate Now</Link>
                </div>
              )}
            </div>
          )}

          {/* Participation Summary */}
          <div className="side-card participation-summary-card glass-card">
            <div className="side-card-header">
              <div className="icon-glow-alt">
                <Trophy size={18} />
              </div>
              <h4>Participation Summary</h4>
            </div>
            
            <div className="summary-stats-grid">
              <div className="summary-stat-item">
                <div className="stat-icon-wrap">
                  <Trophy size={16} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Draws Entered</span>
                  <span className="stat-value">{winnings?.length || 0}</span>
                </div>
              </div>
              
              <div className="summary-stat-item">
                <div className="stat-icon-wrap">
                  <Calendar size={16} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Next Draw</span>
                  <span className="stat-value highlight">{latestDraw?.month || 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="summary-status-footer">
              <div className="status-dot-wrap">
                <div className="status-dot pulse-emerald"></div>
                <span>Currently Active in System</span>
              </div>
            </div>
          </div>

          {/* Charity Impact - Hidden for Admin */}
          {user?.role !== 'admin' && (
            <div className="side-card glass-card">
              <div className="side-card-header">
                <div className="icon-heart-glow">
                  <Heart size={18} className="pulse-heart" />
                </div>
                <h4>Your Impact</h4>
              </div>
              {user?.selectedCharity ? (
                <div className="selected-charity-box">
                  <div className="charity-mini">
                    {user.selectedCharity.coverImage && <img src={user.selectedCharity.coverImage} alt="" />}
                    <span>{user.selectedCharity.name}</span>
                  </div>
                  <div className="contribution-meter">
                    <div className="meter-label">
                      <span>Monthly Share</span>
                      <span>{user.charityContributionPct}%</span>
                    </div>
                    <div className="meter-bar">
                      <div className="meter-fill" style={{ width: `${user.charityContributionPct}%` }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <Link to="/charities" className="sub-manage" style={{ marginTop: 0 }}>Change Charity</Link>
                    <button className="sub-manage" style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 0 }} onClick={() => { setNewPct(user.charityContributionPct); setShowContributionModal(true); }}>Adjust %</button>
                  </div>
                </div>
              ) : (
                <div className="no-charity-warning">
                  <p>Select a charity to start redirecting your fees.</p>
                  <Link to="/charities" className="btn btn-secondary btn-sm">Browse Charities</Link>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Draw */}
          <DrawCard latestDraw={latestDraw} />
        </div>
      </div>

      {showContributionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <Heart size={20} className="text-secondary" />
              <div>
                <h3>Adjust Your Impact</h3>
                <p>Voluntarily increase your monthly charity contribution.</p>
              </div>
              <button className="close-btn" onClick={() => setShowContributionModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="contribution-slider">
                <div className="slider-header">
                  <span>Your Share</span>
                  <span className="slider-val">{newPct}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  step="5" 
                  className="range-slider" 
                  value={newPct}
                  onChange={(e) => setNewPct(parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>Min 10%</span>
                  <span>Max 50%</span>
                </div>
              </div>
              <p className="note text-sm text-dim mt-4">
                Increasing your percentage directly benefits <strong>{user.selectedCharity.name}</strong>. 
                This change will be applied to all future subscription payments.
              </p>
            </div>

            <div className="modal-footer mt-6" style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary btn-full" onClick={() => setShowContributionModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={handleUpdateContribution} disabled={submitting}>
                {submitting ? <Loader className="animate-spin" size={16} /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
        }
        .dashboard-header h1 { margin: 0.5rem 0 0; font-size: 2.5rem; }
        
        .dashboard-hero-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          padding: 1.5rem !important;
          display: flex;
          align-items: center;
        }
        .stat-main {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }
        .stat-text h3 { margin: 0; font-size: 1rem; color: var(--text-main); font-weight: 800; }
        .stat-text p { margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--text-dim); line-height: 1.4; }
        .impact-val { margin-top: 0.75rem; font-size: 1.25rem; font-weight: 900; color: var(--primary); }

        /* Radial Progress */
        .radial-progress-wrapper {
          position: relative;
          width: 75px;
          height: 75px;
          flex-shrink: 0;
        }
        .radial-progress { transform: rotate(-90deg); width: 100%; height: 100%; }
        .circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 3.5; }
        .circle {
          fill: none;
          stroke: var(--primary);
          stroke-width: 3.5;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease;
          filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.4));
        }
        .radial-content {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }
        .radial-content .current { font-size: 1.35rem; font-weight: 900; color: var(--text-main); }
        .radial-content .total { font-size: 0.65rem; color: var(--text-dim); margin-top: 2px; }

        /* Impact Meter - Liquid */
        .impact-meter {
          position: relative;
          width: 75px;
          height: 75px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .liquid-container {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0,0,0,0.3);
          border: 2px solid rgba(16, 185, 129, 0.2);
          overflow: hidden;
        }
        .liquid {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(0deg, var(--primary) 0%, var(--primary-light) 100%);
          transition: height 1.5s ease-out;
          opacity: 0.7;
        }
        .liquid::after {
          content: '';
          position: absolute;
          top: -10px; left: -50%;
          width: 200%; height: 20px;
          background: rgba(255,255,255,0.15);
          border-radius: 40%;
          animation: wave 4s infinite linear;
        }
        @keyframes wave { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pulse-heart {
          position: relative;
          z-index: 2;
          color: white;
          animation: heartbeat 1.5s infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        
        .dashboard-section { margin-bottom: 2rem; }
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .title-left { display: flex; align-items: center; gap: 0.75rem; color: var(--primary); }
        .title-left h3 { margin-bottom: 0; color: var(--text-main); font-size: 1.25rem; }
        .count-badge { font-size: 0.75rem; background: var(--glass); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); color: var(--text-muted); }
        
        .score-form {
          margin-bottom: 2.5rem;
          background: rgba(0,0,0,0.2);
          padding: 1.5rem;
          border-radius: var(--radius-sm);
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        /* Scores Grid */
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        .score-chip {
          padding: 1.5rem !important;
          text-align: center;
          position: relative;
          transition: var(--transition);
        }
        .score-chip:hover { transform: translateY(-3px); border-color: var(--primary); }
        .chip-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .hole-num { font-size: 0.7rem; font-weight: 900; color: var(--text-dim); text-transform: uppercase; }
        .chip-actions { display: flex; gap: 0.4rem; opacity: 0; transition: 0.2s; }
        .score-chip:hover .chip-actions { opacity: 1; }
        
        .chip-body .val {
          font-size: 2.75rem;
          font-weight: 900;
          line-height: 1;
          display: block;
          margin: 0.5rem 0;
          letter-spacing: -0.02em;
        }
        .val.high { color: var(--primary); }
        .val.mid { color: var(--accent); }
        .val.low { color: var(--text-muted); }

        .chip-footer { font-size: 0.65rem; color: var(--text-dim); font-weight: 700; }
        .score-limit-note { margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: var(--text-dim); }
        .empty-scores { padding: 3rem; text-align: center; color: var(--text-dim); opacity: 0.5; }
        .empty-scores p { margin-top: 1rem; }

        .winnings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .win-card { padding: 1.5rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); border-left: 4px solid var(--accent); }
        .win-header { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .win-status.paid { color: var(--primary); }
        .win-status.pending { color: var(--accent); }
        .win-amount { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; }
        .win-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); border-top: 1px solid var(--glass-border); padding-top: 0.75rem; }
        .upload-link { color: var(--primary); font-weight: 700; text-decoration: underline; }

        .dash-side { display: flex; flex-direction: column; gap: 1.5rem; }
        .membership-card { 
          padding: 2rem !important; 
          border: 1px solid rgba(255,255,255,0.1); 
          position: relative; 
          overflow: hidden; 
          background: linear-gradient(135deg, #0f172a, #1a2e35);
          border-radius: var(--radius-lg);
          transition: var(--transition);
        }
        .membership-card.active { border-color: rgba(16, 185, 129, 0.4); background: linear-gradient(135deg, #064e3b, #0f172a); }
        .membership-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .membership-overlay { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%); pointer-events: none; }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; z-index: 1; }
        .status-indicator { display: flex; align-items: center; gap: 0.75rem; }
        .icon-gold { color: var(--accent); filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.5)); }
        .membership-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: var(--text-dim); }
        
        .membership-body { position: relative; z-index: 1; }
        .plan-name { font-size: 1.5rem; font-weight: 900; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
        
        .validity-box { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem; }
        .validity-header { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: var(--text-dim); margin-bottom: 0.5rem; text-transform: uppercase; }
        .validity-header .date { color: var(--text-main); }
        
        .validity-progress { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-bottom: 0.75rem; }
        .progress-fill { height: 100%; background: var(--primary); border-radius: 2px; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
        .validity-note { font-size: 0.65rem; color: var(--text-muted); margin: 0; }
        
        .manage-link { font-size: 0.75rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; text-decoration: none; opacity: 0.8; transition: 0.2s; }
        .manage-link:hover { opacity: 1; color: var(--primary-light); }

        .membership-empty p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem; }
        .mt-2 { margin-top: 0.5rem; }

        .status-pill { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); text-transform: uppercase; font-weight: 800; }
        .status-pill.active { background: rgba(16, 185, 129, 0.2); color: var(--primary); border: 1px solid rgba(16, 185, 129, 0.3); }
        .status-pill.none, .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); }

        .icon-btn.edit { color: var(--primary); }
        
        /* Redesigned Participation Summary */
        .participation-summary-card {
           padding: 1.5rem !important;
           border: 1px solid var(--glass-border);
           background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
           position: relative;
        }

        .icon-glow-alt {
          width: 32px; height: 32px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.2));
        }

        .summary-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .summary-stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition);
        }

        .summary-stat-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .stat-icon-wrap {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-dim);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-content { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--text-dim); }
        .stat-value { font-size: 1.125rem; font-weight: 900; color: var(--text-main); }
        .stat-value.highlight { color: var(--primary); }

        .summary-status-footer {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .status-dot-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .pulse-emerald { 
          background: #10b981; 
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: statusPulse 2s infinite;
        }

        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .sub-details { font-size: 0.9375rem; }
        .sub-plan { font-weight: 700; margin-bottom: 0.25rem; }
        .sub-renewal { color: var(--text-dim); font-size: 0.8125rem; }
        .sub-manage { display: block; margin-top: 1.25rem; font-size: 0.8125rem; color: var(--primary); font-weight: 600; }

        .icon-heart-glow {
          width: 32px;
          height: 32px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .selected-charity-box {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }
        .charity-mini { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .charity-mini img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid var(--glass-border); }
        .charity-mini span { font-weight: 800; font-size: 1rem; color: var(--text-main); }
        
        .contribution-meter { margin-bottom: 1rem; }
        .meter-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase; }
        .meter-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .meter-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); border-radius: 4px; box-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }

        .next-draw-msg p { font-size: 0.875rem; color: var(--text-muted); }


        .winner-banner {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem !important;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(245, 158, 11, 0.1));
          border-color: var(--primary);
          margin-bottom: 3rem;
        }
        .banner-icon { width: 40px; height: 40px; color: var(--accent); flex-shrink: 0; }
        .banner-content { flex: 1; }
        .banner-content h4 { margin: 0 0 0.25rem; font-size: 1.25rem; }
        .banner-content p { color: var(--text-muted); margin: 0; font-size: 0.9375rem; }

        @media (max-width: 1024px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .quick-stats { width: 100%; justify-content: space-between; }
        }

        @media (max-width: 768px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .quick-stats { width: 100%; justify-content: space-between; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .winner-banner { flex-direction: column; text-align: center; gap: 1.5rem; }
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { width: 100%; max-width: 450px; padding: 2.5rem !important; position: relative; }
        .modal-header { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .modal-header h3 { margin: 0; font-size: 1.25rem; }
        .modal-header p { margin: 0; font-size: 0.8125rem; color: var(--text-dim); }
        .close-btn { position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: var(--text-dim); cursor: pointer; }
        .text-secondary { color: var(--secondary); }

        .contribution-slider { margin-top: 1rem; }
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-weight: 700; color: var(--text-muted); }
        .slider-val { color: var(--primary); font-size: 1.25rem; }
        .range-slider { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; outline: none; transition: 0.2s; appearance: none; }
        .range-slider::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; background: var(--primary); border-radius: 50%; cursor: pointer; border: 4px solid var(--bg-dark); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
        .slider-labels { display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; }
        
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;
