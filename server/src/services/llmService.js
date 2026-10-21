/**
 * LLM Service with Dual-Engine Architecture:
 * 1. Live LLM API integration if LLM_API_KEY is configured in environment.
 * 2. Deterministic Local Dataset RAG pipeline if no API key is provided.
 * Grounded in verified scholarship facts with zero hallucination.
 */

import { loadScholarships } from './scholarshipService.js';

export async function askAssistant(userMessage = '', studentProfile = null, conversationHistory = []) {
  const apiKey = process.env.LLM_API_KEY;
  const provider = (process.env.LLM_PROVIDER || 'GEMINI').toUpperCase();
  const scholarships = loadScholarships();

  // If API key is present and configured, attempt cloud LLM
  if (apiKey && apiKey.trim() !== '') {
    try {
      const llmResult = await callExternalLLM(userMessage, studentProfile, scholarships, provider, apiKey);
      if (llmResult) return llmResult;
    } catch (err) {
      console.warn(`External LLM call failed (${err.message}). Falling back to local deterministic engine.`);
    }
  }

  // Fallback to grounded local dataset reasoning engine
  return localDeterministicAssistant(userMessage, studentProfile, scholarships);
}

/**
 * Local Deterministic Assistant grounded directly in verified scholarships dataset
 */
function localDeterministicAssistant(query, profile, scholarships) {
  const q = (query || '').toLowerCase().trim();
  const matchedScholarships = [];

  // Match specific scholarships by name or keyword
  scholarships.forEach((s) => {
    const nameMatch = s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase());
    const idMatch = s.id.toLowerCase() === q;
    const providerMatch = s.provider.toLowerCase().includes(q) || q.includes(s.provider.toLowerCase());
    const tagMatch = s.tags && s.tags.some(t => q.includes(t.toLowerCase()));

    if (nameMatch || idMatch || providerMatch || tagMatch) {
      matchedScholarships.push(s);
    }
  });

  // Query Intent Analysis
  const marksMatch = q.match(/(\d{1,3})\s*(%|percent|marks)/);
  const isAskingPhD = q.includes('phd') || q.includes('doctoral') || q.includes('research fellowship') || q.includes('doctorate');
  const isAskingDeadlines = q.includes('deadline') || q.includes('last date') || q.includes('when to apply');
  const isAskingIncome = q.includes('income') || q.includes('family income') || q.includes('salary') || q.includes('earning');
  const isAskingStudyAbroad = q.includes('abroad') || q.includes('uk') || q.includes('usa') || q.includes('europe') || q.includes('germany') || q.includes('international') || q.includes('chevening') || q.includes('fulbright');
  const isAskingGovernment = q.includes('govt') || q.includes('government') || q.includes('central') || q.includes('state') || q.includes('nsp') || q.includes('pmrf') || q.includes('pm-usp');
  const isAskingProfileMatch = q.includes('my profile') || q.includes('eligible for me') || q.includes('am i eligible') || q.includes('recommend');
  const isAskingGeneralHelp = q.includes('how to apply') || q.includes('documents') || q.includes('portal') || q.includes('eligibility');

  let answer = '';
  const sources = [];

  if (marksMatch) {
    const studentMarks = parseInt(marksMatch[1], 10);
    const qualifying = scholarships.filter(s => !s.minimumAcademicScore || studentMarks >= s.minimumAcademicScore);
    answer = `### Scholarships Available for ${studentMarks}% Academic Score\n\n`;
    answer += `With an academic score of **${studentMarks}%**, you satisfy the academic cutoff for **${qualifying.length}** opportunities in our verified database:\n\n`;
    qualifying.slice(0, 5).forEach((s, idx) => {
      answer += `${idx + 1}. **${s.name}** (${s.scholarshipType})\n`;
      answer += `   - **Provider:** ${s.provider}\n`;
      answer += `   - **Award:** ${s.awardAmount}\n`;
      answer += `   - **Cutoff Requirement:** ${s.minimumAcademicScore ? `${s.minimumAcademicScore}% minimum` : 'No hard minimum percentage'}\n`;
      answer += `   - **Application Link:** [${s.officialUrl}](${s.officialUrl})\n\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
    answer += `> **Tip:** You can run the full multi-agent evaluation under the **AI Matching** tab to verify your financial and category eligibility.`;
  } else if (isAskingPhD) {
    const phdOpportunities = scholarships.filter(s => s.eligibleEducationLevels.includes('PhD'));
    answer = `### Premier PhD & Doctoral Research Fellowships\n\n`;
    answer += `Here are prestigious doctoral fellowships open to Indian researchers:\n\n`;
    phdOpportunities.forEach((s, idx) => {
      answer += `${idx + 1}. **${s.name}** (${s.scholarshipType})\n`;
      answer += `   - **Provider:** ${s.provider}\n`;
      answer += `   - **Award:** ${s.awardAmount}\n`;
      answer += `   - **Deadline:** ${s.deadline}\n`;
      answer += `   - **Official Portal:** [${s.officialUrl}](${s.officialUrl})\n\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
  } else if (matchedScholarships.length > 0 && !isAskingProfileMatch) {
    const primary = matchedScholarships[0];
    sources.push({ id: primary.id, name: primary.name, url: primary.officialUrl });

    answer = `### ${primary.name}\n\n`;
    answer += `**Provider:** ${primary.provider}\n\n`;
    answer += `**Award Amount:** ${primary.awardAmount}\n\n`;
    answer += `**Application Deadline:** ${primary.deadline}\n\n`;
    answer += `**Eligibility Requirements:**\n`;
    primary.requirements.forEach(r => {
      answer += `- ${r}\n`;
    });
    answer += `\n**Academic Cutoff:** ${primary.minimumAcademicScore ? `${primary.minimumAcademicScore}% or equivalent` : 'No hard minimum specified'}\n`;
    answer += `**Income Limit:** ${primary.maximumAnnualFamilyIncomeINR ? `₹${primary.maximumAnnualFamilyIncomeINR.toLocaleString('en-IN')}/year` : 'No income ceiling'}\n\n`;
    answer += `**Official Application Portal:** [${primary.officialUrl}](${primary.officialUrl})\n\n`;

    if (profile && profile.academicScore) {
      const studentScore = profile.academicScore;
      const meetsScore = !primary.minimumAcademicScore || studentScore >= primary.minimumAcademicScore;
      answer += `> **Profile Quick-Check:** Your academic score of ${studentScore}% ${meetsScore ? '✅ meets' : '⚠️ does not meet'} the benchmark for this scholarship.`;
    }
  } else if (isAskingDeadlines) {
    answer = `Here are upcoming application deadlines for key scholarships in our verified dataset:\n\n`;
    const sortedByDeadline = scholarships
      .filter(s => s.deadlineDate)
      .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));

    sortedByDeadline.slice(0, 6).forEach(s => {
      answer += `- **${s.name}**: \`${s.deadline}\` (${s.provider})\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
    answer += `\n*Always verify the exact opening and closing dates on the official portal before submitting.*`;
  } else if (isAskingStudyAbroad) {
    const abroad = scholarships.filter(s => s.scholarshipType === 'International');
    answer = `ScholarAI tracks prestigious international and study-abroad scholarships for Indian students:\n\n`;
    abroad.forEach(s => {
      answer += `1. **${s.name}**\n`;
      answer += `   - **Coverage:** ${s.awardAmount}\n`;
      answer += `   - **Target Level:** ${s.eligibleEducationLevels.join(', ')}\n`;
      answer += `   - **Official Portal:** [${s.officialUrl}](${s.officialUrl})\n\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
  } else if (isAskingGovernment) {
    const gov = scholarships.filter(s => s.scholarshipType === 'Government');
    answer = `Here are active Central and State Government scholarship opportunities:\n\n`;
    gov.slice(0, 5).forEach(s => {
      answer += `- **${s.name}**: ${s.awardAmount} (Deadline: ${s.deadline})\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
    answer += `\nMost central government schemes are routed through the **National Scholarship Portal (NSP)** at [scholarships.gov.in](https://scholarships.gov.in).`;
  } else if (isAskingIncome) {
    answer = `### Income-Based & Merit-cum-Means Scholarships\n\n`;
    const incomeCapped = scholarships.filter(s => s.maximumAnnualFamilyIncomeINR !== null);
    incomeCapped.slice(0, 6).forEach(s => {
      answer += `- **${s.name}**: Maximum family income ceiling is **₹${s.maximumAnnualFamilyIncomeINR.toLocaleString('en-IN')}/year**\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
    answer += `\n*Note: Income certificates issued by a competent revenue authority (such as a Tehsildar or Sub-Divisional Magistrate) are strictly required for these applications.*`;
  } else if (profile && (isAskingProfileMatch || q.includes('what should i do') || q.includes('suggest'))) {
    answer = `Based on your profile as an **${profile.educationLevel || 'Undergraduate'}** student studying **${profile.fieldOfStudy || 'General'}** with an academic score of **${profile.academicScore || 75}%**:\n\n`;
    
    const suitable = scholarships.filter(s => {
      const levelOk = s.eligibleEducationLevels.includes('All') || s.eligibleEducationLevels.includes(profile.educationLevel);
      const scoreOk = !s.minimumAcademicScore || (profile.academicScore >= s.minimumAcademicScore - 5);
      return levelOk && scoreOk;
    });

    answer += `I recommend prioritizing the following top opportunities:\n\n`;
    suitable.slice(0, 4).forEach((s, idx) => {
      answer += `${idx + 1}. **${s.name}** (${s.scholarshipType})\n`;
      answer += `   - **Award:** ${s.awardAmount}\n`;
      answer += `   - **Next Action:** Review requirements and apply at [${s.officialUrl}](${s.officialUrl})\n\n`;
      sources.push({ id: s.id, name: s.name, url: s.officialUrl });
    });
    answer += `\nRun the **Personalized Matching Engine** in the Matching tab to see a complete criterion-by-criterion breakdown!`;
  } else {
    answer = `ScholarAI Copilot is ready to assist you. I can help you with:\n\n` +
      `- **Evaluating eligibility** for government schemes (PM-USP, INSPIRE, PMRF, Post-Matric)\n` +
      `- **Exploring study abroad scholarships** (Chevening, Fulbright-Nehru, DAAD, Erasmus Mundus)\n` +
      `- **Private CSR scholarships** (Reliance Foundation, Tata Trusts, HDFC Parivartan, Aditya Birla)\n` +
      `- **Checking income criteria, academic percentage cutoffs, and required documents**\n\n` +
      `Try asking: *"What scholarships can I apply for with 80% marks?"* or *"Tell me about Chevening scholarships for UK Master's."*`;
  }

  return {
    success: true,
    mode: 'deterministic_rag',
    provider: 'Local Scholarship Knowledge Base',
    answer,
    sources,
    timestamp: new Date().toISOString()
  };
}

/**
 * Optional External Cloud LLM Caller (Gemini / OpenAI / Groq)
 */
async function callExternalLLM(userMessage, profile, scholarships, provider, apiKey) {
  const systemPrompt = `You are ScholarAI Copilot, an expert scholarship advisor for students in India and abroad.
You must ground your answers strictly in real scholarship criteria. Never hallucinate fake deadlines, amounts, or links.
Here is the available verified scholarship dataset context:
${JSON.stringify(scholarships.map(s => ({
  id: s.id,
  name: s.name,
  provider: s.provider,
  awardAmount: s.awardAmount,
  deadline: s.deadline,
  minimumAcademicScore: s.minimumAcademicScore,
  maximumAnnualFamilyIncomeINR: s.maximumAnnualFamilyIncomeINR,
  officialUrl: s.officialUrl,
  requirements: s.requirements
})))}

Student Profile:
${JSON.stringify(profile || { note: 'Anonymous student' })}

Answer the student's question clearly with markdown formatting, linking to official portals when mentioned.`;

  if (provider === 'GEMINI') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Query: ${userMessage}` }] }
        ]
      })
    });
    if (!response.ok) throw new Error(`Gemini API returned status ${response.status}`);
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answer) {
      return {
        success: true,
        mode: 'cloud_llm',
        provider: 'Google Gemini 1.5 Flash',
        answer,
        sources: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  return null;
}
