import React, { useState, useEffect } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { fetchScholarships } from '../services/api';
import FilterBar from '../components/FilterBar';
import ScholarshipCard from '../components/ScholarshipCard';
import { Sparkles, ArrowUpDown, Loader2, Frown, CheckCircle } from 'lucide-react';

export default function Discovery() {
  const { setCurrentView } = useScholarship();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    educationLevel: 'All',
    fundingType: 'All'
  });

  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'deadline', 'score', 'income'

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchScholarships(filters);
      setScholarships(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'All',
      educationLevel: 'All',
      fundingType: 'All'
    });
  };

  // Sorting
  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadlineDate) return 1;
      if (!b.deadlineDate) return -1;
      return new Date(a.deadlineDate) - new Date(b.deadlineDate);
    }
    if (sortBy === 'score') {
      return (b.minimumAcademicScore || 0) - (a.minimumAcademicScore || 0);
    }
    if (sortBy === 'income') {
      return (a.maximumAnnualFamilyIncomeINR || 99999999) - (b.maximumAnnualFamilyIncomeINR || 99999999);
    }
    return 0; // Default order
  });

  return (
    <div>
      {/* Page Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Scholarship Discovery Directory
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Search, filter, and review verified scholarship programs from government ministries, top corporate foundations, and global universities.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setCurrentView('matches')}
        >
          <Sparkles size={16} />
          <span>Run AI Matching Engine</span>
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        onChange={handleFilterChange} 
        onReset={handleResetFilters}
        totalCount={sortedScholarships.length}
      />

      {/* Sorting Control */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ArrowUpDown size={14} /> Sort By:
        </span>
        <select 
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Default / Featured</option>
          <option value="deadline">Upcoming Deadline (Earliest First)</option>
          <option value="score">Academic Cutoff (Highest First)</option>
          <option value="income">Family Income Cap (Lowest First)</option>
        </select>
      </div>

      {/* Content State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} color="var(--primary-600)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Filtering scholarship records from knowledge base...
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', borderColor: '#FECACA' }}>
          <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: '1rem' }}>
            Failed to load scholarships: {error}
          </p>
          <button className="btn btn-secondary" onClick={loadData}>
            Try Again
          </button>
        </div>
      ) : sortedScholarships.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Frown size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No scholarships found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            No opportunities matched your active filter combination. Try resetting your filters to view all verified records.
          </p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {sortedScholarships.map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      )}
    </div>
  );
}
