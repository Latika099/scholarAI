import express from 'express';

const router = express.Router();

// GET /api/agents/status - Return health and metadata of all 4 pipeline agents
router.get('/status', (req, res) => {
  const agents = [
    {
      id: 'agent_profile_analyzer',
      name: 'Agent 1: Student Profile Analyzer',
      role: 'Validates inputs, normalizes score/income scales, checks completeness and missing fields',
      status: 'ONLINE',
      mode: 'Deterministic JSON Parser & Validator',
      version: '1.0.0'
    },
    {
      id: 'agent_discovery',
      name: 'Agent 2: Scholarship Discovery Agent',
      role: 'Filters 18+ verified records by education level, geography, and thematic domain',
      status: 'ONLINE',
      mode: 'Indexed In-Memory Dataset Search',
      version: '1.0.0'
    },
    {
      id: 'agent_eligibility',
      name: 'Agent 3: Eligibility Assessment Agent',
      role: 'Evaluates criteria (Education, Score, Income, Field, Demographics) with criterion-level explanations',
      status: 'ONLINE',
      mode: 'Rule-Based Deterministic Evaluator',
      version: '1.0.0'
    },
    {
      id: 'agent_ranking',
      name: 'Agent 4: Ranking & Recommendation Agent',
      role: 'Calculates weighted match score (0-100) and actionable application checklists',
      status: 'ONLINE',
      mode: 'Multi-Factor Scoring Matrix',
      version: '1.0.0'
    }
  ];

  res.json({
    success: true,
    pipeline: 'ScholarAI Multi-Agent Pipeline',
    activeAgentsCount: agents.length,
    agents,
    timestamp: new Date().toISOString()
  });
});

export default router;
