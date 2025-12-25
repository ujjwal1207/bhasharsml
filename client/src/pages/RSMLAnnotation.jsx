import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RSMLAnnotation.css';

const RSMLAnnotation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [files, setFiles] = useState([]);
  const [segments, setSegments] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showGuidelines, setShowGuidelines] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const AUDIO_BASE = 'http://localhost:3000/data/audio/';

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    const batch = parseInt(searchParams.get('batch'));
    const file = parseInt(searchParams.get('file'));

    if (batch && batches.includes(batch)) {
      const batchIdx = batches.indexOf(batch);
      setCurrentBatchIndex(batchIdx);
      loadFiles(batch).then(() => {
        if (file) {
          const fileIdx = files.indexOf(file);
          if (fileIdx !== -1) {
            setCurrentFileIndex(fileIdx);
            loadSegments(batch, file);
          }
        }
      });
    }
  }, [searchParams, batches]);

  const loadBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/batches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('No voice data found in database. Please import CSV data first.');
        } else {
          setError(`Failed to load batches: ${res.status}`);
        }
        return;
      }
      
      const data = await res.json();
      const batchArray = Array.from({ length: data.max_batch }, (_, i) => i + 1);
      setBatches(batchArray);
    } catch (err) {
      setError('Failed to load batches');
      console.error(err);
    }
  };

  const loadFiles = async (batch) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/batch/${batch}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const fileArray = Array.from({ length: data.max_file }, (_, i) => i + 1);
      setFiles(fileArray);
      return fileArray;
    } catch (err) {
      setError('Failed to load files');
      console.error(err);
      return [];
    }
  };

  const loadSegments = async (batch, file) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/batch/${batch}/file/${file}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to load segments');
      }
      
      const data = await res.json();
      setSegments(data);
    } catch (err) {
      setError('Failed to load segments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = async (e) => {
    const idx = parseInt(e.target.value);
    setCurrentBatchIndex(idx);
    const batch = batches[idx];
    await loadFiles(batch);
    setCurrentFileIndex(0);
    updateURL(batch, files[0]);
  };

  const handleFileChange = (e) => {
    const idx = parseInt(e.target.value);
    setCurrentFileIndex(idx);
    const batch = batches[currentBatchIndex];
    const file = files[idx];
    updateURL(batch, file);
  };

  const handleLoad = async () => {
    if (currentBatchIndex === -1 || currentFileIndex === -1) {
      showToastMessage('Please select both batch and file', 'error');
      return;
    }
    const batch = batches[currentBatchIndex];
    const file = files[currentFileIndex];
    updateURL(batch, file);
    await loadSegments(batch, file);
  };

  const handlePrev = async () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    } else if (currentBatchIndex > 0) {
      setCurrentBatchIndex(currentBatchIndex - 1);
      const newBatch = batches[currentBatchIndex - 1];
      const newFiles = await loadFiles(newBatch);
      setCurrentFileIndex(newFiles.length - 1);
    } else {
      return;
    }
    
    const batch = batches[currentBatchIndex];
    const file = files[currentFileIndex];
    updateURL(batch, file);
    await loadSegments(batch, file);
  };

  const handleNext = async () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else if (currentBatchIndex < batches.length - 1) {
      setCurrentBatchIndex(currentBatchIndex + 1);
      const newBatch = batches[currentBatchIndex + 1];
      await loadFiles(newBatch);
      setCurrentFileIndex(0);
    } else {
      return;
    }
    
    const batch = batches[currentBatchIndex];
    const file = files[currentFileIndex];
    updateURL(batch, file);
    await loadSegments(batch, file);
  };

  const handleSave = async () => {
    setLoading(true);
    const batch = batches[currentBatchIndex];
    const file = files[currentFileIndex];
    
    const payload = segments.map(seg => ({
      segment: seg.segment,
      rsml: seg.rsml || seg.unsanitized_verbatim || ''
    }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/batch/${batch}/file/${file}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        showToastMessage('✅ ' + data.message, 'success');
      } else {
        showToastMessage('❌ Failed to save RSML', 'error');
      }
    } catch (err) {
      showToastMessage('❌ Error: Could not save RSML', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (batch, file) => {
    setSearchParams({ batch, file });
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSegmentChange = (index, value) => {
    const newSegments = [...segments];
    newSegments[index].rsml = value;
    setSegments(newSegments);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="rsml-container">
      {/* Header */}
      <header className="rsml-header">
        <div className="header-content">
          <h1>RSML Annotator</h1>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowGuidelines(true)}
            >
              <i className="bi bi-keyboard"></i> Shortcuts
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || segments.length === 0}
            >
              <i className="bi bi-save"></i> Save RSML
            </button>
            <span className="user-badge">👋 {user?.name}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="rsml-main">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="loader-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {/* Segments */}
        <div className="segments-container">
          {segments.map((segment, index) => (
            <SegmentCard
              key={`${segment.segment}-${index}`}
              segment={segment}
              index={index}
              audioBase={AUDIO_BASE}
              onChange={(value) => handleSegmentChange(index, value)}
            />
          ))}
          
          {segments.length === 0 && !loading && (
            <div className="empty-state">
              <p>Select a batch and file to start annotating</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="rsml-footer">
        <div className="footer-content">
          <div className="nav-buttons">
            <button 
              className="btn btn-outline" 
              onClick={handlePrev}
              disabled={loading || (currentBatchIndex === 0 && currentFileIndex === 0)}
            >
              <i className="bi bi-chevron-left"></i> Prev
            </button>
            <button 
              className="btn btn-outline" 
              onClick={handleNext}
              disabled={loading || (currentBatchIndex === batches.length - 1 && currentFileIndex === files.length - 1)}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          <div className="selectors">
            <div className="form-group">
              <label>Batch</label>
              <select 
                value={currentBatchIndex} 
                onChange={handleBatchChange}
                disabled={loading}
              >
                <option value={-1}>Select Batch</option>
                {batches.map((batch, idx) => (
                  <option key={batch} value={idx}>{batch}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>File Number</label>
              <select 
                value={currentFileIndex} 
                onChange={handleFileChange}
                disabled={loading || files.length === 0}
              >
                <option value={-1}>Select File</option>
                {files.map((file, idx) => (
                  <option key={file} value={idx}>{file}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleLoad}
              disabled={loading}
            >
              Load
            </button>
          </div>
        </div>
      </footer>

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="modal-overlay" onClick={() => setShowGuidelines(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>RSML Annotation Shortcuts</h2>
              <button onClick={() => setShowGuidelines(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="guideline-section">
                <h3>@ — Noise / Disfluency</h3>
                <code>@noise</code>, <code>@background-laughter</code>, <code>@umm</code>, <code>@cough</code>
              </div>
              <div className="guideline-section">
                <h3># — Entities</h3>
                <code>#PER&#123;राम&#125;(राम)</code><br/>
                <code>#ORG&#123;भारतीय रेल्वे&#125;(Indian Railways)</code><br/>
                <code>#GPE&#123;रायालसीमा&#125;(రాయలసీమ)</code>
              </div>
              <div className="guideline-section">
                <h3>[ ] — Code-mix</h3>
                <code>[स्टडी](study)</code>
              </div>
              <div className="guideline-section">
                <h3>&lt; &gt; — Mispronunciation</h3>
                <code>&lt;समझनाहीं&gt;(समझ नहीं)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

// Segment Card Component
const SegmentCard = ({ segment, index, audioBase, onChange }) => {
  const [rsmlValue, setRsmlValue] = useState(segment.rsml || segment.unsanitized_verbatim || '');
  const [renderedHTML, setRenderedHTML] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    renderRSML(rsmlValue);
  }, [rsmlValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setRsmlValue(value);
    onChange(value);
  };

  const renderRSML = (text) => {
    // Simple RSML rendering - replace tags with styled spans
    let rendered = text
      .replace(/@(\w+)/g, '<span class="tag-noise">@$1</span>')
      .replace(/#(\w+)\{([^}]+)\}\(([^)]+)\)/g, '<span class="tag-entity">#$1{$2}($3)</span>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="tag-codemix">[$1]($2)</span>')
      .replace(/<([^>]+)>\(([^)]+)\)/g, '<span class="tag-mispronunciation">&lt;$1&gt;($2)</span>');
    
    setRenderedHTML(rendered);
  };

  const audioPath = segment.audio ? audioBase + segment.audio : null;

  return (
    <div className="segment-card">
      <div className="segment-header">
        <span className="segment-badge">{segment.segment ?? index}</span>
      </div>

      <div className="segment-normalized">
        <strong>{segment.unsanitized_normalized || ''}</strong>
      </div>

      <div className="segment-content">
        <div className="segment-editor">
          <textarea
            ref={textareaRef}
            value={rsmlValue}
            onChange={handleChange}
            rows={5}
            placeholder="Enter RSML annotation..."
          />
        </div>
        <div className="segment-preview">
          <div 
            className="rendered-transcript"
            dangerouslySetInnerHTML={{ __html: renderedHTML }}
          />
        </div>
      </div>

      {audioPath && (
        <audio controls preload="metadata">
          <source src={audioPath} />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default RSMLAnnotation;
