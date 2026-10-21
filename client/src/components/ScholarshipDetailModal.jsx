import React from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  Calendar,
  Coins,
  GraduationCap,
  Building,
  FileText,
  ListOrdered,
  FileEdit
} from 'lucide-react';

export default function ScholarshipDetailModal() {
  const { activeScholarshipModal, closeModal, isSaved, toggleSave, openSopModal } = useScholarship();

  if (!activeScholarshipModal) return null;

  const s = activeScholarshipModal;
  const saved = isSaved(s.id);

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem' }}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gov">{s.scholarshipType}</span>
              {s.verifiedStatus === 'VERIFIED' ? (
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> Verified Data
                </span>
              ) : (
                <span className="badge badge-demo">Demo Data</span>
              )}
              {s.lastVerified && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified: {s.lastVerified}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {s.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={15} />
              <span>{s.provider}</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => toggleSave(s.id)}
              className="btn btn-secondary btn-sm"
              title={saved ? 'Remove from Saved' : 'Save Scholarship'}
              style={{ padding: '0.5rem' }}
            >
              <Bookmark size={18} fill={saved ? 'var(--primary-600)' : 'none'} color={saved ? 'var(--primary-600)' : 'currentColor'} />
            </button>
            <button
              onClick={closeModal}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Match / Eligibility Banner (if available) */}
        {s.eligibilityStatus && (
          <div 
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              background: s.eligibilityStatus === 'ELIGIBLE' ? '#ECFDF5' : s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE' ? '#FFFBEB' : '#FEF2F2',
              border: `1px solid ${s.eligibilityStatus === 'ELIGIBLE' ? '#A7F3D0' : s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE' ? '#FDE68A' : '#FECACA'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {s.eligibilityStatus === 'ELIGIBLE' && <CheckCircle2 size={18} color="#059669" />}
                {s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE' && <HelpCircle size={18} color="#D97706" />}
                {s.eligibilityStatus === 'INELIGIBLE' && <XCircle size={18} color="#DC2626" />}
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {s.eligibilityStatus === 'ELIGIBLE' ? 'Fully Eligible Match' : s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE' ? 'Potentially Eligible (Verification Required)' : 'Currently Ineligible'}
                </span>
              </div>

              {s.matchScore !== undefined && (
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-700)' }}>
                  {s.matchScore}% Match
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {s.explanation}
            </p>
          </div>
        )}

        {/* Criterion-Level Breakdown if available */}
        {s.criteriaResults && s.criteriaResults.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" />
              <span>Criterion-by-Criterion Evaluation</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {s.criteriaResults.map((c, i) => {
                const isPass = c.status === 'PASS';
                const isFail = c.status === 'FAIL';
                const isBorder = c.status === 'BORDERLINE';
                const isUnknown = c.status === 'UNKNOWN';

                return (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-page)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isPass && <CheckCircle2 size={15} color="#10B981" />}
                      {isFail && <XCircle size={15} color="#EF4444" />}
                      {isBorder && <AlertCircle size={15} color="#F59E0B" />}
                      {isUnknown && <HelpCircle size={15} color="#6B7280" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.criterion}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {c.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overview & Key Data Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-page)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Award Value</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: '0.95rem' }}>
              {s.awardAmount}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Application Deadline</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {s.deadline}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Funding Type</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {s.fundingType}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Family Income Ceiling</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {s.maximumAnnualFamilyIncomeINR ? `₹${s.maximumAnnualFamilyIncomeINR.toLocaleString('en-IN')}/yr` : 'No Income Cap'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Program Overview
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {s.description}
          </p>
        </div>

        {/* Explicit Requirements List */}
        {s.requirements && s.requirements.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="var(--primary-600)" />
              <span>Official Eligibility Requirements</span>
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {s.requirements.map((req, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Next Steps from Agent 4 */}
        {s.nextSteps && s.nextSteps.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ListOrdered size={16} color="var(--primary-600)" />
              <span>Actionable Application Checklist</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {s.nextSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-600)', minWidth: '18px' }}>{idx + 1}.</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Action Buttons */}
        <div 
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {s.sourceUrl && (
              <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                View Official Guidelines PDF <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                closeModal();
                openSopModal(s);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileEdit size={15} />
              <span>Draft SOP</span>
            </button>
            <button className="btn btn-secondary" onClick={closeModal}>
              Close
            </button>
            <a 
              href={s.officialUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <span>Visit Official Application Portal</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
