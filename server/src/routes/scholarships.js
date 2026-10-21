import express from 'express';
import { getAllScholarships, getScholarshipById, getDatasetStatistics } from '../services/scholarshipService.js';

const router = express.Router();

// GET /api/scholarships/stats
router.get('/stats', (req, res) => {
  try {
    const stats = getDatasetStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scholarships/:id
router.get('/:id', (req, res) => {
  try {
    const scholarship = getScholarshipById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }
    res.json({ success: true, data: scholarship });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scholarships
router.get('/', (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      educationLevel: req.query.educationLevel,
      fundingType: req.query.fundingType
    };
    const results = getAllScholarships(filters);
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
