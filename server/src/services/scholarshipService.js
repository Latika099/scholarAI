import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../data/scholarships.json');

let cachedScholarships = null;

export function loadScholarships() {
  if (cachedScholarships) return cachedScholarships;
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    cachedScholarships = JSON.parse(raw);
    return cachedScholarships;
  } catch (err) {
    console.error('Failed to load scholarships.json:', err);
    return [];
  }
}

export function getAllScholarships(filters = {}) {
  const all = loadScholarships();
  return all.filter((s) => {
    if (filters.type && filters.type !== 'All') {
      if (s.scholarshipType.toLowerCase() !== filters.type.toLowerCase()) return false;
    }
    if (filters.educationLevel && filters.educationLevel !== 'All') {
      if (!s.eligibleEducationLevels.includes('All') && !s.eligibleEducationLevels.includes(filters.educationLevel)) {
        return false;
      }
    }
    if (filters.fundingType && filters.fundingType !== 'All') {
      if (!s.fundingType.toLowerCase().includes(filters.fundingType.toLowerCase())) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });
}

export function getScholarshipById(id) {
  const all = loadScholarships();
  return all.find(s => s.id === id) || null;
}

export function getDatasetStatistics() {
  const all = loadScholarships();
  const byType = {};
  const byLevel = {};
  let totalVerified = 0;

  all.forEach((s) => {
    byType[s.scholarshipType] = (byType[s.scholarshipType] || 0) + 1;
    s.eligibleEducationLevels.forEach((lvl) => {
      byLevel[lvl] = (byLevel[lvl] || 0) + 1;
    });
    if (s.verifiedStatus === 'VERIFIED') totalVerified += 1;
  });

  return {
    totalCount: all.length,
    totalVerified,
    byType,
    byLevel
  };
}
