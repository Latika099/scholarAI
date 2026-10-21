/**
 * Multi-Agent Orchestrator
 * Coordinates execution across all 4 specialized scholarship agents,
 * recording structured execution traces with timestamps, error tracking, and performance metrics.
 */

import { analyzeStudentProfile } from './profileAnalyzer.js';
import { discoverScholarships } from './discoveryAgent.js';
import { assessEligibility } from './eligibilityAgent.js';
import { rankAndRecommend } from './rankingAgent.js';

export async function runScholarshipPipeline(rawProfile, allScholarships = [], queryFilters = {}) {
  const pipelineStartTime = Date.now();
  const executionTrace = [];
  let currentError = null;

  // -------------------------------------------------------------
  // Step 1: Agent 1 - Student Profile Analyzer
  // -------------------------------------------------------------
  const step1Start = Date.now();
  let profileResult;
  try {
    profileResult = analyzeStudentProfile(rawProfile);
  } catch (err) {
    currentError = err.message;
    profileResult = {
      agentName: 'Student Profile Analyzer',
      agentId: 'agent_profile_analyzer',
      status: 'ERROR',
      durationMs: Date.now() - step1Start,
      summary: `Failed to analyze profile: ${err.message}`,
      normalizedProfile: rawProfile,
      missingInformation: [],
      warnings: [err.message]
    };
  }

  executionTrace.push({
    step: 1,
    agentId: profileResult.agentId,
    agentName: profileResult.agentName,
    status: profileResult.status,
    startTime: new Date(step1Start).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: profileResult.durationMs,
    summary: profileResult.summary,
    details: {
      completenessScore: profileResult.normalizedProfile.completenessScore,
      normalizedScore: profileResult.normalizedProfile.academicScore,
      targetDestinations: profileResult.normalizedProfile.targetDestinations,
      skillsCount: (profileResult.normalizedProfile.skills || []).length,
      missingFields: profileResult.missingInformation,
      warnings: profileResult.warnings
    }
  });

  const normalizedProfile = profileResult.normalizedProfile;

  // -------------------------------------------------------------
  // Step 2: Agent 2 - Scholarship Discovery Agent (Web Researcher)
  // -------------------------------------------------------------
  const step2Start = Date.now();
  let discoveryResult;
  try {
    discoveryResult = await discoverScholarships(normalizedProfile, allScholarships, queryFilters);
  } catch (err) {
    currentError = err.message;
    discoveryResult = {
      agentName: 'Scholarship Discovery Agent (Web Researcher)',
      agentId: 'agent_discovery',
      status: 'ERROR',
      durationMs: Date.now() - step2Start,
      summary: `Research discovery encountered error: ${err.message}. Applied safety fallback.`,
      candidates: allScholarships.slice(0, 10),
      criteriaApplied: ['Fallback All Records']
    };
  }

  executionTrace.push({
    step: 2,
    agentId: discoveryResult.agentId,
    agentName: discoveryResult.agentName,
    status: discoveryResult.status,
    startTime: new Date(step2Start).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: discoveryResult.durationMs,
    summary: discoveryResult.summary,
    details: {
      totalFound: discoveryResult.totalFound || discoveryResult.candidates.length,
      totalInDatabase: discoveryResult.totalInDatabase || allScholarships.length,
      criteriaApplied: discoveryResult.criteriaApplied,
      destinationsChecked: normalizedProfile.targetDestinations
    }
  });

  // -------------------------------------------------------------
  // Step 3: Agent 3 - Eligibility Assessment Agent
  // -------------------------------------------------------------
  const step3Start = Date.now();
  let eligibilityResult;
  try {
    eligibilityResult = assessEligibility(normalizedProfile, discoveryResult.candidates);
  } catch (err) {
    currentError = err.message;
    eligibilityResult = {
      agentName: 'Eligibility Assessment Agent',
      agentId: 'agent_eligibility',
      status: 'ERROR',
      durationMs: Date.now() - step3Start,
      summary: `Eligibility check error: ${err.message}`,
      evaluatedCandidates: discoveryResult.candidates.map(c => ({ ...c, eligibilityStatus: 'POTENTIALLY_ELIGIBLE' })),
      statistics: { eligibleCount: 0, potentiallyCount: discoveryResult.candidates.length, ineligibleCount: 0, totalEvaluated: discoveryResult.candidates.length }
    };
  }

  executionTrace.push({
    step: 3,
    agentId: eligibilityResult.agentId,
    agentName: eligibilityResult.agentName,
    status: eligibilityResult.status,
    startTime: new Date(step3Start).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: eligibilityResult.durationMs,
    summary: eligibilityResult.summary,
    details: eligibilityResult.statistics
  });

  // -------------------------------------------------------------
  // Step 4: Agent 4 - Ranking & Recommendation Agent
  // -------------------------------------------------------------
  const step4Start = Date.now();
  let rankingResult;
  try {
    rankingResult = rankAndRecommend(eligibilityResult.evaluatedCandidates, normalizedProfile);
  } catch (err) {
    currentError = err.message;
    rankingResult = {
      agentName: 'Ranking & Recommendation Agent',
      agentId: 'agent_ranking',
      status: 'ERROR',
      durationMs: Date.now() - step4Start,
      summary: `Ranking error: ${err.message}`,
      rankedScholarships: eligibilityResult.evaluatedCandidates,
      topFiveRecommendations: eligibilityResult.evaluatedCandidates.slice(0, 5),
      topFiveExplanation: 'Default unranked fallback due to scoring error.'
    };
  }

  executionTrace.push({
    step: 4,
    agentId: rankingResult.agentId,
    agentName: rankingResult.agentName,
    status: rankingResult.status,
    startTime: new Date(step4Start).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: rankingResult.durationMs,
    summary: rankingResult.summary,
    details: {
      topMatchName: rankingResult.rankedScholarships[0]?.name || 'N/A',
      topMatchScore: rankingResult.rankedScholarships[0]?.matchScore || 0,
      totalRanked: rankingResult.rankedScholarships.length,
      topFiveCount: rankingResult.topFiveRecommendations.length
    }
  });

  const totalPipelineDurationMs = Date.now() - pipelineStartTime;

  return {
    success: currentError === null,
    totalPipelineDurationMs,
    timestamp: new Date().toISOString(),
    executionTrace,
    profileSummary: {
      fullName: normalizedProfile.fullName,
      educationLevel: normalizedProfile.educationLevel,
      degree: normalizedProfile.degree,
      academicScore: normalizedProfile.academicScore,
      targetDestinations: normalizedProfile.targetDestinations,
      fieldOfStudy: normalizedProfile.fieldOfStudy,
      skills: normalizedProfile.skills,
      completenessScore: normalizedProfile.completenessScore,
      missingInformation: profileResult.missingInformation
    },
    statistics: eligibilityResult.statistics,
    topFiveRecommendations: rankingResult.topFiveRecommendations,
    topFiveExplanation: rankingResult.topFiveExplanation,
    rankedScholarships: rankingResult.rankedScholarships
  };
}
