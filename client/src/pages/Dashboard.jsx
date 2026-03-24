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
        <div className="quick-stats">
          <div className="dash-stat">
            <span className="label">Total Won</span>
            <span className="val">{formatCurrency(user?.totalWinnings || 0)}</span>
          </div>
          <div className="dash-stat">
            <span className="label">Impact Level</span>
            <span className="val">{user?.charityContributionPct}%</span>
          </div>
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

            <div className="scores-list">
              {scores.length > 0 ? scores.map((score, i) => (
                <div key={score._id} className="score-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="score-val">
                    <span>{score.value}</span>
                  </div>
                  <div className="score-info">
                    <div className="score-top">
                      <span className="score-date text-sm text-dim">{formatDate(score.datePlayed)}</span>
                    </div>
                    {score.notes && <p className="score-notes">{score.notes}</p>}
                  </div>
                  <div className="score-actions">
                    <button className="icon-btn edit" onClick={() => { setEditingScore(score); setShowScoreForm(false); }} title="Edit score">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteScore(score._id)} title="Delete score">
                      <Trash2 size={16} />
                    </button>
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
          {/* Subscription Info */}
          <div className="side-card glass-card">
            <div className="side-card-header">
              <CreditCard size={18} />
              <h4>Subscription</h4>
              <span className={`status-pill ${user?.subscriptionStatus}`}>{user?.subscriptionStatus}</span>
            </div>
            {subscription ? (
              <div className="sub-details">
                <div className="sub-plan">{subscription.planType} Plan</div>
                <div className="sub-renewal">Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                <Link to="/subscribe" className="sub-manage">Manage Subscription <ExternalLink size={14} /></Link>
              </div>
            ) : (
              <Link to="/subscribe" className="btn btn-primary btn-full">Subscribe Now</Link>
            )}
          </div>

          {/* Charity Impact */}
          <div className="side-card glass-card">
            <div className="side-card-header">
              <Heart size={18} />
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
                <Link to="/charities" className="sub-manage">Change Charity</Link>
              </div>
            ) : (
              <div className="no-charity-warning">
                <p>Select a charity to start redirecting your fees.</p>
                <Link to="/charities" className="btn btn-secondary btn-sm">Browse Charities</Link>
              </div>
            )}
          </div>

          {/* Upcoming Draw */}
          <DrawCard latestDraw={latestDraw} />
        </div>
      </div>

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
        }
        .dashboard-header h1 { margin: 0.5rem 0 0; font-size: 2.5rem; }
        .quick-stats { display: flex; gap: 2rem; }
        .dash-stat { text-align: right; }
        .dash-stat .label { display: block; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .dash-stat .val { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

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
        
        .scores-list { display: flex; flex-direction: column; gap: 1rem; }
        .score-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          transition: var(--transition);
        }
        .score-item:hover { border-color: var(--primary); background: rgba(16, 185, 129, 0.05); }
        .score-val {
          width: 50px;
          height: 50px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          color: white;
          flex-shrink: 0;
        }
        .score-info { flex: 1; }
        .score-date { font-size: 0.875rem; color: var(--text-muted); }
        .score-notes { font-size: 0.8125rem; color: var(--text-dim); margin-top: 0.25rem; }
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
        .side-card { padding: 1.5rem !important; }
        .side-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; color: var(--primary); }
        .side-card-header h4 { margin-bottom: 0; color: var(--text-main); font-size: 1rem; flex: 1; }
        .status-pill { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); text-transform: uppercase; font-weight: 800; }
        .status-pill.active { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
        .status-pill.none { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-pill.expired { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-pill.past_due { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .status-pill.trialing { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .icon-btn.edit { color: var(--primary); }
        
        .sub-details { font-size: 0.9375rem; }
        .sub-plan { font-weight: 700; margin-bottom: 0.25rem; }
        .sub-renewal { color: var(--text-dim); font-size: 0.8125rem; }
        .sub-manage { display: block; margin-top: 1.25rem; font-size: 0.8125rem; color: var(--primary); font-weight: 600; }

        .charity-mini { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .charity-mini img { width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; }
        .charity-mini span { font-weight: 700; font-size: 0.9375rem; }
        .contribution-meter { margin-bottom: 1rem; }
        .meter-label { display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.5rem; color: var(--text-muted); }
        .meter-bar { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .meter-fill { height: 100%; background: var(--primary); border-radius: 3px; }

        .no-charity-warning p { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; }
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
      `}</style>
    </div>
  );
};

export default Dashboard;
