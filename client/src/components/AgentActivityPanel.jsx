import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function AgentActivityPanel({ executionTrace = [], totalDurationMs = 0 }) {
  const [expandedStep, setExpandedStep] = useState(null);

  if (!executionTrace || executionTrace.length === 0) {
    return null;
  }

  const toggleExpand = (stepNum) => {
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <div className="agent-pipeline-box">
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Live Multi-Agent Pipeline Activity
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Sequential execution trace across 4 specialized backend intelligence agents
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <Clock size={14} />
            <span>Total: {totalDurationMs} ms</span>
          </div>

          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              border: '1px solid var(--success-border)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={14} />
            <span>All 4 Agents Completed</span>
          </div>
        </div>
      </div>

      {/* Sequential Agent Nodes */}
      <div>
        {executionTrace.map((agent) => {
          const isExpanded = expandedStep === agent.step;

          return (
            <div key={agent.step} className="agent-step-item">
              <div className="agent-step-node">
                {agent.step}
              </div>

              <div 
                style={{
                  background: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(agent.step)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={17} color="var(--primary-600)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {agent.agentName}
                    </span>
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-page)',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px'
                      }}
                    >
                      {agent.durationMs}ms
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      className={`badge ${agent.status === 'SUCCESS' ? 'badge-verified' : 'badge-demo'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {agent.status}
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                      title="Inspect agent trace details"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                <p 
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.45rem',
                    marginBottom: 0
                  }}
                >
                  {agent.summary}
                </p>

                {/* Expanded Raw Details */}
                {isExpanded && agent.details && (
                  <div 
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: '#0F172A',
                      color: '#E2E8F0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto'
                    }}
                  >
                    <div style={{ color: '#93C5FD', marginBottom: '0.35rem', fontWeight: 600 }}>
                      // Agent Output Payload
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(agent.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
