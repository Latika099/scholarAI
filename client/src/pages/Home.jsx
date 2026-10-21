import React, { useEffect, useState } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { fetchScholarshipStats, fetchScholarships } from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  Bot, 
  Search, 
  FileCheck2, 
  Award,
  Globe2,
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';

export default function Home() {
  const { setCurrentView } = useScholarship();
  const [stats, setStats] = useState(null);
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [statsData, listData] = await Promise.all([
          fetchScholarshipStats(),
          fetchScholarships()
        ]);
        setStats(statsData);
        // Pick 4 diverse, high-value featured scholarships
        const featuredIds = ['sch-001', 'sch-002', 'sch-006', 'sch-012'];
        const featured = listData.filter(s => featuredIds.includes(s.id));
        setFeaturedScholarships(featured.length ? featured : listData.slice(0, 4));
      } catch (err) {
        console.error('Failed loading home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section 
        style={{
          background: 'radial-gradient(ellipse at top, #EEF2FF 0%, #FFFFFF 70%)',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '1px solid var(--primary-100)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'white',
              border: '1px solid var(--primary-200)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              color: 'var(--primary-700)',
              fontWeight: 600,
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Sparkles size={15} color="var(--primary-600)" />
            <span>Autonomous 4-Agent Scholarship Pipeline</span>
          </div>

          {/* Headline */}
          <h1 
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: 'var(--text-primary)'
            }}
          >
            Find your funding. <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Unlock your future.
            </span>
          </h1>

          {/* Subheading */}
          <p 
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '680px',
              margin: '0 auto 2.25rem'
            }}
          >
            An AI scholarship copilot that helps students discover funding opportunities, understand eligibility with zero ambiguity, and prioritize applications with confidence.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentView('matches')}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>Start Finding Scholarships</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentView('discovery')}
              style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}
            >
              <Search size={18} />
              <span>Explore All Opportunities</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Statistics from Verified Dataset */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ color: 'var(--primary-600)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats ? stats.totalCount : '18+'}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Verified Opportunities
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ color: '#2563EB', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={28} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.byType?.Government || 6}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Central & State Govt Schemes
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ color: '#9333EA', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <TrendingUp size={28} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.byType?.Private || 6}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Top Corporate CSR Grants
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ color: '#059669', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Globe2 size={28} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.byType?.International || 5}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Fully Funded Global Fellowships
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Featured Scholarship Opportunities
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Prestigious verified funding options for Indian undergraduate, postgraduate, and doctoral students
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentView('discovery')}
          >
            <span>View All ({stats ? stats.totalCount : '18'})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-2">
          {featuredScholarships.map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      </section>

      {/* How the Multi-Agent System Works */}
      <section 
        style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          marginBottom: '4rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.75rem'
            }}
          >
            <Cpu size={14} />
            <span>Architecture Overview</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How ScholarAI's Multi-Agent Pipeline Works
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Instead of generic AI chatbots that guess eligibility, ScholarAI executes four discrete, independently verifiable agent modules in sequence.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            position: 'relative'
          }}
        >
          {/* Agent 1 */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-600)',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Student Profile Analyzer
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Validates and normalizes your self-reported inputs (converting 10-point CGPAs, family income in INR, education levels) and identifies missing qualifications.
            </p>
          </div>

          {/* Agent 2 */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-600)',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Scholarship Discovery Agent
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Queries the verified knowledge base for scholarships matching your degree level, citizenship, and academic field, logging all filter parameters applied.
            </p>
          </div>

          {/* Agent 3 */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-600)',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Eligibility Assessment Agent
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Evaluates mandatory criteria (percentage cutoff, income ceiling, level, discipline) and tags each opportunity as Eligible, Potentially Eligible, or Ineligible.
            </p>
          </div>

          {/* Agent 4 */}
          <div 
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-600)',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              4
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Ranking & Recommendation Agent
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Calculates a transparent match score (0-100) across 5 weighted vectors and provides a customized document and preparation checklist for each match.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Data Transparency Section */}
      <section 
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          color: 'white',
          marginBottom: '2rem'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A5B4FC', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldCheck size={18} />
            <span>ETHICAL AI STANDARD</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
            Grounded in Real Data. Zero Fabricated Deadlines.
          </h2>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: '#A5B4FC', marginBottom: '0.5rem' }}>
                <FileCheck2 size={22} />
              </div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                Verified Official Guidelines
              </h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: 1.5 }}>
                Every scholarship is verified against official government portals (NSP, DST, MoE) or accredited private foundations with verified PDF source links.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: '#A5B4FC', marginBottom: '0.5rem' }}>
                <Lock size={22} />
              </div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                Privacy & Data Security
              </h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: 1.5 }}>
                ScholarAI does not ask for or store Aadhaar numbers, bank account details, or sensitive government credentials. Your profile is stored locally in your browser.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: '#A5B4FC', marginBottom: '0.5rem' }}>
                <Bot size={22} />
              </div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                No Hallucinated Decisions
              </h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: 1.5 }}>
                Match scores reflect explicit rule evaluations. ScholarAI never claims official scholarship approval and always directs students to submit directly to authorities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
