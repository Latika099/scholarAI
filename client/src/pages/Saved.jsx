import React, { useState, useEffect } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { fetchScholarships } from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';
import { Bookmark, Search, ArrowRight, Frown } from 'lucide-react';

export default function Saved() {
  const { savedIds, setCurrentView } = useScholarship();
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        setLoading(true);
        const all = await fetchScholarships();
        const filtered = all.filter(s => savedIds.includes(s.id));
        setSavedScholarships(filtered);
      } catch (err) {
        console.error('Failed loading saved scholarships', err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, [savedIds]);

  return (
    <div>
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Bookmark size={16} fill="var(--primary-600)" />
            <span>Personal Watchlist</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Saved Scholarships ({savedScholarships.length})
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Track application deadlines and organize your prioritized scholarship opportunities stored in local storage.
          </p>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentView('discovery')}
        >
          <Search size={16} />
          <span>Browse More Opportunities</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your saved scholarships...</p>
        </div>
      ) : savedScholarships.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            maxWidth: '520px', 
            margin: '2rem auto' 
          }}
        >
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Bookmark size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No scholarships saved yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            When browsing opportunities in the directory or AI matching results, click the bookmark icon to save scholarships here for quick review.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentView('discovery')}
          >
            <span>Explore Scholarships</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {savedScholarships.map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      )}
    </div>
  );
}
