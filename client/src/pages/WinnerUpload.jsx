import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const WinnerUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const res = await api.get(`/winners/my`);
        const target = res.data.winners.find(w => w._id === id);
        if (!target) {
          toast.error("Winner record not found");
          navigate('/dashboard');
        } else {
          setWinner(target);
        }
      } catch (err) {
        toast.error("Failed to load data");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchWinner();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      await api.post(`/winners/${id}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Proof uploaded successfully! Admin will verify it shortly.");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading-state h-80"><Loader className="animate-spin" /></div>;

  return (
    <div className="winner-upload-page container section animate-fade-in">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="auth-card glass-card mx-auto" style={{ maxWidth: '600px' }}>
        <div className="auth-header text-center">
          <div className="icon-badge mx-auto"><Upload size={24} /></div>
          <h2>Upload Winning Proof</h2>
          <p>Draw Month: <strong>{winner.drawId?.month}</strong></p>
          <div className="prize-badge">Prize: ₹{(winner.prizeAmount / 100).toFixed(2)}</div>
        </div>

        <div className="instruction-box glass-card">
          <h4>Verification Instructions</h4>
          <ul>
            <li>Take a clear screenshot or photo of your verified score card.</li>
            <li>Ensure the date and venue matches your logged score.</li>
            <li>Max file size: 5MB (JPG, PNG).</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-drop-zone" onClick={() => document.getElementById('file-input').click()}>
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="drop-prompt">
                <Upload size={40} className="text-dim" />
                <p>Click to browse or drag & drop proof image</p>
              </div>
            )}
            <input 
              id="file-input"
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <button className="btn btn-primary btn-full" disabled={uploading || !file}>
            {uploading ? <Loader className="animate-spin" /> : 'Submit Proof for Verification'}
          </button>
        </form>
      </div>

      <style>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .hidden { display: none; }
        
        .icon-badge {
          width: 60px;
          height: 60px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .prize-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 1.25rem;
          margin-top: 1rem;
        }
        
        .instruction-box {
          margin: 2rem 0;
          padding: 1.5rem !important;
          background: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.2);
        }
        .instruction-box h4 { margin-bottom: 0.75rem; color: var(--accent); }
        .instruction-box ul { list-style: none; padding: 0; font-size: 0.875rem; color: var(--text-muted); }
        .instruction-box li { margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem; }
        .instruction-box li::before { content: '•'; color: var(--accent); font-weight: bold; }
        
        .file-drop-zone {
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 2rem;
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .file-drop-zone:hover { border-color: var(--primary); background: rgba(16, 185, 129, 0.05); }
        
        .upload-preview { max-width: 100%; max-height: 300px; border-radius: var(--radius-sm); }
        .drop-prompt { color: var(--text-dim); }
        .drop-prompt p { margin-top: 1rem; font-size: 0.9375rem; }

        .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); margin-bottom: 2rem; width: fit-content; }
        .back-link:hover { color: var(--text-main); }
      `}</style>
    </div>
  );
};

export default WinnerUpload;
