import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Check, Loader, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CharitySelectModal = ({ onClose, onSelect, initialCharityId = null }) => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(initialCharityId);
  const [contribution, setContribution] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
    fetchCharities();
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) return toast.error("Please select a charity");
    setSubmitting(true);
    try {
      await api.post('/charities/select', {
        charityId: selectedId,
        charityContributionPct: contribution
      });
      toast.success("Charity selection saved!");
      onSelect();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save selection");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content glass-card charity-select-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="modal-header">
          <div className="header-icon"><Heart size={20} /></div>
          <div>
            <h3>Select a Charity</h3>
            <p>Who would you like to support with your monthly fee?</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state h-60"><Loader className="animate-spin" /></div>
          ) : (
            <>
              <div className="charity-list-scroll">
                {charities.map(charity => (
                  <div 
                    key={charity._id} 
                    className={`charity-option ${selectedId === charity._id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(charity._id)}
                  >
                    <div className="option-check">
                      {selectedId === charity._id && <Check size={14} />}
                    </div>
                    <div className="option-info">
                      <strong>{charity.name}</strong>
                      <span>{charity.category}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contribution-selector">
                <div className="selector-label">
                  <span>Contribution Level</span>
                  <span className="pct-val">{contribution}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  step="5"
                  className="contribution-slider"
                  value={contribution}
                  onChange={(e) => setContribution(parseInt(e.target.value))}
                />
                <p className="helper-text">Minimum 10% required. Higher levels increase your Impact Score.</p>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Skip for now</button>
          <button 
            className="btn btn-primary" 
            disabled={!selectedId || submitting}
            onClick={handleSubmit}
          >
            {submitting ? <Loader className="animate-spin" size={18} /> : <>Confirm Selection <ChevronRight size={18} /></>}
          </button>
        </div>
      </motion.div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2rem !important;
        }
        .modal-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .header-icon {
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-header h3 { margin: 0; font-size: 1.25rem; }
        .modal-header p { margin: 0; font-size: 0.875rem; color: var(--text-muted); }
        .close-btn {
          position: absolute;
          right: -0.5rem;
          top: -0.5rem;
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
        }

        .charity-list-scroll {
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 2rem;
          padding-right: 0.5rem;
        }
        .charity-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .charity-option:hover { background: rgba(255, 255, 255, 0.05); }
        .charity-option.selected { border-color: var(--primary); background: rgba(16, 185, 129, 0.05); }
        
        .option-check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--glass-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .selected .option-check { background: var(--primary); border-color: var(--primary); }
        
        .option-info { display: flex; flex-direction: column; }
        .option-info strong { font-size: 0.9375rem; }
        .option-info span { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; }

        .contribution-selector {
          background: rgba(0,0,0,0.2);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }
        .selector-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-weight: 700;
          font-size: 0.875rem;
        }
        .pct-val { color: var(--primary); font-size: 1rem; }
        .contribution-slider {
          width: 100%;
          accent-color: var(--primary);
          margin-bottom: 0.75rem;
        }
        .helper-text { font-size: 0.75rem; color: var(--text-dim); margin: 0; }

        .modal-footer {
          display: flex;
          gap: 1rem;
        }
        .modal-footer .btn { flex: 1; justify-content: center; }
      `}</style>
    </div>
  );
};

export default CharitySelectModal;
