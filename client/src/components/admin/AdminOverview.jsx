import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Trophy, Heart, IndianRupee, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminOverview = () => {
  const { stats } = useOutletContext();
  if (!stats) return null;

  const dataCards = [
    { label: 'Total Users', val: stats.userCount || 0, icon: <Users />, color: 'var(--primary)' },
    { label: 'Active Subs', val: stats.activeSubs || 0, icon: <TrendingUp />, color: 'var(--success)' },
    { label: 'Live Pot (est.)', val: `₹${(stats.projectedPool / 100 || 0).toFixed(0)}`, icon: <Trophy />, color: 'var(--accent)' },
    { label: 'Total Paid out', val: `₹${(stats.totalPrize / 100 || 0).toFixed(0)}`, icon: <IndianRupee />, color: 'var(--payout)' },
    { label: 'Charity Pot', val: `₹${(stats.charityPot / 100 || 0).toFixed(0)}`, icon: <Heart />, color: 'var(--charity)' },
  ];

  // Placeholder chart data
  const chartData = [
    { name: 'Jan', donations: 400, subs: 240 },
    { name: 'Feb', donations: 300, subs: 139 },
    { name: 'Mar', donations: 200, subs: 980 },
    { name: 'Apr', donations: 278, subs: 390 },
    { name: 'May', donations: 189, subs: 480 },
    { name: 'Jun', donations: 239, subs: 380 },
  ];

  return (
    <div className="admin-overview animate-fade-in">
      <div className="stats-grid">
        {dataCards.map((card, i) => (
          <div key={i} className="stat-card glass-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="label">{card.label}</span>
              <span className="val">{card.val}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-card">
          <h4>Donation Growth</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="donations" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h4>Subscription Trends</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="subs" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
        .stat-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem !important; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-info .label { display: block; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem; }
        .stat-info .val { font-size: 1.5rem; font-weight: 800; }
        
        .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .chart-card { padding: 2rem !important; }
        .chart-card h4 { margin-bottom: 2rem; color: var(--text-muted); }
        .chart-container { width: 100%; height: 300px; }
        
        @media (max-width: 1280px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } .charts-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminOverview;
