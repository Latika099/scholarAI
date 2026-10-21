const API_BASE = '/api';

export async function fetchScholarships(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.type && filters.type !== 'All') query.append('type', filters.type);
  if (filters.educationLevel && filters.educationLevel !== 'All') query.append('educationLevel', filters.educationLevel);
  if (filters.fundingType && filters.fundingType !== 'All') query.append('fundingType', filters.fundingType);

  const res = await fetch(`${API_BASE}/scholarships?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scholarships');
  const data = await res.json();
  return data.data || [];
}

export async function fetchScholarshipStats() {
  const res = await fetch(`${API_BASE}/scholarships/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  const data = await res.json();
  return data.data;
}

export async function fetchScholarshipById(id) {
  const res = await fetch(`${API_BASE}/scholarships/${id}`);
  if (!res.ok) throw new Error('Failed to fetch scholarship details');
  const data = await res.json();
  return data.data;
}

export async function runMatchingPipeline(profile, filters = {}) {
  const res = await fetch(`${API_BASE}/matching/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, filters })
  });
  if (!res.ok) throw new Error('Failed to run matching pipeline');
  return await res.json();
}

export async function analyzeProfile(profile) {
  const res = await fetch(`${API_BASE}/profile/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to analyze profile');
  const data = await res.json();
  return data.data;
}

export async function uploadStudentDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch(`${API_BASE}/profile/upload-doc`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Document extraction failed');
  return await res.json();
}

export async function fetchGitHubProfileData(urlOrUsername) {
  const res = await fetch(`${API_BASE}/profile/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlOrUsername })
  });
  if (!res.ok) throw new Error('Failed to fetch GitHub metadata');
  return await res.json();
}

export async function generateDraftSOP(scholarship, profile) {
  const res = await fetch(`${API_BASE}/assistant/draft-sop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scholarship, profile })
  });
  if (!res.ok) throw new Error('Failed to generate SOP draft');
  return await res.json();
}

export async function sendChatMessage(message, profile, history = []) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, profile, history })
  });
  if (!res.ok) throw new Error('Failed to get response from assistant');
  return await res.json();
}

export async function fetchAgentStatus() {
  const res = await fetch(`${API_BASE}/agents/status`);
  if (!res.ok) throw new Error('Failed to fetch agent status');
  return await res.json();
}

// LocalStorage Bookmarks Manager
const BOOKMARKS_KEY = 'scholarai_saved_scholarships';

export function getSavedScholarshipIds() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed reading bookmarks from localStorage', err);
    return [];
  }
}

export function toggleSaveScholarship(id) {
  try {
    const saved = getSavedScholarshipIds();
    let updated;
    if (saved.includes(id)) {
      updated = saved.filter(item => item !== id);
    } else {
      updated = [...saved, id];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed toggling bookmark', err);
    return [];
  }
}

export function isScholarshipSaved(id) {
  return getSavedScholarshipIds().includes(id);
}
