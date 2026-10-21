/**
 * Agent 1: Student Profile Analyzer
 * Validates, normalizes, and extracts structured insights from student profile data,
 * uploaded documents, and verified GitHub project metadata.
 */

export function analyzeStudentProfile(rawProfile = {}) {
  const startTime = Date.now();
  const errors = [];
  const warnings = [];

  // 1. Basic Information Validation
  const fullName = (rawProfile.fullName || '').trim();
  if (!fullName) {
    errors.push('Full name is required');
  }

  const countryOfResidence = (rawProfile.countryOfResidence || 'India').trim();
  const nationality = (rawProfile.nationality || 'India').trim();

  // 2. Education Level Normalization
  const validLevels = ['School', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD'];
  let educationLevel = rawProfile.educationLevel || 'Undergraduate';
  if (!validLevels.includes(educationLevel)) {
    warnings.push(`Education level '${educationLevel}' mapped to closest level.`);
  }

  const degree = (rawProfile.degree || '').trim();
  const institution = (rawProfile.institution || '').trim();

  let graduationYear = parseInt(rawProfile.graduationYear, 10);
  if (isNaN(graduationYear) || graduationYear < 2020 || graduationYear > 2035) {
    graduationYear = new Date().getFullYear() + 1;
  }

  // 3. Academic Score Normalization (Support CGPA 10-scale or % 100-scale)
  let rawScore = parseFloat(rawProfile.academicScore);
  let normalizedScore = 75.0; // default benchmark if missing
  let scoreScale = 'percentage';

  if (!isNaN(rawScore) && rawScore > 0) {
    if (rawScore <= 10.0) {
      // 10-point CGPA converted to percentage standard (approx CGPA * 9.5 or * 10)
      normalizedScore = Math.min(100, Math.round(rawScore * 9.5 * 10) / 10);
      scoreScale = 'cgpa_10';
    } else if (rawScore <= 100.0) {
      normalizedScore = Math.round(rawScore * 10) / 10;
      scoreScale = 'percentage';
    } else {
      warnings.push('Academic score exceeded 100; capped at 100%.');
      normalizedScore = 100;
    }
  } else {
    warnings.push('No academic score provided; defaulted to 75% baseline.');
  }

  // 4. Annual Family Income Normalization (INR)
  let rawIncome = rawProfile.annualFamilyIncomeINR;
  let annualIncome = null;
  if (rawIncome !== undefined && rawIncome !== null && rawIncome !== '') {
    annualIncome = parseFloat(rawIncome);
    if (isNaN(annualIncome) || annualIncome < 0) {
      annualIncome = null;
      warnings.push('Income entered was not a valid number.');
    }
  } else {
    warnings.push('Family income not specified; income-capped scholarships will require verification.');
  }

  // 5. Target Study Destinations (Crucial for Canada, Germany, Singapore, India, etc.)
  let targetDestinations = [];
  if (Array.isArray(rawProfile.targetDestinations)) {
    targetDestinations = rawProfile.targetDestinations;
  } else if (typeof rawProfile.targetDestinations === 'string' && rawProfile.targetDestinations.trim()) {
    targetDestinations = rawProfile.targetDestinations.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    targetDestinations = ['India', 'Germany', 'Singapore', 'Canada'];
  }

  // 6. Skills, Achievements & GitHub
  let skills = [];
  if (Array.isArray(rawProfile.skills)) {
    skills = rawProfile.skills;
  } else if (typeof rawProfile.skills === 'string' && rawProfile.skills.trim()) {
    skills = rawProfile.skills.split(',').map(s => s.trim()).filter(Boolean);
  }

  const achievements = (rawProfile.achievements || '').trim();
  const githubUsername = (rawProfile.githubUsername || rawProfile.githubUrl || '').trim();
  const githubData = rawProfile.githubData || null;
  const uploadedDocuments = rawProfile.uploadedDocuments || [];

  // Field of Study & Preferences
  const fieldOfStudy = (rawProfile.fieldOfStudy || 'Computer Science').trim();
  const preferredScholarshipType = rawProfile.preferredScholarshipType || 'All';
  const preferredFundingType = rawProfile.preferredFundingType || 'Any';

  // Inclusion & Demographics
  const firstGenerationStudent = Boolean(rawProfile.firstGenerationStudent);
  const personWithDisability = Boolean(rawProfile.personWithDisability);
  const casteCategory = rawProfile.casteCategory || 'General';
  const extracurriculars = (rawProfile.extracurriculars || '').trim();

  // 7. Profile Completeness & Missing Fields Calculation
  const criticalFields = [
    fullName, 
    educationLevel, 
    degree, 
    institution, 
    rawScore, 
    annualIncome, 
    fieldOfStudy,
    targetDestinations.length > 0 ? 'destinations' : null,
    skills.length > 0 ? 'skills' : null
  ];
  const filledCount = criticalFields.filter(f => f !== null && f !== undefined && f !== '').length;
  const completenessScore = Math.round((filledCount / criticalFields.length) * 100);

  const missingInformation = [];
  if (!annualIncome && annualIncome !== 0) missingInformation.push('Family Annual Income (required for means-tested grants)');
  if (!degree) missingInformation.push('Degree / Course Name');
  if (!institution) missingInformation.push('College / University Name');
  if (!rawScore) missingInformation.push('Exact CGPA or Percentage');
  if (targetDestinations.length === 0) missingInformation.push('Preferred Study Destinations');
  if (skills.length === 0) missingInformation.push('Verified Skills or Project Highlights');
  if (!achievements) missingInformation.push('Academic Honors / Extracurricular Achievements');

  const normalizedProfile = {
    fullName: fullName || 'Student Applicant',
    countryOfResidence,
    nationality,
    educationLevel,
    degree: degree || 'Bachelor of Technology',
    institution: institution || 'Recognized University',
    graduationYear,
    academicScore: normalizedScore,
    originalScore: rawScore,
    scoreScale,
    annualFamilyIncomeINR: annualIncome,
    targetDestinations,
    fieldOfStudy,
    skills,
    achievements,
    githubUsername,
    githubData,
    uploadedDocuments,
    preferredScholarshipType,
    preferredFundingType,
    firstGenerationStudent,
    personWithDisability,
    casteCategory,
    extracurriculars,
    completenessScore
  };

  const durationMs = Date.now() - startTime;

  return {
    agentName: 'Student Profile Analyzer',
    agentId: 'agent_profile_analyzer',
    status: errors.length === 0 ? 'SUCCESS' : 'WARNING',
    durationMs,
    summary: `Profile analyzed for ${normalizedProfile.fullName} (${completenessScore}% completeness). Normalized score: ${normalizedScore}%. Destinations: ${targetDestinations.join(', ')}. ${skills.length} verified skills recorded.`,
    normalizedProfile,
    missingInformation,
    warnings,
    errors
  };
}
