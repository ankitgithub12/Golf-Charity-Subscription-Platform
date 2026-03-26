import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Globe, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CharityDetail = () => {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const res = await api.get(`/charities/${id}`);
        setCharity(res.data.charity);
        setActiveImage(res.data.charity.coverImage);
      } catch (err) {
        toast.error("Charity not found");
        navigate('/charities');
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [id, navigate]);

  const handleSelect = async () => {
    if (!user) {
      toast.error("Please login to select a charity");
      navigate('/login');
      return;
    }
    if (user.subscriptionStatus !== 'active' && user.role !== 'admin') {
      toast.error("Active subscription required to support a charity");
      navigate('/subscribe');
      return;
    }

    try {
      setSelecting(true);
      const res = await api.post('/charities/select', { charityId: id });
      setUser(prev => ({ ...prev, selectedCharity: res.data.user.selectedCharity }));
      toast.success(`You are now supporting ${charity.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to select charity");
    } finally {
      setSelecting(false);
    }
  };

  const handleDonate = async () => {
    if (!user) {
      toast.error("Please login to donate");
      return;
    }
    if (!donateAmount || isNaN(donateAmount) || donateAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setDonating(true);
      // Convert INR to Paise (100x)
      const amountPaise = Math.round(parseFloat(donateAmount) * 100);
      await api.post(`/charities/${id}/donate`, { amount: amountPaise });
      toast.success(`Thank you for your donation of ₹${parseFloat(donateAmount).toFixed(2)}!`);
      setDonateAmount('');
      // Refresh charity stats
      const res = await api.get(`/charities/${id}`);
      setCharity(res.data.charity);
    } catch (err) {
      toast.error(err.response?.data?.message || "Donation failed");
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="loading-state h-80"><Loader className="animate-spin" /></div>;
  if (!charity) return null;

  const isSelected = user?.selectedCharity?._id === id || user?.selectedCharity === id;

  return (
    <div className="charity-detail container section animate-fade-in">
      <Link to="/charities" className="back-link">
        <ArrowLeft size={18} /> Back to Partners
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-header">
            <span className="badge">{charity.category}</span>
            <h1>{charity.name}</h1>
            <div className="charity-meta">
              {charity.website && (
                <a href={charity.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={16} /> Website
                </a>
              )}
              {charity.registrationNumber && (
                <span>Reg No: {charity.registrationNumber}</span>
              )}
            </div>
          </div>

          <div className="detail-image glass-card">
            <img 
              src={activeImage || charity.coverImage || "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=1200"} 
              alt={charity.name} 
            />
          </div>

          {charity.images?.length > 1 && (
            <div className="image-gallery">
              {[charity.coverImage, ...charity.images.filter(img => img !== charity.coverImage)].map((img, i) => (
                <div 
                  key={i} 
                  className={`gallery-thumb ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Gallery ${i}`} />
                </div>
              ))}
            </div>
          )}

          <div className="detail-content">
            <h3>About the Cause</h3>
            <p className="description">{charity.description}</p>
            
            {charity.events?.length > 0 && (
              <div className="upcoming-events">
                <h3>Upcoming Golf Days & Events</h3>
                <div className="events-grid">
                  {charity.events.map((event, i) => (
                    <div key={i} className="event-card glass-card">
                      <div className="event-date">
                        <Calendar size={18} /> {new Date(event.date).toLocaleDateString()}
                      </div>
                      <h4>{event.title}</h4>
                      <div className="event-location">
                        <MapPin size={16} /> {event.location}
                      </div>
                      <p>{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="sticky-sidebar">
            <div className="impact-box glass-card">
              <h3>Community Impact</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span>Supporters</span>
                  <strong>{charity.supporterCount}</strong>
                </div>
                <div className="stat-row highlight">
                  <span>Total Donated</span>
                  <strong>₹{(charity.totalDonations/100).toFixed(2)}</strong>
                </div>
              </div>

              {isSelected ? (
                <div className="selected-badge">
                  <CheckCircle size={20} />
                  <span>Your primary charity</span>
                </div>
              ) : (
                <button 
                  className="btn btn-primary btn-full" 
                  onClick={handleSelect}
                  disabled={selecting}
                >
                  {selecting ? <Loader size={18} className="animate-spin" /> : <><Heart size={18} /> Support this Cause</>}
                </button>
              )}
              <p className="impact-note">Selecting this charity will redirect 10% (or more) of your subscription fees here.</p>
            </div>

            {/* Independent Donation Box */}
            <div className="impact-box glass-card mt-6">
              <h3>Direct Donation</h3>
              <p className="text-sm text-dim mb-4">Make a one-off contribution to support this cause immediately.</p>
              
              <div className="donation-form">
                <div className="amount-input-wrapper mb-4">
                  <span className="currency-prefix">₹</span>
                  <input 
                    type="number" 
                    placeholder="Enter amount" 
                    className="form-input"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <button 
                  className="btn btn-secondary btn-full"
                  onClick={handleDonate}
                  disabled={donating || !donateAmount}
                >
                  {donating ? <Loader size={18} className="animate-spin" /> : <>Make Donation</>}
                </button>
              </div>
              <p className="impact-note">100% of direct donations go to the charity (minus transaction fees).</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
          font-weight: 500;
          margin-bottom: 2rem;
        }
        .back-link:hover { color: var(--primary); }
        
        .detail-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
        }
        .detail-header { margin-bottom: 2rem; }
        .detail-header h1 { font-size: 3rem; margin: 0.5rem 0; }
        .charity-meta {
          display: flex;
          gap: 2rem;
          color: var(--text-dim);
          font-size: 0.9375rem;
        }
        .charity-meta a { display: flex; align-items: center; gap: 0.5rem; }
        .charity-meta a:hover { color: var(--primary); }
        
        .detail-image {
          padding: 0 !important;
          height: 450px;
          overflow: hidden;
          margin-bottom: 3rem;
        }
        .detail-image img { width: 100%; height: 100%; object-fit: cover; }
        
        .image-gallery { display: flex; gap: 1rem; margin-bottom: 3rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .gallery-thumb { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
        .gallery-thumb:hover { border-color: var(--primary-light); }
        .gallery-thumb.active { border-color: var(--primary); transform: scale(1.05); }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .description {
          font-size: 1.125rem;
          color: var(--text-muted);
          white-space: pre-line;
          margin-bottom: 4rem;
        }
        
        .upcoming-events h3 { margin-bottom: 2rem; }
        .events-grid { display: grid; gap: 1.5rem; }
        .event-card { padding: 1.5rem !important; }
        .event-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent);
          font-weight: 700;
          font-size: 0.8125rem;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .event-card h4 { margin-bottom: 0.5rem; font-size: 1.125rem; }
        .event-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .event-card p { color: var(--text-muted); font-size: 0.875rem; }
        
        .sticky-sidebar { position: sticky; top: 100px; }
        .impact-box { padding: 2rem !important; }
        .stats-list { margin: 1.5rem 0 2rem; }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid var(--glass-border);
        }
        .stat-row.highlight { color: var(--primary); font-size: 1.25rem; border-bottom: none; }
        .selected-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
          border-radius: var(--radius-sm);
          font-weight: 700;
        }
        .impact-note {
          margin-top: 1.5rem;
          color: var(--text-dim);
          font-size: 0.75rem;
          text-align: center;
        }
        
        .mt-6 { margin-top: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .text-sm { font-size: 0.875rem; }
        
        .donation-form { display: flex; flex-direction: column; }
        .amount-input-wrapper { position: relative; }
        .currency-prefix { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--primary); }
        .amount-input-wrapper .form-input { padding-left: 2.5rem; }
        
        @media (max-width: 1024px) {
          .detail-layout { grid-template-columns: 1fr; }
          .detail-image { height: 300px; }
          .sticky-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
};

export default CharityDetail;
