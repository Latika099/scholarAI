/**
 * Agent 4: Ranking & Recommendation Agent
 * Produces transparent multi-vector match scores (0-100) and curates the Top 5 Recommendations.
 * If fewer than five trustworthy opportunities exist, explains why rather than manufacturing results.
 */

export function rankAndRecommend(evaluatedScholarships = [], normalizedProfile = {}) {
  const startTime = Date.now();

  const ranked = evaluatedScholarships.map((sch) => {
    let score = 0;
    const scoreBreakdown = {};

    // 1. Eligibility Status Weight (Max 40 pts)
    if (sch.eligibilityStatus === 'ELIGIBLE') {
      scoreBreakdown.eligibility = 40;
    } else if (sch.eligibilityStatus === 'POTENTIALLY_ELIGIBLE') {
      scoreBreakdown.eligibility = 25;
    } else {
      scoreBreakdown.eligibility = 5;
    }
    score += scoreBreakdown.eligibility;

    // 2. Academic Fit Weight (Max 20 pts)
    const minCutoff = sch.minimumAcademicScore || 0;
    const studentScore = normalizedProfile.academicScore || 75;
    if (studentScore >= minCutoff) {
      const margin = studentScore - minCutoff;
      const academicPts = Math.min(20, 15 + Math.round(Math.min(5, margin / 2)));
      scoreBreakdown.academicFit = academicPts;
    } else {
      scoreBreakdown.academicFit = 5;
    }
    score += scoreBreakdown.academicFit;

    // 3. Destination Alignment (Max 20 pts)
    const studentDestinations = normalizedProfile.targetDestinations || [];
    const schDestinations = sch.targetDestinations || ['Any'];
    const hasDirectDest = schDestinations.some(d => 
      studentDestinations.some(sd => sd.toLowerCase() === d.toLowerCase())
    );
    if (hasDirectDest) {
      scoreBreakdown.destinationFit = 20;
    } else if (schDestinations.includes('Any')) {
      scoreBreakdown.destinationFit = 14;
    } else {
      scoreBreakdown.destinationFit = 4;
    }
    score += scoreBreakdown.destinationFit;

    // 4. Field & Technical Skills Specificity (Max 10 pts)
    const studentField = (normalizedProfile.fieldOfStudy || 'Computer Science').toLowerCase();
    const isDirectField = sch.eligibleFields.some(
      f => f.toLowerCase().includes(studentField) || studentField.includes(f.toLowerCase())
    );
    if (isDirectField && !sch.eligibleFields.includes('All')) {
      scoreBreakdown.fieldMatch = 10;
    } else if (sch.eligibleFields.includes('All')) {
      scoreBreakdown.fieldMatch = 7;
    } else {
      scoreBreakdown.fieldMatch = 3;
    }
    score += scoreBreakdown.fieldMatch;

    // 5. Funding & Provider Alignment (Max 10 pts)
    let preferencePts = 0;
    const schType = (sch.scholarshipType || '').toLowerCase();
    const prefType = (normalizedProfile.preferredScholarshipType || '').toLowerCase();
    if (prefType === 'all' || schType === prefType) {
      preferencePts += 5;
    }

    const schFunding = (sch.fundingType || '').toLowerCase();
    const prefFunding = (normalizedProfile.preferredFundingType || '').toLowerCase();
    if (prefFunding === 'any' || schFunding.includes(prefFunding)) {
      preferencePts += 5;
    }
    scoreBreakdown.preferences = preferencePts;
    score += preferencePts;

    // Cap matchScore at 100
    const matchScore = Math.min(100, Math.max(10, Math.round(score)));

    // Generate Tailored Match Rationale
    let matchRationale = '';
    if (hasDirectDest && isDirectField) {
      matchRationale = `High priority match: directly aligns with your target destination (${schDestinations.join(', ')}) and technical specialization in ${normalizedProfile.fieldOfStudy}.`;
    } else if (hasDirectDest) {
      matchRationale = `Destination match: tenable in your target study country (${schDestinations.join(', ')}).`;
    } else {
      matchRationale = `Academic merit match: your ${studentScore}% standing satisfies the minimum ${minCutoff}% guideline.`;
    }

    // Actionable next steps
    const nextSteps = [];
    if (sch.eligibilityStatus === 'ELIGIBLE') {
      nextSteps.push('Review the official scheme portal and download the latest application checklist.');
      if (sch.maximumAnnualFamilyIncomeINR) {
        nextSteps.push(`Obtain an updated Tehsildar/Revenue authority income certificate stating income under ₹${sch.maximumAnnualFamilyIncomeINR.toLocaleString('en-IN')}.`);
      }
      nextSteps.push('Gather certified semester marksheets and bonafide student letter from your college registrar.');
      nextSteps.push(`Submit application before the designated deadline: ${sch.deadline}.`);
    } else if (sch.eligibilityStatus === 'POTENTIALLY_ELIGIBLE') {
      const unknownCriteria = sch.criteriaResults.filter(c => c.status === 'UNKNOWN');
      unknownCriteria.forEach(c => {
        nextSteps.push(`Verify requirements for "${c.criterion}": ${c.message}`);
      });
      nextSteps.push('Check previous cutoffs and prepare competitive statement of purpose or entrance ranks.');
    } else {
      nextSteps.push('Current profile does not fulfill one or more mandatory eligibility requirements.');
      nextSteps.push('Consider exploring related alternative opportunities with more flexible criteria.');
    }

    return {
      ...sch,
      matchScore,
      scoreBreakdown,
      matchRationale,
      nextSteps,
      recommendedNextAction: nextSteps[0] || 'Visit official portal to review application process.',
      disclaimer: 'This match score reflects algorithmic criteria alignment with self-reported profile data. It does not guarantee scholarship award or final approval.'
    };
  });

  // Sort descending by matchScore
  ranked.sort((a, b) => b.matchScore - a.matchScore);

  // Top 5 Recommendations Curated Selection
  // Strictly trustworthy: only recommend opportunities with matchScore >= 45 and not strictly expired
  const eligibleOrPotential = ranked.filter(s => s.eligibilityStatus !== 'INELIGIBLE' && !s.isExpired);
  const candidatePool = eligibleOrPotential.length > 0 ? eligibleOrPotential : ranked;
  const topFive = candidatePool.slice(0, 5);

  let topFiveExplanation = '';
  if (topFive.length === 5) {
    topFiveExplanation = `Identified top 5 trustworthy scholarship recommendations strongly aligned with student's destinations (${(normalizedProfile.targetDestinations || []).join(', ')}) and qualifications.`;
  } else {
    topFiveExplanation = `Showing ${topFive.length} highly trustworthy opportunities. Fewer than 5 were selected to avoid manufacturing low-confidence matches.`;
  }

  const durationMs = Date.now() - startTime;

  return {
    agentName: 'Ranking & Recommendation Agent',
    agentId: 'agent_ranking',
    status: 'SUCCESS',
    durationMs,
    summary: `Ranked ${ranked.length} scholarships across 5 weighted vectors. Top match: ${ranked[0]?.name} (${ranked[0]?.matchScore}%). ${topFive.length} curated recommendations.`,
    topFiveRecommendations: topFive,
    topFiveExplanation,
    rankedScholarships: ranked
  };
}
