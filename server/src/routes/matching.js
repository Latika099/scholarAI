import express from 'express';
import multer from 'multer';
import { runScholarshipPipeline } from '../agents/orchestrator.js';
import { analyzeStudentProfile } from '../agents/profileAnalyzer.js';
import { loadScholarships } from '../services/scholarshipService.js';
import { parseUploadedDocument } from '../services/documentService.js';
import { fetchGitHubProfile } from '../services/githubService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/matching/run - Execute complete 4-agent scholarship pipeline
router.post('/run', async (req, res) => {
  try {
    const rawProfile = req.body.profile || {};
    const filters = req.body.filters || {};
    const allScholarships = loadScholarships();

    const pipelineResult = await runScholarshipPipeline(rawProfile, allScholarships, filters);
    res.json(pipelineResult);
  } catch (err) {
    console.error('Pipeline execution error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to complete multi-agent matching pipeline',
      details: err.message
    });
  }
});

// POST /api/profile/analyze - Agent 1 standalone analysis
router.post('/analyze', (req, res) => {
  try {
    const rawProfile = req.body || {};
    const result = analyzeStudentProfile(rawProfile);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/profile/upload-doc - Parse marksheet or resume document (PDF or Text)
router.post('/upload-doc', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file uploaded.' });
    }

    const result = await parseUploadedDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json(result);
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ success: false, error: 'Failed to parse document', details: err.message });
  }
});

// POST /api/profile/github - Retrieve public GitHub profile and repository metadata
router.post('/github', async (req, res) => {
  try {
    const { urlOrUsername } = req.body;
    if (!urlOrUsername) {
      return res.status(400).json({ success: false, error: 'GitHub URL or username is required.' });
    }

    const result = await fetchGitHubProfile(urlOrUsername);
    res.json(result);
  } catch (err) {
    console.error('GitHub fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch GitHub profile', details: err.message });
  }
});

export default router;
