import express from 'express';
import { askAssistant } from '../services/llmService.js';
import { draftStatementOfPurpose } from '../services/sopDrafter.js';

const router = express.Router();

// POST /api/assistant/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, profile, history } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Query message is required' });
    }

    const reply = await askAssistant(message, profile, history);
    res.json(reply);
  } catch (err) {
    console.error('Assistant error:', err);
    res.status(500).json({
      success: false,
      error: 'Assistant service encountered an error',
      details: err.message
    });
  }
});

// POST /api/assistant/draft-sop - Generate tailored draft statement of purpose / motivation letter
router.post('/draft-sop', (req, res) => {
  try {
    const { scholarship, profile } = req.body;
    if (!scholarship) {
      return res.status(400).json({ success: false, error: 'Scholarship data is required to draft an SOP.' });
    }

    const draft = draftStatementOfPurpose(scholarship, profile || {});
    res.json(draft);
  } catch (err) {
    console.error('SOP drafting error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Statement of Purpose draft',
      details: err.message
    });
  }
});

export default router;
