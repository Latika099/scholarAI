import React, { useState } from 'react';
import { useScholarship, RAHUL_DEMO_PROFILE, EMPTY_FRESH_PROFILE } from '../context/ScholarshipContext';
import { analyzeProfile, uploadStudentDocument, fetchGitHubProfileData } from '../services/api';
import { 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Save, 
  ArrowRight,
  Upload,
  FileText,
  Github,
  Zap,
  RotateCcw,
  Loader2,
  Globe,
  Award
} from 'lucide-react';

export default function Profile() {
  const { profile, setProfile, setCurrentView, resetToRahulScenario, resetToEmptyProfile } = useScholarship();
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Document upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // GitHub fetch state
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubFeedback, setGithubFeedback] = useState(null);

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setSaveSuccess(false);
  };

  // Target destinations toggle
  const toggleDestination = (country) => {
    const current = formData.targetDestinations || [];
    let updated;
    if (current.includes(country)) {
      updated = current.filter(c => c !== country);
    } else {
      updated = [...current, country];
    }
    handleChange('targetDestinations', updated);
  };

  // Load Rahul Demo Scenario
  const handleLoadRahul = () => {
    resetToRahulScenario();
    setFormData(RAHUL_DEMO_PROFILE);
    setSaveSuccess(true);
    setUploadFeedback({ type: 'success', message: 'Loaded Rahul Demo Scenario (NIT Jalandhar B.Tech CS, CGPA 8.2, Canada/Germany/Singapore).' });
  };

  // Reset to Empty
  const handleResetEmpty = () => {
    resetToEmptyProfile();
    setFormData(EMPTY_FRESH_PROFILE);
    setSaveSuccess(false);
    setUploadFeedback(null);
    setGithubFeedback(null);
  };

  // Document Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingDoc(true);
      setUploadFeedback(null);
      const res = await uploadStudentDocument(file);
      
      if (res.success && res.extractedData) {
        const ext = res.extractedData;
        const updated = { ...formData };
        if (ext.academicScore) updated.academicScore = ext.academicScore;
        if (ext.degree) updated.degree = ext.degree;
        if (ext.institution) updated.institution = ext.institution;
        if (ext.skills && ext.skills.length > 0) {
          updated.skills = Array.from(new Set([...(updated.skills || []), ...ext.skills]));
        }
        if (ext.targetDestinations && ext.targetDestinations.length > 0) {
          updated.targetDestinations = Array.from(new Set([...(updated.targetDestinations || []), ...ext.targetDestinations]));
        }

        setFormData(updated);
        setProfile(updated);
        setUploadFeedback({
          type: res.isScanned ? 'warning' : 'success',
          message: res.warning || `Extracted qualifications from ${file.name}: ${ext.academicScore ? `Score: ${ext.academicScore}` : ''} ${ext.skills ? `(${ext.skills.length} skills)` : ''}`
        });
      } else {
        setUploadFeedback({ type: 'error', message: res.error || 'Could not parse document text.' });
      }
    } catch (err) {
      setUploadFeedback({ type: 'error', message: err.message });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // GitHub Fetch Handler
  const handleFetchGithub = async () => {
    const query = (formData.githubUsername || '').trim();
    if (!query) {
      setGithubFeedback({ type: 'error', message: 'Enter a valid GitHub username or URL first.' });
      return;
    }

    try {
      setIsFetchingGithub(true);
      setGithubFeedback(null);
      const res = await fetchGitHubProfileData(query);

      if (res.success) {
        const updated = {
          ...formData,
          githubUsername: res.username,
          githubData: res
        };
        // Merge top languages into skills
        if (res.topLanguages && res.topLanguages.length > 0) {
          updated.skills = Array.from(new Set([...(updated.skills || []), ...res.topLanguages]));
        }

        setFormData(updated);
        setProfile(updated);
        setGithubFeedback({
          type: 'success',
          message: res.summary || `Verified GitHub @${res.username}: ${res.publicReposCount} public repositories found.`
        });
      } else {
        setGithubFeedback({ type: 'error', message: res.error || 'Failed to retrieve GitHub profile.' });
      }
    } catch (err) {
      setGithubFeedback({ type: 'error', message: err.message });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.fullName || formData.fullName.trim() === '') {
      errs.fullName = 'Please enter your full name.';
    }
    if (!formData.degree || formData.degree.trim() === '') {
      errs.degree = 'Please specify your degree or course.';
    }
    if (!formData.institution || formData.institution.trim() === '') {
      errs.institution = 'Please specify your college or university.';
    }
    if (formData.academicScore === undefined || formData.academicScore === '' || isNaN(formData.academicScore)) {
      errs.academicScore = 'Please enter your CGPA or marks percentage.';
    } else {
      const score = parseFloat(formData.academicScore);
      if (score <= 0 || score > 100) {
        errs.academicScore = 'Score must be between 1 and 100 (or 1 to 10 for CGPA).';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setProfile(formData);
    setSaveSuccess(true);
  };

  const handleSaveAndMatch = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setProfile(formData);
    setCurrentView('matches');
  };

  // Completeness metric
  const filledFields = [
    formData.fullName,
    formData.educationLevel,
    formData.degree,
    formData.institution,
    formData.academicScore,
    formData.annualFamilyIncomeINR,
    formData.fieldOfStudy,
    (formData.targetDestinations || []).length > 0 ? 'dest' : null,
    (formData.skills || []).length > 0 ? 'skills' : null
  ].filter(f => f !== null && f !== undefined && f !== '').length;
  const completeness = Math.round((filledFields / 9) * 100);

  const availableDestinations = ['Canada', 'Germany', 'Singapore', 'India', 'UK', 'USA', 'Australia'];

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Student Academic Profile & Document Verification
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Configure your academic qualifications, upload resumes or marksheets, link your public GitHub projects, and set target study destinations.
        </p>

        {/* Hackathon Challenge 1-Click Preset Bar */}
        <div 
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 100%)',
            border: '1.5px solid var(--primary-200)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-900)' }}>
              <Zap size={18} color="var(--primary-600)" />
              <span>TetraNoodle Hackathon 2026 Evaluation Scenarios</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Switch instantly between Rahul's target scenario (NIT Jalandhar, CGPA 8.2, Canada/Germany/Singapore) and a fresh profile.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleLoadRahul}
              style={{ boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)' }}
            >
              <Sparkles size={14} />
              <span>Load Rahul Demo Scenario</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleResetEmpty}
            >
              <RotateCcw size={14} />
              <span>Reset to Empty Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completeness Bar */}
      <div 
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Profile Completeness (Agent 1 Metric)</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              {completeness}%
            </span>
          </div>
          <div 
            style={{
              width: '100%',
              height: '8px',
              background: 'var(--border-light)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: `${completeness}%`,
                height: '100%',
                background: completeness > 80 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, var(--primary-500), var(--primary-600))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {completeness > 80 ? '✅ Comprehensive Profile Ready for Multi-Agent Pipeline' : '⚠️ Add skills or study destinations to maximize match accuracy'}
        </div>
      </div>

      {/* Document Upload & GitHub Integration Box */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Document Parser Box */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Resume & Marksheet Document Upload
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Upload your academic marksheet or resume (PDF or TXT). Agent 1 extracts your CGPA, degree, and verified technical skills.
          </p>

          <label 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--primary-300)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              cursor: 'pointer',
              background: 'var(--bg-page)',
              transition: 'all 0.2s ease'
            }}
          >
            {isUploadingDoc ? (
              <Loader2 size={24} className="animate-spin" color="var(--primary-600)" />
            ) : (
              <Upload size={24} color="var(--primary-600)" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.4rem', color: 'var(--primary-700)' }}>
              {isUploadingDoc ? 'Parsing Document...' : 'Choose PDF or TXT Document'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max file size 5MB</span>
            <input 
              type="file" 
              accept=".pdf,.txt" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
              disabled={isUploadingDoc}
            />
          </label>

          {uploadFeedback && (
            <div 
              style={{
                marginTop: '0.75rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                background: uploadFeedback.type === 'error' ? 'var(--danger-bg)' : uploadFeedback.type === 'warning' ? 'var(--warning-bg)' : 'var(--success-bg)',
                color: uploadFeedback.type === 'error' ? 'var(--danger-text)' : uploadFeedback.type === 'warning' ? 'var(--warning-text)' : 'var(--success-text)',
                border: `1px solid ${uploadFeedback.type === 'error' ? 'var(--danger-border)' : uploadFeedback.type === 'warning' ? 'var(--warning-border)' : 'var(--success-border)'}`
              }}
            >
              {uploadFeedback.message}
            </div>
          )}
        </div>

        {/* GitHub Integration Box */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Github size={18} color="var(--text-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Verified Public GitHub Profile Linker
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Enter your public GitHub profile or username. ScholarAI queries public repositories and languages to ground your research credentials.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. rahul-cs-jalandhar or github.com/..."
              value={formData.githubUsername || ''}
              onChange={(e) => handleChange('githubUsername', e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleFetchGithub}
              disabled={isFetchingGithub}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isFetchingGithub ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
              <span>Verify</span>
            </button>
          </div>

          {githubFeedback && (
            <div 
              style={{
                marginTop: '0.75rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                background: githubFeedback.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
                color: githubFeedback.type === 'error' ? 'var(--danger-text)' : 'var(--success-text)',
                border: `1px solid ${githubFeedback.type === 'error' ? 'var(--danger-border)' : 'var(--success-border)'}`
              }}
            >
              {githubFeedback.message}
            </div>
          )}

          {formData.githubData && formData.githubData.highlightedProjects?.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Verified Public Repos:</strong> {formData.githubData.highlightedProjects.map(p => p.name).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
        {/* Section 1: Target Study Destinations */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <Globe size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--primary-900)' }}>
              1. Target Study Destinations (Select All That Apply)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            ScholarAI's Web Researcher filters scholarships tenable in these countries for your higher studies.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {availableDestinations.map(country => {
              const selected = (formData.targetDestinations || []).includes(country);
              return (
                <button
                  type="button"
                  key={country}
                  onClick={() => toggleDestination(country)}
                  className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 0.85rem' }}
                >
                  {selected && <CheckCircle2 size={13} />}
                  <span>{country}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Personal & Academic Credentials */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-900)' }}>
            2. Academic Background & Performance
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
              {errors.fullName && <div className="form-error"><AlertCircle size={13} /> {errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Current Education Level *</label>
              <select
                className="form-select"
                value={formData.educationLevel || 'Undergraduate'}
                onChange={(e) => handleChange('educationLevel', e.target.value)}
              >
                <option value="Undergraduate">Undergraduate (Final-Year B.Tech, B.Sc)</option>
                <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, Master's)</option>
                <option value="PhD">PhD / Doctoral Candidate</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="School">School (Class 9-12)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Degree / Course Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech in Computer Science & Engineering"
                value={formData.degree || ''}
                onChange={(e) => handleChange('degree', e.target.value)}
              />
              {errors.degree && <div className="form-error"><AlertCircle size={13} /> {errors.degree}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">College or University *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. NIT Jalandhar"
                value={formData.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
              />
              {errors.institution && <div className="form-error"><AlertCircle size={13} /> {errors.institution}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Academic Score (CGPA out of 10 or Percentage) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 8.2 (CGPA) or 82.0 (%)"
                value={formData.academicScore ?? ''}
                onChange={(e) => handleChange('academicScore', e.target.value)}
              />
              <div className="form-hint">Agent 1 normalizes 10-scale CGPA to standard percentage.</div>
              {errors.academicScore && <div className="form-error"><AlertCircle size={13} /> {errors.academicScore}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Expected Graduation Year</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 2026"
                value={formData.graduationYear || 2026}
                onChange={(e) => handleChange('graduationYear', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills & Projects */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <Award size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--primary-900)' }}>
              3. Technical Skills, AI Projects & Achievements
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills & Tooling (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, PyTorch, Deep Learning, Natural Language Processing, REST APIs"
              value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
              onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Honors, Awards & Key AI Projects</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g. Winner of Inter-College AI Hackathon 2025; Lead Developer on Transformer Optimization Thesis Project"
              value={formData.achievements || ''}
              onChange={(e) => handleChange('achievements', e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Financial & Category */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-900)' }}>
            4. Financial Need & Affirmative Action
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Annual Family Income in INR</label>
              <input
                type="number"
                step="10000"
                className="form-input"
                placeholder="e.g. 550000"
                value={formData.annualFamilyIncomeINR ?? ''}
                onChange={(e) => handleChange('annualFamilyIncomeINR', e.target.value)}
              />
              <div className="form-hint">Used for means-tested scholarships (e.g. PM-USP, Post-Matric). Leave blank if unverified.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Social / Caste Category</label>
              <select
                className="form-select"
                value={formData.casteCategory || 'General'}
                onChange={(e) => handleChange('casteCategory', e.target.value)}
              >
                <option value="General">General / Unreserved</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Success Notice */}
        {saveSuccess && (
          <div 
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.88rem'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Profile verified and synchronized with local browser storage!</span>
          </div>
        )}

        {/* Actions */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={14} /> Data is stored locally in your browser. Never submit passwords or confidential identity numbers.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-secondary">
              <Save size={16} />
              <span>Save Profile</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSaveAndMatch}
            >
              <Sparkles size={16} />
              <span>Save & Run AI Matching</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
