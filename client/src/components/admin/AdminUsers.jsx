import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Edit2, Shield, UserX, Loader, Trophy, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'user', isActive: true, subscriptionStatus: 'none' });
  const [savingEdit, setSavingEdit] = useState(false);

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

  const fetchUserScores = async (userId) => {
    setScoresLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setUserScores(res.data.scores || []);
    } catch (err) {
      toast.error("Failed to load user scores");
    } finally {
      setScoresLoading(false);
    }
  };

  const deleteUserScore = async (scoreId) => {
    if (!window.confirm("Delete this score?")) return;
    try {
      await api.delete(`/admin/scores/${scoreId}`);
      setUserScores(userScores.filter(s => s._id !== scoreId));
      toast.success("Score deleted");
    } catch (err) {
      toast.error("Failed to delete score");
    }
  };

  const handleEditClick = (user) => {
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      subscriptionStatus: user.subscriptionStatus || 'none'
    });
    setEditingUser(user);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put(`/admin/users/${editingUser._id}`, editFormData);
      setUsers(users.map(u => u._id === editingUser._id ? res.data.user : u));
      toast.success("User updated successfully");
      setEditingUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSavingEdit(false);
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
                    <button className="icon-btn" title="Manage Scores" onClick={() => { setSelectedUser(user); fetchUserScores(user._id); }}>
                      <Trophy size={16} />
                    </button>
                    <button className="icon-btn" title="Edit Profile" onClick={() => handleEditClick(user)}>
                      <Edit2 size={16} />
                    </button>
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

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-card score-manage-modal">
            <div className="modal-header">
              <Trophy size={20} className="text-primary" />
              <div>
                <h3>Scores for {selectedUser.name}</h3>
                <p>Manage 5-score rolling history</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedUser(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              {scoresLoading ? (
                <div className="loading-state h-40"><Loader className="animate-spin" /></div>
              ) : userScores.length > 0 ? (
                <div className="admin-scores-list">
                  {userScores.map(score => (
                    <div key={score._id} className="admin-score-item">
                      <div className="score-val">{score.value}</div>
                      <div className="score-info">
                        <strong>{new Date(score.datePlayed).toLocaleDateString()}</strong>
                        {score.notes && <span>{score.notes}</span>}
                      </div>
                      <button className="icon-btn delete" onClick={() => deleteUserScore(score._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No scores found for this user.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {editingUser && (
        <div className="modal-overlay">
          <form className="modal-content glass-card edit-user-modal" onSubmit={handleSaveEdit}>
            <div className="modal-header">
              <Edit2 size={20} className="text-primary" />
              <div>
                <h3>Edit User Profile</h3>
                <p>Modify user details and account status</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setEditingUser(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-input"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select 
                    className="form-input"
                    value={editFormData.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({...editFormData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              {editFormData.role !== 'admin' && (
                <div className="form-group">
                  <label className="form-label">Subscription Status</label>
                  <select 
                    className="form-input"
                    value={editFormData.subscriptionStatus}
                    onChange={(e) => setEditFormData({...editFormData, subscriptionStatus: e.target.value})}
                  >
                    <option value="none">None</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="past_due">Past Due</option>
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                {savingEdit ? <Loader className="animate-spin" size={16} /> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .table-controls { padding: 1rem 1.5rem !important; margin-bottom: 2rem; }
        .search-box { position: relative; max-width: 400px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .search-box .form-input { padding-left: 3rem; background: rgba(0,0,0,0.2); }
        select.form-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { margin-bottom: 1.25rem; }
        .modal-footer { display: flex; gap: 1rem; }
        .modal-footer .btn { flex: 1; justify-content: center; }

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
        
        .action-btns { display: flex; gap: 0.5rem; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { width: 100%; max-width: 500px; padding: 2rem !important; position: relative; }
        .modal-header { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-start; }
        .modal-header h3 { margin: 0; font-size: 1.25rem; }
        .modal-header p { margin: 0; font-size: 0.8125rem; color: var(--text-dim); }
        .close-btn { position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.5rem; }
        
        .admin-scores-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-score-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--glass-border); }
        .score-val { width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .score-info { flex: 1; display: flex; flex-direction: column; }
        .score-info span { font-size: 0.75rem; color: var(--text-dim); }
        .no-data { text-align: center; color: var(--text-dim); padding: 2rem; }
      `}</style>
    </div>
  );
};

export default AdminUsers;
