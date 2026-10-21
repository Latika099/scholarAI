import React, { useState, useEffect } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { runMatchingPipeline } from '../services/api';
import AgentActivityPanel from '../components/AgentActivityPanel';
import ScholarshipCard from '../components/ScholarshipCard';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  UserCheck, 
  Loader2, 
  Info,
  ShieldCheck,
  Award,
  ExternalLink,
  FileEdit,
  Zap,
  Calendar,
  Coins,
  MapPin,
  Clock
} from 'lucide-react';

export default function Matches() {
  const { 
    profile, 
    pipelineResults, 
    setPipelineResults, 
    isMatchingRunning, 
    setIsMatchingRunning, 
    setCurrentView,
    openModal,
    openSopModal,
    resetToRahulScenario
  } = useScholarship();

  const [activeTab, setActiveTab] = useState('TOP_FIVE'); // 'TOP_FIVE', 'ALL', 'ELIGIBLE', 'POTENTIALLY_ELIGIBLE', 'INELIGIBLE'
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pipelineResults && !isMatchingRunning) {
      executePipeline();
    }
  }, []);

  const executePipeline = async () => {
    try {
      setIsMatchingRunning(true);
      setError(null);
      const result = await runMatchingPipeline(profile);
      setPipelineResults(result);
    } catch (err) {
      console.error('Matching pipeline failed:', err);
      setError(err.message || 'Failed to execute matching pipeline');
    } finally {
      setIsMatchingRunning(false);
    }
  };

  const handleQuickRahulRun = () => {
    resetToRahulScenario();
    executePipeline();
  };

  const rankedScholarships = pipelineResults?.rankedScholarships || [];
  const topFive = pipelineResults?.topFiveRecommendations || rankedScholarships.slice(0, 5);

  // Filter list depending on tab
  const getFilteredList = () => {
    if (activeTab === 'TOP_FIVE') return topFive;
    if (activeTab === 'ALL') return rankedScholarships;
    return rankedScholarships.filter(s => s.eligibilityStatus === activeTab);
  };

  const currentDisplayList = getFilteredList();

  const stats = pipelineResults?.statistics || {
    eligibleCount: rankedScholarships.filter(s => s.eligibilityStatus === 'ELIGIBLE').length,
    potentiallyCount: rankedScholarships.filter(s => s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE').length,
    ineligibleCount: rankedScholarships.filter(s => s.eligibilityStatus === 'INELIGIBLE').length,
    totalEvaluated: rankedScholarships.length
  };

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Sparkles size={16} /> Autonomous 4-Agent Pipeline
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            AI-Ranked Scholarship Matches
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Evaluated for <strong>{profile.fullName || 'Student'}</strong> ({profile.degree || profile.educationLevel}, Score: {profile.academicScore || 80}%, Destinations: {(profile.targetDestinations || []).join(', ')})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleQuickRahulRun}
            title="Load Rahul's demo profile and run pipeline"
          >
            <Zap size={14} color="var(--primary-600)" />
            <span>Run Rahul Scenario</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentView('profile')}
          >
            <UserCheck size={14} />
            <span>Edit Profile</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={executePipeline}
            disabled={isMatchingRunning}
          >
            {isMatchingRunning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                <span>Rerun Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="card" style={{ padding: '1.5rem', borderColor: '#FECACA', background: '#FEF2F2', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>Pipeline Execution Failed</span>
          </div>
          <p style={{ color: '#991B1B', fontSize: '0.88rem', margin: '0.5rem 0 1rem' }}>
            {error}
          </p>
          <button className="btn btn-secondary btn-sm" onClick={executePipeline}>
            Retry Pipeline
          </button>
        </div>
      )}

      {/* Live Agent Activity Panel (Visual Trace of all 4 Agents) */}
      {pipelineResults && (
        <AgentActivityPanel 
          executionTrace={pipelineResults.executionTrace} 
          totalDurationMs={pipelineResults.totalPipelineDurationMs} 
        />
      )}

      {/* Tab Navigation */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('TOP_FIVE')}
            className={`btn ${activeTab === 'TOP_FIVE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={activeTab === 'TOP_FIVE' ? { background: 'linear-gradient(135deg, var(--accent-600), var(--primary-600))' } : {}}
          >
            <Award size={14} />
            <span>Top 5 Recommendations ({topFive.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <span>All Matches ({stats.totalEvaluated})</span>
          </button>

          <button
            onClick={() => setActiveTab('ELIGIBLE')}
            className={`btn ${activeTab === 'ELIGIBLE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <CheckCircle2 size={13} color="#059669" />
            <span>Fully Eligible ({stats.eligibleCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('POTENTIALLY_ELIGIBLE')}
            className={`btn ${activeTab === 'POTENTIALLY_ELIGIBLE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <HelpCircle size={13} color="#D97706" />
            <span>Potentially Eligible ({stats.potentiallyCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('INELIGIBLE')}
            className={`btn ${activeTab === 'INELIGIBLE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <AlertCircle size={13} color="#DC2626" />
            <span>Ineligible ({stats.ineligibleCount})</span>
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Curated by Agent 4 Ranking & Recommendation Engine</span>
        </div>
      </div>

      {/* Top 5 Recommendations Banner */}
      {activeTab === 'TOP_FIVE' && pipelineResults && (
        <div 
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #EEF2FF 100%)',
            border: '1.5px solid #BBF7D0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Award size={20} color="#059669" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065F46', margin: 0 }}>
              Top 5 Trustworthy Scholarship Recommendations
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            {pipelineResults.topFiveExplanation || `Prioritized by eligibility criteria satisfaction, academic score fit, target destination match (${(profile.targetDestinations || []).join(', ')}), and funding coverage.`}
          </p>
        </div>
      )}

      {/* Main Results Container */}
      {isMatchingRunning ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} color="var(--primary-600)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Multi-Agent Pipeline in Progress
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Agent 1 analyzing profile • Agent 2 querying public registries • Agent 3 assessing criteria • Agent 4 ranking top opportunities...
          </p>
        </div>
      ) : currentDisplayList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No scholarships found in category: {activeTab}.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('TOP_FIVE')} style={{ marginTop: '0.75rem' }}>
            View Top 5 Recommendations
          </button>
        </div>
      ) : activeTab === 'TOP_FIVE' ? (
        /* Detailed Top 5 View (Hackathon Requirement D) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentDisplayList.map((sch, index) => {
            const satisfiedCriteria = (sch.criteriaResults || []).filter(c => c.status === 'SATISFIED');
            const unmetCriteria = (sch.criteriaResults || []).filter(c => c.status === 'UNMET');
            const unknownCriteria = (sch.criteriaResults || []).filter(c => c.status === 'UNKNOWN');

            return (
              <div 
                key={sch.id}
                className="card"
                style={{
                  border: index === 0 ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                  position: 'relative',
                  padding: '1.75rem'
                }}
              >
                {/* Ranking Pill */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span 
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, var(--primary-600), var(--accent-600))' : 'var(--primary-100)',
                        color: index === 0 ? 'white' : 'var(--primary-800)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      Recommendation #{index + 1}
                    </span>
                    <span className="badge badge-gov">{sch.scholarshipType}</span>
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} /> {sch.verificationStatus || 'CONFIRMED FACT'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Match Confidence</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        {sch.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Provider */}
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {sch.name}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {sch.provider} • Host Destination: <strong>{(sch.targetDestinations || []).join(', ') || 'Global'}</strong>
                </p>

                {/* Why it matches callout */}
                <div 
                  style={{
                    background: 'var(--primary-50)',
                    border: '1px solid var(--primary-100)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.88rem',
                    color: 'var(--primary-900)'
                  }}
                >
                  <strong>Why it matches:</strong> {sch.matchRationale || sch.explanation}
                </div>

                {/* Key Metrics Grid */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    background: 'var(--bg-page)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Coins size={13} /> Funding Amount
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-800)' }}>
                      {sch.isAmountUnknown ? 'Unknown / Dependent on Course' : sch.awardAmount}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} /> Official Deadline
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sch.isDeadlineUnknown ? 'Unknown / Rolling Admissions' : sch.deadline}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} /> Destination Country
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {(sch.targetDestinations || []).join(', ') || 'Any'}
                    </span>
                  </div>
                </div>

                {/* Published Criteria Breakdown (Satisfied / Unmet / Unknown) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Published Eligibility Criteria Satisfaction:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {satisfiedCriteria.map((c, i) => (
                      <span key={`sat-${i}`} className="badge badge-eligible" title={c.message}>
                        <CheckCircle2 size={12} /> {c.criterion}: Satisfied
                      </span>
                    ))}
                    {unknownCriteria.map((c, i) => (
                      <span key={`unk-${i}`} className="badge badge-potential" title={c.message}>
                        <HelpCircle size={12} /> {c.criterion}: Needs Verification
                      </span>
                    ))}
                    {unmetCriteria.map((c, i) => (
                      <span key={`unm-${i}`} className="badge badge-ineligible" title={c.message}>
                        <AlertCircle size={12} /> {c.criterion}: Unmet
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application Instructions & Next Action */}
                <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Application Instructions:</strong> {sch.applicationInstructions || 'Apply through official awarding portal with required academic transcripts.'}</div>
                  <div style={{ marginTop: '0.35rem' }}><strong>Recommended Next Action:</strong> {sch.recommendedNextAction}</div>
                </div>

                {/* Action Buttons: Draft SOP, View Details, Official Link */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => openSopModal(sch)}
                      style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--primary-600))' }}
                    >
                      <FileEdit size={14} />
                      <span>Draft Statement of Purpose</span>
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => openModal(sch)}
                    >
                      <span>View Full Criteria</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {sch.sourceUrl && (
                      <a 
                        href={sch.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <span>Official Guidelines</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    <a 
                      href={sch.officialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>Apply on Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Grid View for All / Eligible / Ineligible */
        <div className="grid-3">
          {currentDisplayList.map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      )}
    </div>
  );
}
