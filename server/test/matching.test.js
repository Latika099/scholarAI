import test from 'node:test';
import assert from 'node:assert';
import { analyzeStudentProfile } from '../src/agents/profileAnalyzer.js';
import { assessEligibility } from '../src/agents/eligibilityAgent.js';
import { rankAndRecommend } from '../src/agents/rankingAgent.js';
import { runScholarshipPipeline } from '../src/agents/orchestrator.js';
import { loadScholarships } from '../src/services/scholarshipService.js';
import { draftStatementOfPurpose } from '../src/services/sopDrafter.js';

test('Agent 1: Profile Analyzer normalizes CGPA, destinations, and computes completeness', () => {
  const profile = {
    fullName: 'Rahul Sharma',
    educationLevel: 'Undergraduate',
    degree: 'B.Tech in Computer Science',
    institution: 'NIT Jalandhar',
    graduationYear: 2026,
    academicScore: 8.2, // 10-scale CGPA
    annualFamilyIncomeINR: 550000,
    fieldOfStudy: 'Computer Science',
    targetDestinations: ['Canada', 'Germany', 'Singapore'],
    skills: ['Python', 'PyTorch', 'Machine Learning', 'NLP'],
    achievements: 'Inter-College AI Hackathon Winner'
  };

  const result = analyzeStudentProfile(profile);
  assert.strictEqual(result.status, 'SUCCESS');
  assert.strictEqual(result.normalizedProfile.scoreScale, 'cgpa_10');
  assert.ok(result.normalizedProfile.academicScore >= 77, 'CGPA converted to standard percentage');
  assert.strictEqual(result.normalizedProfile.targetDestinations.length, 3, 'Destinations preserved');
  assert.ok(result.normalizedProfile.completenessScore >= 80, 'High completeness score');
});

test('Agent 3: Eligibility Assessment marks SATISFIED, UNMET, and UNKNOWN criteria', () => {
  const scholarships = loadScholarships();
  assert.ok(scholarships.length >= 10, 'Dataset contains at least 10 real opportunities');

  const rahulProfile = {
    fullName: 'Rahul Sharma',
    educationLevel: 'Undergraduate',
    academicScore: 78.0,
    annualFamilyIncomeINR: 550000,
    fieldOfStudy: 'Computer Science',
    targetDestinations: ['Singapore', 'Germany', 'Canada'],
    graduationYear: 2026
  };

  const assessment = assessEligibility(rahulProfile, scholarships);
  assert.strictEqual(assessment.status, 'SUCCESS');

  // Check SINGA (Singapore) eligibility
  const singa = assessment.evaluatedCandidates.find(s => s.id === 'sch-004');
  assert.ok(singa, 'SINGA exists in dataset');
  const destCrit = singa.criteriaResults.find(c => c.criterion === 'Study Destination');
  assert.strictEqual(destCrit.status, 'SATISFIED', 'Destination Singapore is satisfied');

  // Check income-capped scheme where 5.5L exceeds 2.5L limit (Post-Matric)
  const postMatric = assessment.evaluatedCandidates.find(s => s.id === 'sch-015');
  assert.ok(postMatric, 'Post-Matric exists');
  assert.strictEqual(postMatric.eligibilityStatus, 'INELIGIBLE');
  const incomeCrit = postMatric.criteriaResults.find(c => c.criterion === 'Financial Need / Income');
  assert.strictEqual(incomeCrit.status, 'UNMET');
});

test('Agent 4: Curates Top 5 Recommendations with criteria satisfaction', () => {
  const scholarships = loadScholarships();
  const rahulProfile = {
    fullName: 'Rahul Sharma',
    educationLevel: 'Undergraduate',
    academicScore: 78.0,
    annualFamilyIncomeINR: 550000,
    fieldOfStudy: 'Computer Science',
    targetDestinations: ['Singapore', 'Germany', 'Canada'],
    graduationYear: 2026
  };

  const assessment = assessEligibility(rahulProfile, scholarships);
  const ranking = rankAndRecommend(assessment.evaluatedCandidates, rahulProfile);

  assert.strictEqual(ranking.status, 'SUCCESS');
  assert.ok(ranking.topFiveRecommendations.length <= 5, 'Top recommendations capped at 5');
  assert.ok(ranking.topFiveRecommendations.length >= 1, 'At least 1 trustworthy recommendation');

  // Verify first recommendation has rationale and instructions
  const top1 = ranking.topFiveRecommendations[0];
  assert.ok(top1.matchRationale, 'Top recommendation includes match rationale');
  assert.ok(top1.recommendedNextAction, 'Top recommendation includes recommended next action');
});

test('Orchestrator: Complete 4-Agent Pipeline executes with trace, top 5, and timings', async () => {
  const scholarships = loadScholarships();
  const testProfile = {
    fullName: 'Rahul Sharma',
    educationLevel: 'Undergraduate',
    degree: 'B.Tech Computer Science',
    institution: 'NIT Jalandhar',
    graduationYear: 2026,
    academicScore: 8.2,
    annualFamilyIncomeINR: 550000,
    fieldOfStudy: 'Computer Science',
    targetDestinations: ['Germany', 'Singapore', 'Canada'],
    skills: ['Python', 'PyTorch', 'NLP']
  };

  const result = await runScholarshipPipeline(testProfile, scholarships);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.executionTrace.length, 4, 'All 4 agents executed');
  assert.ok(result.topFiveRecommendations.length <= 5, 'Top five returned');
  assert.ok(result.totalPipelineDurationMs >= 0, 'Duration recorded');
});

test('Application Assistant: Generates grounded Statement of Purpose draft without inventing facts', () => {
  const scholarship = {
    id: 'sch-004',
    name: 'Singapore International Graduate Award (SINGA)',
    provider: 'A*STAR, NTU, NUS, SUTD',
    awardAmount: 'Full tuition + SGD $2,700/mo stipend',
    deadline: 'June 01, 2026',
    officialUrl: 'https://www.a-star.edu.sg',
    targetDestinations: ['Singapore']
  };

  const profile = {
    fullName: 'Rahul Sharma',
    degree: 'B.Tech in Computer Science',
    institution: 'NIT Jalandhar',
    academicScore: 78.0,
    fieldOfStudy: 'Computer Science & AI',
    skills: ['Python', 'PyTorch', 'Machine Learning'],
    achievements: 'Winner of Inter-College AI Hackathon 2025'
  };

  const sop = draftStatementOfPurpose(scholarship, profile);
  assert.strictEqual(sop.success, true);
  assert.ok(sop.draftContent.includes('Rahul Sharma'), 'Contains applicant name');
  assert.ok(sop.draftContent.includes('NIT Jalandhar'), 'Contains student institution');
  assert.ok(sop.draftContent.includes('PyTorch'), 'References verified technical skills');
  assert.ok(sop.wordCount > 150, 'Substantial draft generated');
  assert.ok(sop.disclaimer.includes('NEVER submit'), 'Includes ethical submission disclaimer');
});
