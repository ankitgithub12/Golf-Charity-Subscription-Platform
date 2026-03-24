import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Trophy, Heart, Settings, 
  Search, ShieldCheck, DollarSign, Plus, 
  AlertCircle, ChevronRight, Loader, Filter
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Sub-components
import AdminOverview from '../../components/admin/AdminOverview';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminDraws from '../../components/admin/AdminDraws';
import AdminCharities from '../../components/admin/AdminCharities';
import AdminWinners from '../../components/admin/AdminWinners';

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', path: '/admin', icon: <BarChart3 size={18} />, end: true },
    { id: 'users', label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { id: 'draws', label: 'Draws', path: '/admin/draws', icon: <Trophy size={18} /> },
    { id: 'charities', label: 'Charities', path: '/admin/charities', icon: <Heart size={18} /> },
    { id: 'winners', label: 'Winners', path: '/admin/winners', icon: <ShieldCheck size={18} /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data.analytics);
      } catch (err) {
        if (err.response?.status === 403) {
          console.error("🚫 403 Forbidden details:", err.response.data);
        }
        console.error("Admin stats error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-state h-80"><Loader className="animate-spin" /></div>;

  const currentTab = tabs.find(t => t.path === location.pathname) || tabs[0];

  return (
    <div className="admin-dashboard-page container section">
      <div className="admin-layout">
        <aside className="admin-sidebar glass-card">
          <div className="sidebar-header">
            <h3>Admin Panel</h3>
            <p>Platform Management</p>
          </div>
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <NavLink 
                key={tab.id}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {location.pathname === tab.path && <motion.div layoutId="active-nav" className="active-indicator" />}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="admin-main animate-fade-in">
          <header className="admin-content-header">
            <h2>{currentTab.label}</h2>
            <div className="admin-actions">
              {/* Context-aware actions could go here */}
            </div>
          </header>
          
          <div className="admin-content-body">
            <Outlet context={{ stats }} />
          </div>
        </main>
      </div>

      <style>{`
        .admin-dashboard-page {
          max-width: 1400px;
        }
        .admin-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 3rem;
          min-height: 70vh;
        }
        
        .admin-sidebar {
          padding: 2rem 1rem !important;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .sidebar-header {
          padding: 0 1rem 2rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2rem;
        }
        .sidebar-header h3 { margin-bottom: 0.25rem; font-size: 1.125rem; }
        .sidebar-header p { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; }
        
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9375rem;
          border-radius: var(--radius-sm);
          position: relative;
          transition: var(--transition);
        }
        .nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text-main); }
        .nav-item.active { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
        .active-indicator {
          position: absolute;
          left: 0;
          width: 3px;
          height: 60%;
          background: var(--primary);
          border-radius: 0 3px 3px 0;
        }
        
        .admin-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }
        .admin-content-header h2 { margin: 0; font-size: 2rem; }

        @media (max-width: 1024px) {
          .admin-layout { grid-template-columns: 1fr; }
          .admin-sidebar { position: static; margin-bottom: 2rem; }
          .sidebar-nav { flex-direction: row; overflow-x: auto; padding-bottom: 1rem; }
          .nav-item span { display: none; }
          .active-indicator { bottom: 0; top: auto; width: 60%; height: 3px; left: 20%; border-radius: 3px 3px 0 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
