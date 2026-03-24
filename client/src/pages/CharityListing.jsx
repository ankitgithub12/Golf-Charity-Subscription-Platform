import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, ArrowRight, Loader, Activity, BookOpen, Leaf, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CharityCard from '../components/charity/CharityCard';

const CharityListing = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { id: '', name: 'All', icon: <Filter size={16} /> },
    { id: 'health', name: 'Health', icon: <Activity size={16} /> },
    { id: 'education', name: 'Education', icon: <BookOpen size={16} /> },
    { id: 'environment', name: 'Environment', icon: <Leaf size={16} /> },
    { id: 'sports', name: 'Sports', icon: <Trophy size={16} /> },
    { id: 'community', name: 'Community', icon: <Users size={16} /> },
  ];

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (category) params.category = category;
        
        const res = await api.get('/charities', { params });
        setCharities(res.data.charities);
      } catch (err) {
        console.error("Error fetching charities", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCharities();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, category]);

  return (
    <div className="charity-listing container section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="badge">Charity Partners</span>
        <h2>Choose Your Impact</h2>
        <p>Browse our verified charity partners. Your subscription helps them continue their vital work on the ground.</p>
      </motion.div>

      {/* Filters */}
      <div className="filter-bar glass-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or keyword..." 
            className="form-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`cat-tab ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader className="animate-spin" size={40} />
          <p>Finding partners...</p>
        </div>
      ) : (
        <div className="charity-grid">
          {charities.length > 0 ? charities.map((charity, i) => (
            <CharityCard key={charity._id} charity={charity} />
          )) : (
            <div className="empty-state">
              <p>No charities found matching your criteria.</p>
              <button className="btn btn-primary" onClick={() => {setSearchTerm(''); setCategory('');}}>Reset Filters</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
          padding: 1.5rem !important;
        }
        .search-box {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .search-box .form-input {
          padding-left: 3rem;
          background: rgba(0,0,0,0.3);
        }
        .category-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        .cat-tab {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 1.25rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-dim);
          transition: var(--transition);
          cursor: pointer;
        }
        .cat-tab:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--primary);
          color: var(--text-main);
          transform: translateY(-2px);
        }
        .cat-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: var(--shadow-primary);
        }
        .cat-tab svg {
          opacity: 0.7;
        }
        .cat-tab.active svg {
          opacity: 1;
        }
        
        .charity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .charity-card {
          padding: 0 !important;
          overflow: hidden;
        }
        .charity-image-wrapper {
          position: relative;
          height: 200px;
        }
        .charity-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .charity-cat-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .charity-info {
          padding: 1.5rem;
        }
        .charity-info h3 {
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
        }
        .charity-info p {
          color: var(--text-muted);
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
          height: 4.5rem;
          overflow: hidden;
        }
        .charity-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-dim);
          margin-bottom: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
        }
        .charity-stats strong {
          color: var(--text-main);
        }
        .stat-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-dim);
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 0;
          color: var(--text-muted);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
          color: var(--primary);
          margin-bottom: 1rem;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default CharityListing;

