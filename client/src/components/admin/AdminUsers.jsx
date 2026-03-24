import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Edit2, Shield, UserX, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users', { params: { search: searchTerm } });
        setUsers(res.data.users);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [searchTerm]);

  const toggleAdmin = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/users/${userId}`, { isActive: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
      toast.success(`User ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="loading-state"><Loader className="animate-spin" /></div>;

  return (
    <div className="admin-users animate-fade-in">
      <div className="table-controls glass-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Role</th>
              <th>Donations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'success' : 'error'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="sub-cell">
                    <span className="sub-status">{user.subscriptionStatus}</span>
                    <span className="sub-date">Since {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-tag ${user.role}`}>{user.role}</span>
                </td>
                <td>₹{(user.totalDonated / 100 || 0).toFixed(2)}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="Toggle Admin" onClick={() => toggleAdmin(user._id, user.role)}>
                      <Shield size={16} />
                    </button>
                    <button 
                      className={`icon-btn ${user.isActive ? 'delete' : 'success'}`} 
                      title={user.isActive ? "Disable User" : "Enable User"} 
                      onClick={() => toggleStatus(user._id, user.isActive)}
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-controls { padding: 1rem 1.5rem !important; margin-bottom: 2rem; }
        .search-box { position: relative; max-width: 400px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .search-box .form-input { padding-left: 3rem; background: rgba(0,0,0,0.2); }

        .table-wrapper { padding: 0 !important; overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 1.25rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em; border-bottom: 1px solid var(--glass-border); }
        .admin-table td { padding: 1.25rem 1.5rem; font-size: 0.9375rem; border-bottom: 1px solid var(--glass-border); vertical-align: middle; }
        
        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; }
        .user-email { font-size: 0.8125rem; color: var(--text-dim); }
        
        .sub-cell { display: flex; flex-direction: column; }
        .sub-status { font-weight: 600; text-transform: capitalize; }
        .sub-date { font-size: 0.75rem; color: var(--text-dim); }
        
        .role-tag { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
        .role-tag.admin { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
        .role-tag.user { background: var(--glass); color: var(--text-muted); }
        
        .badge.success { color: var(--primary); }
        .badge.error { color: var(--error); }
        
        .action-btns { display: flex; gap: 0.5rem; }
        .icon-btn { padding: 0.5rem; color: var(--text-dim); border-radius: 4px; }
        .icon-btn:hover { background: var(--glass); color: var(--text-main); }
        .icon-btn.delete:hover { color: var(--error); }
      `}</style>
    </div>
  );
};

export default AdminUsers;
