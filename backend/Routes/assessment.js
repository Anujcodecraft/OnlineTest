// routes/assessment.routes.js
import express from 'express';
import Assessment from '../models/Assessment.js';
import Test from '../models/Test.js';
import { authenticateJWT } from '../Middleware/auth.js';

const router = express.Router();

// Start assessment (creates assessment doc with start time)
router.post('/start', authenticateJWT, async (req, res) => {
  try {
    const { testCode } = req.body;
    const test = await Test.findOne({ testCode });
    if (!test) return res.status(404).json({ message: 'Test not found.' });

    const now = new Date();
    if (now < test.startTime || now > test.endTime) {
      return res.status(403).json({ message: 'Test is not currently live.' });
    }

    // Check if user already started
    const existingAssessment = await Assessment.findOne({ userId: req.user.id, testId: test._id });
    if (existingAssessment && existingAssessment.completed) {
      return res.status(403).json({ message: 'You have already completed this test.' });
    }
    if (existingAssessment && !existingAssessment.completed) {
      return res.json({ message: 'Test already started.', assessment: existingAssessment });
    }

    // Create assessment doc
    const assessment = new Assessment({
      userId: req.user.id,
      testId: test._id,
      startedAt: now,
      userAnswers: []
    });

    await assessment.save();
    res.json({ message: 'Assessment started.', assessment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit assessment (calculate score)
router.post('/submit', authenticateJWT, async (req, res) => {
  try {
    const { testCode, userAnswers } = req.body;

    const test = await Test.findOne({ testCode });
    if (!test) return res.status(404).json({ message: 'Test not found.' });

    const assessment = await Assessment.findOne({ userId: req.user.id, testId: test._id });
    if (!assessment) return res.status(400).json({ message: 'Assessment not started.' });
    if (assessment.completed) return res.status(403).json({ message: 'Assessment already submitted.' });

    // Check if within allowed duration
    const now = new Date();
    const maxEndTime = new Date(assessment.startedAt.getTime() + test.duration * 60000);
    if (now > maxEndTime) {
      return res.status(403).json({ message: 'Time is up. Cannot submit.' });
    }

    // Calculate score
    let score = 0;
    test.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });

    assessment.userAnswers = userAnswers;
    assessment.score = score;
    assessment.completed = true;
    assessment.submittedAt = now;
    assessment.timeTaken = (now - assessment.startedAt) / 1000;

    await assessment.save();

    res.json({ message: 'Assessment submitted.', score, total: test.questions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
