import React from 'react';
import { ShieldCheck, Database, Info, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      style={{
        background: '#0F172A',
        color: '#94A3B8',
        borderTop: '1px solid #1E293B',
        padding: '3rem 1rem 2rem',
        marginTop: 'auto'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Brand Info */}
          <div>
            <h2 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.6rem' }}>
              ScholarAI
            </h2>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem', color: '#CBD5E1' }}>
              Find your funding. Unlock your future. An autonomous multi-agent copilot engineered to help Indian and international students discover verified scholarships with transparent eligibility verification.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10B981' }}>
              <ShieldCheck size={16} />
              <span>Zero-hallucination dataset verification standard</span>
            </div>
          </div>

          {/* Architecture & Multi-Agent */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              Multi-Agent Architecture
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>• Agent 1: Student Profile Analyzer</li>
              <li>• Agent 2: Scholarship Discovery Agent</li>
              <li>• Agent 3: Eligibility Assessment Agent</li>
              <li>• Agent 4: Ranking & Recommendation Agent</li>
            </ul>
          </div>

          {/* Data Transparency & Official Sources */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              Primary Verified Portals
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  National Scholarship Portal (NSP) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://online-inspire.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  DST INSPIRE Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.chevening.org" target="_blank" rel="noopener noreferrer" style={{ color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  Chevening UK Global Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.pmrf.in" target="_blank" rel="noopener noreferrer" style={{ color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  PMRF Doctoral Portal <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Disclaimer */}
        <div 
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '800px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Ethical Notice:</strong> ScholarAI is an assistive recommendation tool. Match scores and eligibility assessments reflect deterministic comparisons against published scheme guidelines. ScholarAI never approves or guarantees scholarship grants. Always submit applications directly through official awarding authorities.
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} ScholarAI Engine. Built with React & Node.js.
          </div>
        </div>
      </div>
    </footer>
  );
}
