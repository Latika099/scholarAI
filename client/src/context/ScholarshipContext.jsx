import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedScholarshipIds, toggleSaveScholarship } from '../services/api';

const ScholarshipContext = createContext();

const PROFILE_STORAGE_KEY = 'scholarai_student_profile';

// Rahul Demo Scenario (TetraNoodle AI Hackathon 2026 Challenge Spec)
export const RAHUL_DEMO_PROFILE = {
  fullName: 'Rahul Sharma',
  countryOfResidence: 'India',
  nationality: 'India',
  educationLevel: 'Undergraduate',
  degree: 'B.Tech in Computer Science & Engineering',
  institution: 'Dr. B. R. Ambedkar National Institute of Technology (NIT) Jalandhar',
  graduationYear: 2026,
  academicScore: 8.2, // CGPA 8.2 out of 10
  annualFamilyIncomeINR: 550000,
  targetDestinations: ['Canada', 'Germany', 'Singapore'],
  fieldOfStudy: 'Computer Science',
  skills: ['Python', 'PyTorch', 'Deep Learning', 'Natural Language Processing', 'REST APIs', 'React'],
  achievements: 'Winner of Inter-College AI Hackathon 2025; Lead Developer on Transformer Optimization Thesis Project',
  githubUsername: 'rahul-cs-jalandhar',
  githubData: {
    username: 'rahul-cs-jalandhar',
    profileUrl: 'https://github.com/rahul-cs-jalandhar',
    publicReposCount: 8,
    topLanguages: ['Python', 'C++', 'JavaScript'],
    highlightedProjects: [
      {
        name: 'transformer-quantization',
        description: 'Low-latency quantization of vision transformers for edge devices',
        stars: 14,
        language: 'Python'
      },
      {
        name: 'nlp-sentiment-indic',
        description: 'Multilingual sentiment analysis pipeline for low-resource Indian languages',
        stars: 9,
        language: 'Python'
      }
    ]
  },
  preferredScholarshipType: 'All',
  preferredFundingType: 'Fully Funded',
  casteCategory: 'General',
  firstGenerationStudent: false,
  personWithDisability: false,
  extracurriculars: 'Volunteer mentor for school STEM robotics club, open source contributor'
};

export const EMPTY_FRESH_PROFILE = {
  fullName: '',
  countryOfResidence: 'India',
  nationality: 'India',
  educationLevel: 'Undergraduate',
  degree: '',
  institution: '',
  graduationYear: 2026,
  academicScore: '',
  annualFamilyIncomeINR: '',
  targetDestinations: ['Canada', 'Germany', 'Singapore'],
  fieldOfStudy: 'Computer Science',
  skills: [],
  achievements: '',
  githubUsername: '',
  githubData: null,
  preferredScholarshipType: 'All',
  preferredFundingType: 'Any',
  casteCategory: 'General',
  firstGenerationStudent: false,
  personWithDisability: false,
  extracurriculars: ''
};

export function ScholarshipProvider({ children }) {
  // 1. Student Profile
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : RAHUL_DEMO_PROFILE;
    } catch {
      return RAHUL_DEMO_PROFILE;
    }
  });

  // 2. Saved Bookmarks
  const [savedIds, setSavedIds] = useState(getSavedScholarshipIds());

  // 3. Navigation View ('home', 'discovery', 'profile', 'matches', 'saved', 'assistant')
  const [currentView, setCurrentView] = useState('home');

  // 4. Modal Detail View
  const [activeScholarshipModal, setActiveScholarshipModal] = useState(null);

  // 5. Application Assistant (SOP Drafter) Modal
  const [activeSopScholarship, setActiveSopScholarship] = useState(null);

  // 6. Multi-Agent Pipeline Results
  const [pipelineResults, setPipelineResults] = useState(null);
  const [isMatchingRunning, setIsMatchingRunning] = useState(false);

  // Save profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Could not save profile to storage', e);
    }
  }, [profile]);

  const handleToggleSave = (id) => {
    const updated = toggleSaveScholarship(id);
    setSavedIds(updated);
  };

  const isSaved = (id) => savedIds.includes(id);

  const resetToRahulScenario = () => {
    setProfile(RAHUL_DEMO_PROFILE);
    setPipelineResults(null); // invalidate previous matches to rerun with Rahul's fresh profile
  };

  const resetToEmptyProfile = () => {
    setProfile(EMPTY_FRESH_PROFILE);
    setPipelineResults(null);
  };

  return (
    <ScholarshipContext.Provider
      value={{
        profile,
        setProfile,
        savedIds,
        isSaved,
        toggleSave: handleToggleSave,
        currentView,
        setCurrentView,
        activeScholarshipModal,
        openModal: setActiveScholarshipModal,
        closeModal: () => setActiveScholarshipModal(null),
        activeSopScholarship,
        openSopModal: setActiveSopScholarship,
        closeSopModal: () => setActiveSopScholarship(null),
        pipelineResults,
        setPipelineResults,
        isMatchingRunning,
        setIsMatchingRunning,
        resetToRahulScenario,
        resetToEmptyProfile
      }}
    >
      {children}
    </ScholarshipContext.Provider>
  );
}

export function useScholarship() {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error('useScholarship must be used within a ScholarshipProvider');
  }
  return context;
}
