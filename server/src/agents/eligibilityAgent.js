/**
 * Agent 3: Eligibility Assessment Agent
 * Evaluates candidate scholarships against student profile with criterion-level granularity.
 * Identifies satisfied, unmet, and unknown criteria without fabricating information.
 */

export function assessEligibility(normalizedProfile, candidateScholarships = []) {
  const startTime = Date.now();

  const evaluated = candidateScholarships.map((sch) => {
    const criteriaResults = [];
    let hasUnmet = false;
    let hasBorderline = false;
    let hasUnknown = false;

    // 1. Study Destination Match
    const studentDestinations = normalizedProfile.targetDestinations || [];
    const schDestinations = sch.targetDestinations || ['Any'];
    const isDestMatch =
      schDestinations.includes('Any') ||
      studentDestinations.length === 0 ||
      schDestinations.some(d => studentDestinations.some(sd => sd.toLowerCase() === d.toLowerCase()));

    if (isDestMatch) {
      criteriaResults.push({
        criterion: 'Study Destination',
        status: 'SATISFIED',
        message: `Host country (${schDestinations.join(', ')}) aligns with your target destinations (${studentDestinations.join(', ')}).`,
        isFact: true
      });
    } else {
      criteriaResults.push({
        criterion: 'Study Destination',
        status: 'UNKNOWN',
        message: `Scholarship is tenable in ${schDestinations.join(', ')}. Please confirm if you are willing to study in this jurisdiction.`,
        isFact: false
      });
      hasBorderline = true;
    }

    // 2. Education Level Check
    const studentLevel = normalizedProfile.educationLevel || 'Undergraduate';
    const isLevelMatch = sch.eligibleEducationLevels.includes(studentLevel) || sch.eligibleEducationLevels.includes('All');

    if (isLevelMatch) {
      criteriaResults.push({
        criterion: 'Education Level',
        status: 'SATISFIED',
        message: `Your current level (${studentLevel}) matches eligible levels (${sch.eligibleEducationLevels.join(', ')}).`,
        isFact: true
      });
    } else {
      const currentYear = new Date().getFullYear();
      const isGraduatingSoon = normalizedProfile.graduationYear <= currentYear + 1;
      if (studentLevel === 'Undergraduate' && sch.eligibleEducationLevels.includes('Postgraduate') && isGraduatingSoon) {
        hasBorderline = true;
        criteriaResults.push({
          criterion: 'Education Level',
          status: 'UNKNOWN',
          message: `Scholarship is for Postgraduate study. As an Undergraduate graduating in ${normalizedProfile.graduationYear}, you are eligible to apply for upcoming intakes.`,
          isFact: false
        });
      } else {
        hasUnmet = true;
        criteriaResults.push({
          criterion: 'Education Level',
          status: 'UNMET',
          message: `Mandates ${sch.eligibleEducationLevels.join(' or ')}, but your profile indicates ${studentLevel}.`,
          isFact: true
        });
      }
    }

    // 3. Academic Score Requirement
    const studentScore = normalizedProfile.academicScore || 0;
    const minScore = sch.minimumAcademicScore || 0;

    if (minScore === 0) {
      criteriaResults.push({
        criterion: 'Academic Performance',
        status: 'SATISFIED',
        message: 'No minimum cutoff percentage mandated by provider.',
        isFact: true
      });
    } else if (studentScore >= minScore) {
      criteriaResults.push({
        criterion: 'Academic Performance',
        status: 'SATISFIED',
        message: `Your academic score (${studentScore}%) satisfies the minimum cutoff of ${minScore}%.`,
        isFact: true
      });
    } else if (studentScore >= minScore - 3.0) {
      hasBorderline = true;
      criteriaResults.push({
        criterion: 'Academic Performance',
        status: 'UNKNOWN',
        message: `Your score (${studentScore}%) is marginally below the target cutoff (${minScore}%). High GRE, GATE, or project portfolios may offset this.`,
        isFact: false
      });
    } else {
      hasUnmet = true;
      criteriaResults.push({
        criterion: 'Academic Performance',
        status: 'UNMET',
        message: `Minimum academic score required is ${minScore}%, while your score is ${studentScore}%.`,
        isFact: true
      });
    }

    // 4. Family Income Ceiling
    const maxIncome = sch.maximumAnnualFamilyIncomeINR;
    const studentIncome = normalizedProfile.annualFamilyIncomeINR;

    if (maxIncome === null || maxIncome === undefined || maxIncome === 0) {
      criteriaResults.push({
        criterion: 'Financial Need / Income',
        status: 'SATISFIED',
        message: 'Open to all income brackets with no family income cap.',
        isFact: true
      });
    } else if (studentIncome === null || studentIncome === undefined) {
      hasUnknown = true;
      criteriaResults.push({
        criterion: 'Financial Need / Income',
        status: 'UNKNOWN',
        message: `Maximum allowable income is ₹${maxIncome.toLocaleString('en-IN')}/year. Please verify your family income certificate.`,
        isFact: false
      });
    } else if (studentIncome <= maxIncome) {
      criteriaResults.push({
        criterion: 'Financial Need / Income',
        status: 'SATISFIED',
        message: `Family income (₹${studentIncome.toLocaleString('en-IN')}) is within the cap of ₹${maxIncome.toLocaleString('en-IN')}.`,
        isFact: true
      });
    } else {
      hasUnmet = true;
      criteriaResults.push({
        criterion: 'Financial Need / Income',
        status: 'UNMET',
        message: `Family income of ₹${studentIncome.toLocaleString('en-IN')} exceeds the ceiling limit of ₹${maxIncome.toLocaleString('en-IN')}.`,
        isFact: true
      });
    }

    // 5. Field of Study Alignment
    const studentField = (normalizedProfile.fieldOfStudy || 'Computer Science').toLowerCase();
    const eligibleFields = sch.eligibleFields.map(f => f.toLowerCase());
    const isFieldOpen = eligibleFields.includes('all') || eligibleFields.includes('general');

    const csSynonyms = ['computer science', 'ai', 'artificial intelligence', 'data science', 'it', 'software', 'technology', 'engineering', 'stem'];
    const isStudentCs = csSynonyms.some(s => studentField.includes(s));
    const isSchCs = eligibleFields.some(f => csSynonyms.some(s => f.includes(s)));

    if (isFieldOpen) {
      criteriaResults.push({
        criterion: 'Field of Study',
        status: 'SATISFIED',
        message: `Open to all disciplines including ${normalizedProfile.fieldOfStudy}.`,
        isFact: true
      });
    } else if (eligibleFields.some(f => studentField.includes(f) || f.includes(studentField))) {
      criteriaResults.push({
        criterion: 'Field of Study',
        status: 'SATISFIED',
        message: `Field '${normalizedProfile.fieldOfStudy}' directly aligns with provider mandate.`,
        isFact: true
      });
    } else if (isStudentCs && isSchCs) {
      criteriaResults.push({
        criterion: 'Field of Study',
        status: 'SATISFIED',
        message: `Your technical/CS specialization qualifies for this engineering and science fellowship.`,
        isFact: true
      });
    } else {
      hasUnmet = true;
      criteriaResults.push({
        criterion: 'Field of Study',
        status: 'UNMET',
        message: `Designated for [${sch.eligibleFields.join(', ')}], while your field is ${normalizedProfile.fieldOfStudy}.`,
        isFact: true
      });
    }

    // Determine overall eligibility status
    let eligibilityStatus = 'ELIGIBLE';
    if (hasUnmet) {
      eligibilityStatus = 'INELIGIBLE';
    } else if (hasBorderline || hasUnknown) {
      eligibilityStatus = 'POTENTIALLY_ELIGIBLE';
    }

    // Synthesize transparent summary explanation
    let explanation = '';
    const satisfiedList = criteriaResults.filter(c => c.status === 'SATISFIED').map(c => c.criterion);
    const unmetList = criteriaResults.filter(c => c.status === 'UNMET').map(c => c.criterion);
    const unknownList = criteriaResults.filter(c => c.status === 'UNKNOWN').map(c => c.criterion);

    if (eligibilityStatus === 'ELIGIBLE') {
      explanation = `All mandatory published criteria satisfied: ${satisfiedList.join(', ')}. Strong academic and destination alignment.`;
    } else if (eligibilityStatus === 'POTENTIALLY_ELIGIBLE') {
      explanation = `Promising candidate match. Satisfied: ${satisfiedList.join(', ')}. Pending verification or conditional: ${unknownList.join(', ')}.`;
    } else {
      explanation = `Unmet criteria identified: ${unmetList.join(', ')}. Current profile does not fulfill provider's mandatory guidelines.`;
    }

    return {
      ...sch,
      eligibilityStatus,
      criteriaResults,
      satisfiedCount: satisfiedList.length,
      unmetCount: unmetList.length,
      unknownCount: unknownList.length,
      explanation
    };
  });

  const durationMs = Date.now() - startTime;
  const eligibleCount = evaluated.filter(s => s.eligibilityStatus === 'ELIGIBLE').length;
  const potentiallyCount = evaluated.filter(s => s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE').length;
  const ineligibleCount = evaluated.filter(s => s.eligibilityStatus === 'INELIGIBLE').length;

  return {
    agentName: 'Eligibility Assessment Agent',
    agentId: 'agent_eligibility',
    status: 'SUCCESS',
    durationMs,
    summary: `Evaluated ${evaluated.length} opportunities: ${eligibleCount} Fully Eligible, ${potentiallyCount} Potentially Eligible, ${ineligibleCount} Ineligible. Criteria mapped to published facts.`,
    statistics: {
      eligibleCount,
      potentiallyCount,
      ineligibleCount,
      totalEvaluated: evaluated.length
    },
    evaluatedCandidates: evaluated
  };
}
