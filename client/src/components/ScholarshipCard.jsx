import React from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { 
  Bookmark, 
  CheckCircle2, 
  Calendar, 
  Coins, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function ScholarshipCard({ scholarship }) {
  const { isSaved, toggleSave, openModal } = useScholarship();
  const saved = isSaved(scholarship.id);

  // Type badge style
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Government': return 'badge-gov';
      case 'Private': return 'badge-pvt';
      case 'International': return 'badge-intl';
      case 'University': return 'badge-univ';
      default: return 'badge-gov';
    }
  };

  // Eligibility badge style
  const renderEligibilityBadge = () => {
    if (!scholarship.eligibilityStatus) return null;

    if (scholarship.eligibilityStatus === 'ELIGIBLE') {
      return (
        <span className="badge badge-eligible">
          <CheckCircle2 size={13} /> Fully Eligible
        </span>
      );
    }
    if (scholarship.eligibilityStatus === 'POTENTIALLY_ELIGIBLE') {
      return (
        <span className="badge badge-potential">
          <HelpCircle size={13} /> Potentially Eligible
        </span>
      );
    }
    return (
      <span className="badge badge-ineligible">
        <AlertCircle size={13} /> Ineligible
      </span>
    );
  };

  return (
    <div 
      className="card card-clickable" 
      onClick={() => openModal(scholarship)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Badges & Bookmark */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span className={`badge ${getTypeBadgeClass(scholarship.scholarshipType)}`}>
              {scholarship.scholarshipType}
            </span>
            {scholarship.verifiedStatus === 'VERIFIED' ? (
              <span className="badge badge-verified">
                <ShieldCheck size={12} /> Verified
              </span>
            ) : (
              <span className="badge badge-demo">
                Demo
              </span>
            )}
            {renderEligibilityBadge()}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(scholarship.id);
            }}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              color: saved ? 'var(--primary-600)' : 'var(--text-muted)'
            }}
            title={saved ? 'Remove from Saved' : 'Save Scholarship'}
          >
            <Bookmark size={16} fill={saved ? 'var(--primary-600)' : 'none'} />
          </button>
        </div>

        {/* Title & Provider */}
        <h3 
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '0.35rem',
            lineHeight: 1.35,
            color: 'var(--text-primary)'
          }}
        >
          {scholarship.name}
        </h3>
        <p 
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem'
          }}
        >
          {scholarship.provider}
        </p>

        {/* Match Score Meter if provided */}
        {scholarship.matchScore !== undefined && (
          <div 
            style={{
              background: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              border: '1px solid var(--primary-100)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.3rem'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-800)' }}>
                ScholarAI Match Score
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                {scholarship.matchScore}%
              </span>
            </div>
            {/* Progress bar */}
            <div 
              style={{
                width: '100%',
                height: '6px',
                background: 'var(--primary-200)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  width: `${scholarship.matchScore}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))',
                  borderRadius: 'var(--radius-full)'
                }}
              />
            </div>
          </div>
        )}

        {/* Key Highlights Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.6rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Coins size={14} color="var(--primary-600)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {scholarship.fundingType}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="var(--primary-600)" />
            <span>{scholarship.deadline}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', gridColumn: 'span 2' }}>
            <GraduationCap size={14} color="var(--primary-600)" />
            <span>{scholarship.eligibleEducationLevels.join(', ')}</span>
          </div>
        </div>

        {/* Short Description */}
        <p 
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {scholarship.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div 
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span 
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--primary-700)'
          }}
        >
          {scholarship.awardAmount.split('(')[0]}
        </span>

        <button 
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          onClick={(e) => {
            e.stopPropagation();
            openModal(scholarship);
          }}
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
