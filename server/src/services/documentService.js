import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts and analyzes text from uploaded student documents (PDF or plain text).
 * Extracts self-reported credentials without fabricating unverified information.
 */
export async function parseUploadedDocument(fileBuffer, mimetype, originalname) {
  let rawText = '';
  let isScannedOrEmpty = false;

  try {
    if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(fileBuffer);
      rawText = data.text || '';
      if (!rawText.trim() || rawText.length < 20) {
        isScannedOrEmpty = true;
      }
    } else {
      // Plain text or markdown
      rawText = fileBuffer.toString('utf-8');
    }
  } catch (err) {
    console.warn(`PDF parse error for ${originalname}:`, err.message);
    return {
      success: false,
      error: `Could not parse document: ${err.message}. Please upload a standard text PDF or enter details manually.`,
      extractedData: null
    };
  }

  if (isScannedOrEmpty) {
    return {
      success: true,
      filename: originalname,
      isScanned: true,
      warning: 'Scanned document detected with no extractable text layer. Please verify and manually input your credentials.',
      extractedData: {
        rawTextLength: 0,
        foundEntities: {}
      }
    };
  }

  // Deterministic Entity Extraction
  const extracted = extractEntitiesFromText(rawText);

  return {
    success: true,
    filename: originalname,
    isScanned: false,
    textSnippet: rawText.slice(0, 500),
    extractedData: extracted
  };
}

/**
 * Heuristic entity extractor for resume/marksheet text
 */
function extractEntitiesFromText(text) {
  const normalized = text.replace(/\s+/g, ' ');
  const entities = {};

  // 1. CGPA or Percentage Extraction
  const cgpaMatch = normalized.match(/(?:cgpa|gpa|score|grade point average)[\s:=]+([0-9]\.?[0-9]*)\s*(?:\/\s*10)?/i);
  if (cgpaMatch && parseFloat(cgpaMatch[1]) <= 10) {
    entities.academicScore = parseFloat(cgpaMatch[1]);
    entities.scoreType = 'CGPA (10-scale)';
  } else {
    const percentMatch = normalized.match(/([0-9]{2}(?:\.[0-9]+)?)\s*%/);
    if (percentMatch && parseFloat(percentMatch[1]) <= 100) {
      entities.academicScore = parseFloat(percentMatch[1]);
      entities.scoreType = 'Percentage';
    }
  }

  // 2. Degree or Education Level
  if (/(?:b\.?tech|bachelor of technology|b\.?e\b|bachelor of engineering)/i.test(normalized)) {
    entities.degree = 'B.Tech / Bachelor of Engineering';
    entities.educationLevel = 'Undergraduate';
  } else if (/(?:m\.?tech|master of technology|m\.?sc|master of science|m\.?s\b)/i.test(normalized)) {
    entities.degree = 'M.Tech / M.Sc / Master of Science';
    entities.educationLevel = 'Postgraduate';
  } else if (/(?:ph\.?d|doctor of philosophy|doctoral)/i.test(normalized)) {
    entities.educationLevel = 'PhD';
  }

  // 3. Institution / University Keywords
  const instMatch = normalized.match(/(?:institute|university|college|nit|iit|dtu|bits)[\w\s,]+(?:university|institute|technology|college|jalandhar|delhi|bombay|madras|roorkee|kharagpur)?/i);
  if (instMatch && instMatch[0].length < 80) {
    entities.institution = instMatch[0].trim();
  }

  // 4. Skills extraction from known technical dictionary
  const skillKeywords = [
    'Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 
    'Natural Language Processing', 'NLP', 'Computer Vision', 'Data Science', 
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL',
    'Docker', 'Kubernetes', 'Algorithms', 'Cloud Computing', 'Git'
  ];
  const detectedSkills = [];
  skillKeywords.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[+]/g, '\\+')}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedSkills.push(skill);
    }
  });
  if (detectedSkills.length > 0) {
    entities.skills = detectedSkills;
  }

  // 5. Target Destinations (if mentioned in objectives or cover note)
  const countries = ['Canada', 'Germany', 'Singapore', 'USA', 'United States', 'UK', 'United Kingdom', 'Australia'];
  const detectedDestinations = [];
  countries.forEach(c => {
    const regex = new RegExp(`\\b${c}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedDestinations.push(c === 'United States' ? 'USA' : c === 'United Kingdom' ? 'UK' : c);
    }
  });
  if (detectedDestinations.length > 0) {
    entities.targetDestinations = Array.from(new Set(detectedDestinations));
  }

  return entities;
}
