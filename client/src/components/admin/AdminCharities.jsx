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
          <div key={charity._id} className="charity-item glass-card hover-glow">
            <div className="item-header">
              <div className="item-icon">
                {charity.coverImage ? (
                  <img src={charity.coverImage} alt={charity.name} className="admin-charity-img" />
                ) : (
                  <Heart size={20} />
                )}
              </div>
              <div className="item-title">
                <h4>{charity.name}</h4>
                <span className="capitalize">{charity.category}</span>
              </div>
              <div className="item-actions">
                <button className={`icon-btn ${charity.featured ? 'featured' : ''}`} onClick={() => toggleFeatured(charity._id, charity.featured)}><Star size={16} /></button>
                <button className="icon-btn" onClick={() => setSelectedCharity(charity)}><Calendar size={16} /></button>
                <button className="icon-btn" onClick={() => handleEdit(charity)}><Edit2 size={16} /></button>
                <button className="icon-btn delete" onClick={() => handleDelete(charity._id)}><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="item-desc">{charity.description.substring(0, 100)}...</p>
            <div className="item-footer">
              <span>{charity.supporterCount} Supporters</span>
              <span>₹{(charity.totalDonations / 100).toFixed(0)} Donated</span>
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
                    <input type="date" className="form-input" required value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} />
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
        .section-actions { margin-bottom: 2rem; }
        .form-wrapper { padding: 2.5rem !important; margin-bottom: 3rem; }
        .h-32 { height: 120px; resize: vertical; }

        .file-upload-zone {
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-sm);
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.2);
          cursor: pointer;
          transition: var(--transition);
          overflow: hidden;
        }
        .file-upload-zone:hover { border-color: var(--primary); background: rgba(0,0,0,0.3); }
        .upload-btn { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-dim); cursor: pointer; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        
        .gallery-previews { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; align-items: center; padding: 0.5rem; }
        .thumb-preview { width: 30px; height: 30px; border-radius: 4px; object-fit: cover; }
        
        .charities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .charity-item { padding: 1.5rem !important; display: flex; flex-direction: column; gap: 1rem; }
        .item-header { display: flex; align-items: center; gap: 1rem; }
        .item-icon { width: 44px; height: 44px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); color: var(--error); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .admin-charity-img { width: 100%; height: 100%; object-fit: cover; }
        .item-title { flex: 1; }
        .item-title h4 { margin: 0; font-size: 1rem; }
        .item-title span { font-size: 0.75rem; color: var(--text-dim); }
        .item-actions { display: flex; gap: 0.25rem; }
        .icon-btn.featured { color: var(--accent); }
        .item-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; }
        .item-footer { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--primary); border-top: 1px solid var(--glass-border); padding-top: 1rem; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { width: 100%; max-width: 500px; padding: 2.5rem !important; position: relative; }
        .modal-header { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .close-btn { position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: var(--text-dim); cursor: pointer; }
        
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
