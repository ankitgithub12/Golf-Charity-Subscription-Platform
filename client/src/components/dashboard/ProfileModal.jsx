import React, { useState } from 'react';
import { X, Save, Loader, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card animate-fade-in">
        <div className="modal-header">
          <div className="modal-title">
            <User size={20} className="text-primary" />
            <h3>Manage Profile & Settings</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input text-dim" 
              value={user?.email || ''}
              disabled
              title="Email cannot be changed"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input 
              type="text" 
              className="form-input text-dim capitalize" 
              value={user?.role || 'user'}
              disabled
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 0 !important;
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .modal-title h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--glass-border);
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
