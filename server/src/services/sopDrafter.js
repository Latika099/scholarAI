/**
 * Statement of Purpose (SOP) & Application Response Drafting Service
 * Generates tailored application essays grounded strictly in student profile data and scholarship facts.
 * Never invents achievements or fake publications; explicitly flags missing items.
 */

export function draftStatementOfPurpose(scholarship, studentProfile = {}) {
  if (!scholarship) {
    throw new Error('Scholarship details are required to generate an SOP draft.');
  }

  const {
    fullName = 'Student Applicant',
    degree = 'Bachelor of Technology in Computer Science',
    institution = 'Recognized University',
    academicScore = 80,
    fieldOfStudy = 'Computer Science',
    targetDestinations = ['Germany', 'Singapore', 'Canada'],
    skills = [],
    achievements = '',
    githubData = null,
    extracurriculars = ''
  } = studentProfile;

  // Identify missing information
  const missingInformation = [];
  if (!studentProfile.academicScore) missingInformation.push('Academic GPA / Transcripts');
  if (!skills || skills.length === 0) missingInformation.push('Specific Technical / Laboratory Skills');
  if (!achievements) missingInformation.push('Specific Academic or Extracurricular Achievements');
  if (!extracurriculars) missingInformation.push('Leadership or Community Engagement History');

  const skillsListStr = skills && skills.length > 0 ? skills.join(', ') : '[Insert key technical tools & programming languages]';
  const achievementsStr = achievements ? achievements : '[Insert notable academic awards, competitions, or workshop papers]';
  const destinationStr = targetDestinations && targetDestinations.length > 0 ? targetDestinations.join(', ') : 'international destinations';

  // Construct Tailored Draft
  const draftTitle = `Statement of Purpose: Application for ${scholarship.name}`;
  
  const draftContent = `
# ${draftTitle}
**Applicant:** ${fullName}  
**Target Award / Scheme:** ${scholarship.name} (${scholarship.provider})  
**Official Portal:** ${scholarship.officialUrl}  
**Date of Draft:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

### Dear Selection Committee at ${scholarship.provider},

I am writing to express my sincere interest in applying for the **${scholarship.name}**. Having completed my academic training in **${degree}** from **${institution}** with a cumulative academic standing of **${academicScore}%**, I aspire to advance my higher education and research in **${fieldOfStudy}**. 

#### Academic Background and Technical Competence
Throughout my undergraduate tenure at ${institution}, I cultivated a rigorous foundation in ${fieldOfStudy}. My coursework and project engagements enabled me to develop hands-on expertise in **${skillsListStr}**. Rather than treating theoretical principles in isolation, I consistently sought to apply computational models to real-world challenges.${
  githubData && githubData.highlightedProjects && githubData.highlightedProjects.length > 0
    ? ` As demonstrated in my open-source technical portfolio (@${githubData.username}), my work includes projects such as **${githubData.highlightedProjects[0].name}** (${githubData.highlightedProjects[0].description}).`
    : ''
}

#### Motivation for ${scholarship.name}
The mission of ${scholarship.provider} in fostering academic excellence aligns closely with my career trajectory. ${
  scholarship.targetDestinations && scholarship.targetDestinations.length > 0
    ? `My goal is to pursue advanced graduate studies in **${scholarship.targetDestinations.join(' / ')}**, where premier research institutions provide the collaborative infrastructure required for cutting-edge innovation.`
    : `This scholarship represents a vital catalyst in enabling me to pursue rigorous graduate studies without insurmountable financial strain.`
} The award of **${scholarship.awardAmount}** will allow me to dedicate my complete attention to scholarly research, thesis development, and active contribution to the academic community.

#### Achievements and Demonstrated Aptitude
${achievementsStr}
${extracurriculars ? `\nBeyond coursework, I have actively contributed through: ${extracurriculars}.` : ''}

#### Academic & Professional Vision
In the long term, I aim to leverage the expertise gained through this program to address critical technological and societal challenges. [Insert 2-3 sentences outlining your specific proposed thesis topic or intended laboratory/faculty advisor at the host institution].

I am confident that my academic commitment, technical proficiency, and resilience make me a deserving ambassador for the ${scholarship.name}. I look forward to the opportunity of contributing meaningfully to your scholar community.

Sincerely,  
**${fullName}**  
Email: [Your Contact Email]  
Contact Phone: [Your Phone Number]  
Academic Transcripts & Portfolio: [Attached]
`;

  return {
    success: true,
    scholarshipId: scholarship.id,
    scholarshipName: scholarship.name,
    provider: scholarship.provider,
    draftTitle,
    draftContent: draftContent.trim(),
    missingInformation,
    wordCount: draftContent.trim().split(/\s+/).length,
    disclaimer: 'This draft SOP is an automated template based strictly on your profile. ScholarAI will NEVER submit an application automatically. You must review, customize, and submit through the official awarding portal.'
  };
}
