import React, { useState, useEffect } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { generateDraftSOP } from '../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function SopModal() {
  const { activeSopScholarship, closeSopModal, profile } = useScholarship();
  const [draftData, setDraftData] = useState(null);
  const [editableText, setEditableText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeSopScholarship) {
      loadDraft();
    } else {
      setDraftData(null);
      setEditableText('');
      setCopied(false);
      setError(null);
    }
  }, [activeSopScholarship]);

  const loadDraft = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await generateDraftSOP(activeSopScholarship, profile);
      setDraftData(res);
      setEditableText(res.draftContent || '');
    } catch (err) {
      setError(err.message || 'Failed to generate statement of purpose');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeSopScholarship) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editableText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SOP_${activeSopScholarship.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = editableText.trim() ? editableText.trim().split(/\s+/).length : 0;

  return (
    <div className="modal-overlay" onClick={closeSopModal}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', padding: '2rem' }}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Sparkles size={15} /> Application Assistant • Tailored Statement of Purpose
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
              {activeSopScholarship.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Provider: {activeSopScholarship.provider} • Target Destination: {(activeSopScholarship.targetDestinations || []).join(', ') || 'Global'}
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={closeSopModal}
            aria-label="Close SOP Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ethical Warning Box */}
        <div 
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.82rem',
            color: 'var(--warning-text)'
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Ethical Application Notice:</strong> This draft is an assistive baseline generated strictly from your self-reported profile and verified opportunity requirements. <strong>ScholarAI will NEVER submit applications automatically.</strong> You must review, customize, and submit through the official awarding portal.
          </span>
        </div>

        {/* Missing Information Notice */}
        {draftData?.missingInformation && draftData.missingInformation.length > 0 && (
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} color="#D97706" /> Missing Information Identified in Profile (Placeholders inserted):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
              {draftData.missingInformation.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Synthesizing tailored SOP grounded in {activeSopScholarship.name} requirements...
            </p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#FECACA' }}>
            <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{error}</p>
            <button className="btn btn-secondary" onClick={loadDraft}>Retry</button>
          </div>
        ) : (
          <div>
            {/* Action Bar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Word Count: <strong>{wordCount}</strong> words (Estimated 2-page essay)
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownload}
                  title="Download draft as text file"
                >
                  <Download size={14} />
                  <span>Download .txt</span>
                </button>

                <button 
                  className={`btn ${copied ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={handleCopy}
                  title="Copy draft to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <textarea
              className="form-textarea"
              style={{
                width: '100%',
                height: '380px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                background: '#F8FAFC'
              }}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder="Your Statement of Purpose draft will appear here..."
            />
          </div>
        )}

        {/* Footer */}
        <div 
          style={{
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <a
            href={activeSopScholarship.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <span>Visit Official Application Portal</span>
            <ExternalLink size={13} />
          </a>

          <button className="btn btn-primary btn-sm" onClick={closeSopModal}>
            Done Reviewing Draft
          </button>
        </div>
      </div>
    </div>
  );
}
