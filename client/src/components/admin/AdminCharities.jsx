import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader, CheckCircle, XCircle, Heart, Activity, BookOpen, Leaf, Trophy, Users, Star, Calendar, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    website: '',
    registrationNumber: '',
    coverImage: '',
    images: '', // Comma-separated string in form, array in state
    featured: false
  });
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({ title: '', date: '', location: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // File Upload States
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [previews, setPreviews] = useState({ cover: '', gallery: [] });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await api.get('/charities');
      setCharities(res.data.charities);
    } catch (err) {
      toast.error("Failed to load charities");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'images') form.append(key, formData[key]);
    });

    if (coverFile) form.append('coverImage', coverFile);
    if (galleryFiles.length > 0) {
      galleryFiles.forEach(file => form.append('images', file));
    }

    try {
      if (editingId) {
        await api.put(`/charities/${editingId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Charity updated");
      } else {
        await api.post('/charities', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Charity created");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: 'health', website: '', registrationNumber: '', featured: false });
    setCoverFile(null);
    setGalleryFiles([]);
    setPreviews({ cover: '', gallery: [] });
  };

  const handleEdit = (charity) => {
    setFormData({
      name: charity.name,
      description: charity.description,
      category: charity.category || 'health',
      website: charity.website || '',
      registrationNumber: charity.registrationNumber || '',
      featured: charity.featured || false
    });
    setPreviews({
      cover: charity.coverImage || '',
      gallery: charity.images || []
    });
    setEditingId(charity._id);
    setShowForm(true);
  };

  const toggleFeatured = async (id, current) => {
    try {
      await api.put(`/charities/${id}`, { featured: !current });
      setCharities(charities.map(c => c._id === id ? { ...c, featured: !current } : c));
      toast.success("Featured status updated");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!selectedCharity) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/charities/${selectedCharity._id}/events`, eventData);
      setCharities(charities.map(c => c._id === selectedCharity._id ? res.data.charity : c));
      setSelectedCharity(res.data.charity);
      setShowEventForm(false);
      setEventData({ title: '', date: '', location: '', description: '' });
      toast.success("Event added");
    } catch (err) {
      toast.error("Failed to add event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (charityId, eventId) => {
    try {
      const res = await api.delete(`/charities/${charityId}/events/${eventId}`);
      setCharities(charities.map(c => c._id === charityId ? res.data.charity : c));
      setSelectedCharity(res.data.charity);
      toast.success("Event removed");
    } catch (err) {
      toast.error("Failed to remove event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charity?")) return;
    try {
      await api.delete(`/charities/${id}`);
      setCharities(charities.filter(c => c._id !== id));
      if (selectedCharity?._id === id) setSelectedCharity(null);
      toast.success("Charity deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete charity");
    }
  };

  if (loading) return <div className="loading-state"><Loader className="animate-spin" /></div>;

  return (
    <div className="admin-charities animate-fade-in">
      <div className="section-actions">
        <button className="btn btn-primary" onClick={() => { 
          if(showForm) resetForm();
          setShowForm(!showForm); 
          setEditingId(null); 
        }}>
          {showForm ? 'Cancel' : <><Plus size={18} /> Add New Charity</>}
        </button>
      </div>

      {showForm && (
        <motion.div className="form-wrapper glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Charity Name</label>
                <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-picker">
                  {[
                    { id: 'health', icon: <Activity size={16} />, label: 'Health' },
                    { id: 'education', icon: <BookOpen size={16} />, label: 'Edu' },
                    { id: 'environment', icon: <Leaf size={16} />, label: 'Eco' },
                    { id: 'sports', icon: <Trophy size={16} />, label: 'Sports' },
                    { id: 'community', icon: <Users size={16} />, label: 'Group' },
                  ].map(cat => (
                    <button 
                      key={cat.id}
                      type="button"
                      className={`picker-item ${formData.category === cat.id ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, category: cat.id})}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input h-32" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website (Optional)</label>
                <input type="url" className="form-input" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reg Number (Optional)</label>
                <input type="text" className="form-input" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div className="file-upload-zone">
                  <input 
                    type="file" 
                    id="cover-upload" 
                    hidden 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCoverFile(file);
                        setPreviews(p => ({ ...p, cover: URL.createObjectURL(file) }));
                      }
                    }}
                  />
                  <label htmlFor="cover-upload" className="upload-btn">
                    {previews.cover ? (
                      <img src={previews.cover} alt="Cover Preview" className="preview-img" />
                    ) : (
                      <>
                        <ImageIcon size={24} />
                        <span>Select Cover Image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gallery Images (Max 10)</label>
                <div className="file-upload-zone">
                  <input 
                    type="file" 
                    id="gallery-upload" 
                    hidden 
                    multiple 
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setGalleryFiles(files);
                      setPreviews(p => ({ ...p, gallery: files.map(f => URL.createObjectURL(f)) }));
                    }}
                  />
                  <label htmlFor="gallery-upload" className="upload-btn">
                    <div className="gallery-previews">
                      {previews.gallery.length > 0 ? (
                        previews.gallery.slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="thumb-preview" />
                        ))
                      ) : (
                        <>
                          <Plus size={24} />
                          <span>Add Gallery Source</span>
                        </>
                      )}
                      {previews.gallery.length > 4 && <span>+{previews.gallery.length - 4} more</span>}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? <Loader className="animate-spin" /> : editingId ? 'Update Charity' : 'Create Charity'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="charities-grid">
        {charities.map(charity => (
          <div key={charity._id} className={`charity-item glass-card premium-card ${charity.featured ? 'is-featured' : ''}`}>
            {charity.featured && <div className="featured-ribbon"><Star size={10} fill="currentColor" /> Featured</div>}
            
            <div className="item-visual">
              {charity.coverImage ? (
                <img src={charity.coverImage} alt={charity.name} className="admin-charity-img" />
              ) : (
                <div className="placeholder-visual"><Heart size={32} /></div>
              )}
              <div className="category-pill capitalize">{charity.category}</div>
            </div>

            <div className="item-content">
              <div className="item-header">
                <div className="item-title">
                  <h4>{charity.name}</h4>
                  <div className="reg-id">Reg: {charity.registrationNumber || 'N/A'}</div>
                </div>
                <div className="item-actions">
                  <button 
                    className={`icon-btn action-featured ${charity.featured ? 'active' : ''}`} 
                    onClick={() => toggleFeatured(charity._id, charity.featured)}
                    title="Toggle Featured"
                  >
                    <Star size={18} fill={charity.featured ? "currentColor" : "none"} />
                  </button>
                  <button className="icon-btn action-calendar" onClick={() => setSelectedCharity(charity)} title="Manage Events">
                    <Calendar size={18} />
                  </button>
                  <button className="icon-btn action-edit" onClick={() => handleEdit(charity)} title="Edit Charity">
                    <Edit2 size={18} />
                  </button>
                  <button className="icon-btn action-delete" onClick={() => handleDelete(charity._id)} title="Delete Charity">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="item-desc">{charity.description.substring(0, 120)}...</p>
              
              <div className="item-stats-grid">
                <div className="stat-pill">
                  <Users size={14} className="text-primary" />
                  <span>{charity.supporterCount} Supporters</span>
                </div>
                <div className="stat-pill highlight">
                  <Heart size={14} className="text-error" />
                  <span>₹{(charity.totalDonations / 100).toLocaleString()} Donated</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCharity && (
        <div className="modal-overlay">
          <div className="modal-content glass-card event-modal">
            <div className="modal-header">
              <Calendar size={20} className="text-primary" />
              <div>
                <h3>Events for {selectedCharity.name}</h3>
                <p>Manage upcoming golf days and fundraisers</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedCharity(null)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <button className="btn btn-secondary btn-sm mb-4" onClick={() => setShowEventForm(!showEventForm)}>
                {showEventForm ? 'Cancel' : <><Plus size={14} /> Add Event</>}
              </button>

              {showEventForm && (
                <form onSubmit={handleAddEvent} className="event-form mb-6 glass-card p-4">
                  <div className="form-group mb-2">
                    <input type="text" placeholder="Event Title" className="form-input" required value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} />
                  </div>
                  <div className="form-row mb-2">
                    <input 
                      type="date" 
                      className="form-input" 
                      required 
                      min={new Date().toISOString().split('T')[0]}
                      value={eventData.date} 
                      onChange={e => setEventData({...eventData, date: e.target.value})} 
                    />
                    <input type="text" placeholder="Location" className="form-input" value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} />
                  </div>
                  <textarea placeholder="Description" className="form-input h-20 mb-3" value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}></textarea>
                  <button className="btn btn-primary btn-sm btn-full" disabled={submitting}>Save Event</button>
                </form>
              )}

              <div className="events-list">
                {selectedCharity.events?.length > 0 ? selectedCharity.events.map(event => (
                  <div key={event._id} className="event-item">
                    <div className="event-info">
                      <strong>{event.title}</strong>
                      <span className="text-dim">{new Date(event.date).toLocaleDateString()} • {event.location}</span>
                    </div>
                    <button className="icon-btn delete" onClick={() => handleDeleteEvent(selectedCharity._id, event._id)}><Trash2 size={14} /></button>
                  </div>
                )) : <p className="text-dim text-center py-4">No events scheduled.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .section-actions { margin-bottom: 3rem; display: flex; justify-content: flex-end; }
        .form-wrapper { padding: 3rem !important; margin-bottom: 4rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .h-32 { height: 120px; resize: vertical; }

        .file-upload-zone {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: var(--radius-md);
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
          cursor: pointer;
          transition: var(--transition);
          overflow: hidden;
        }
        .file-upload-zone:hover { border-color: var(--primary); background: rgba(0,0,0,0.4); }
        .upload-btn { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-dim); transition: 0.2s; }
        .upload-btn:hover { color: var(--text-main); }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        
        .gallery-previews { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; align-items: center; padding: 0.5rem; }
        .thumb-preview { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        
        .charities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; }
        .premium-card { 
          padding: 0 !important; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
        }
        .premium-card:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
        .premium-card.is-featured { border-color: rgba(245, 158, 11, 0.3); }
        
        .featured-ribbon {
          position: absolute;
          top: 1rem; right: -2rem;
          background: var(--accent);
          color: white;
          padding: 0.25rem 3rem;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          transform: rotate(45deg);
          z-index: 10;
          display: flex; align-items: center; gap: 0.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .item-visual { height: 180px; position: relative; overflow: hidden; background: rgba(0,0,0,0.2); }
        .admin-charity-img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s ease; }
        .premium-card:hover .admin-charity-img { transform: scale(1.1); }
        .placeholder-visual { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-dim); }
        
        .category-pill { position: absolute; bottom: 1rem; left: 1rem; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; z-index: 2; }

        .item-content { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; flex: 1; }
        .item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .item-title h4 { margin: 0 0 0.25rem; font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .reg-id { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        
        .item-actions { display: flex; gap: 0.4rem; }
        .icon-btn { 
          width: 32px; height: 32px; 
          display: flex; align-items: center; justify-content: center; 
          border-radius: 8px; background: rgba(255,255,255,0.03); 
          color: var(--text-dim); 
          transition: 0.2s; 
        }
        .icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-main); }
        .action-featured.active { color: var(--accent); background: rgba(245, 158, 11, 0.15); }
        .action-edit:hover { color: var(--primary); }
        .action-delete:hover { color: var(--error); background: rgba(239, 68, 68, 0.1); }

        .item-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; margin: 0; min-height: 3.2em; }
        
        .item-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.25rem; }
        .stat-pill { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
        .stat-pill.highlight { color: var(--error); }
        .stat-pill span { color: var(--text-main); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { width: 100%; max-width: 550px; padding: 2.5rem !important; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 60px rgba(0,0,0,0.5); }
        .modal-header { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem; }
        .close-btn { position: absolute; right: 1.5rem; top: 1.5rem; background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.5rem; transition: 0.2s; }
        .close-btn:hover { color: var(--text-main); transform: rotate(90deg); }
        
        .event-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 8px; margin-bottom: 0.5rem; }
        .event-info { display: flex; flex-direction: column; }
        .event-info strong { font-size: 0.9375rem; }
        .event-info span { font-size: 0.75rem; }
        
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .h-20 { height: 80px; resize: none; }
        .py-4 { padding: 1rem 0; }

        .category-picker {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }
        .picker-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--text-dim);
          cursor: pointer;
          transition: var(--transition);
        }
        .picker-item span { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
        .picker-item:hover { border-color: var(--primary); color: var(--text-main); }
        .picker-item.active { background: var(--primary); color: white; border-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default AdminCharities;
