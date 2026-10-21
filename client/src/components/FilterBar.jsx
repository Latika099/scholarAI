import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

export default function FilterBar({ filters, onChange, onReset, totalCount = 0 }) {
  return (
    <div 
      style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}
      >
        {/* Search */}
        <div style={{ gridColumn: 'span 2', minWidth: '240px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Search size={14} /> Search Scholarships & Providers
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Reliance, Chevening, PMRF, STEM, Medicine..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        {/* Scholarship Type */}
        <div>
          <label className="form-label">Provider Type</label>
          <select 
            className="form-select"
            value={filters.type || 'All'}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="All">All Types (Gov/Pvt/Intl)</option>
            <option value="Government">Government Schemes</option>
            <option value="Private">Private / Corporate CSR</option>
            <option value="International">Study Abroad / International</option>
            <option value="University">University Specific</option>
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className="form-label">Education Level</label>
          <select 
            className="form-select"
            value={filters.educationLevel || 'All'}
            onChange={(e) => onChange('educationLevel', e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, BA)</option>
            <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MA)</option>
            <option value="PhD">PhD / Doctoral</option>
            <option value="School">School (Class 9-12)</option>
            <option value="Diploma">Diploma / Polytechnic</option>
          </select>
        </div>

        {/* Funding Type */}
        <div>
          <label className="form-label">Funding Model</label>
          <select 
            className="form-select"
            value={filters.fundingType || 'All'}
            onChange={(e) => onChange('fundingType', e.target.value)}
          >
            <option value="All">All Funding Types</option>
            <option value="Fully Funded">Fully Funded (Tuition + Stipend)</option>
            <option value="Full Tuition">Full Tuition Waiver</option>
            <option value="Annual Stipend">Annual Cash Stipend</option>
            <option value="Monthly Stipend">Monthly Research Stipend</option>
            <option value="Lump Sum Grant">Lump Sum Grant</option>
          </select>
        </div>

        {/* Reset */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={onReset}
            style={{ width: '100%', height: '42px', padding: '0 0.8rem' }}
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          Showing <strong>{totalCount}</strong> verified opportunities matching filters
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Filter size={13} /> Active Filter Engine
        </span>
      </div>
    </div>
  );
}
