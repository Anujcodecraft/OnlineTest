// routes/test.routes.js
import express from 'express';
import Test from '../models/Test.js';
import { authenticateJWT, authorizeAdmin } from '../Middleware/auth.js';

const router = express.Router();

// Create test (Admin only)
router.post('/create', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, testCode, duration, startTime, endTime, questions } = req.body;
    if (!title || !testCode || !duration || !startTime || !endTime || !questions) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await Test.findOne({ testCode });
    if (existing) return res.status(409).json({ message: 'Test code already exists.' });

    const test = new Test({
      title,
      description,
      testCode,
      duration,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
      createdBy: req.user.id
    });
    await test.save();
    res.status(201).json({ message: 'Test created.', test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get test info by code (only if live)
router.get('/join/:testCode', authenticateJWT, async (req, res) => {
  try {
    const { testCode } = req.params;
    
    const test = await Test.findOne({ testCode }).select('-questions.correctAnswer');

    if (!test) return res.status(404).json({ message: 'Test not found.' });

    const now = new Date();
    console.log(now)
    if (now < test.startTime || now > test.endTime) {
      return res.status(403).json({ message: 'Test is not currently live.' });
    }

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
