import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Loader } from 'lucide-react';

const ScoreForm = ({ onAdd, loading, initialValues = null, isEditing = false }) => {
  const today = new Date().toISOString().split('T')[0];
  const [value, setValue] = useState('');
  const [datePlayed, setDatePlayed] = useState(today);
  const [notes, setNotes] = useState('');

  // Pre-fill when editing an existing score
  useEffect(() => {
    if (initialValues) {
      setValue(initialValues.value ?? '');
      setDatePlayed(
        initialValues.datePlayed
          ? new Date(initialValues.datePlayed).toISOString().split('T')[0]
          : today
      );
      setNotes(initialValues.notes ?? '');
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || value < 1 || value > 45) return;
    onAdd({ value: parseInt(value), datePlayed, notes });
    if (!isEditing) {
      setValue('');
      setNotes('');
    }
  };

  return (
    <form className="score-form glass-card" onSubmit={handleSubmit}>
      <h4>{isEditing ? 'Edit Score' : 'Add New Score'}</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Stableford Points (1-45)</label>
          <div className="input-with-helper">
            <input 
              type="number" 
              min="1" 
              max="45" 
              className="form-input" 
              required 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter 1-45"
            />
            <span className="input-helper">Points must be between 1 and 45.</span>
          </div>
        </div>
        <div className="form-group">
          <label>Date Played</label>
          <input 
            type="date" 
            className="form-input" 
            required 
            max={today}
            min="2020-01-01"
            value={datePlayed}
            onChange={(e) => setDatePlayed(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label>Notes (optional)</label>
        <input
          type="text"
          className="form-input"
          maxLength={200}
          placeholder="e.g. Windy conditions, back 9"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
        {loading
          ? <Loader className="animate-spin" size={18} />
          : isEditing
            ? <><Edit2 size={18} /> Update Score</>
            : <><Plus size={18} /> Add Score</>
        }
      </button>
    </form>
  );
};

export default ScoreForm;
