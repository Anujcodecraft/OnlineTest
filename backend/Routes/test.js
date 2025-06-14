// routes/test.routes.js
import express from 'express';
import Test from '../models/Test.js';
import { authenticateJWT, authorizeAdmin } from '../Middleware/auth.js';
import Assessment from '../models/Assessment.js';
const router = express.Router();
import mongoose from 'mongoose';

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


router.get('/creator/:creatorId', authenticateJWT,authorizeAdmin, async (req, res) => {
  try {
    const { creatorId } = req.params;
   console.log("the id is",creatorId)
    // 🔒 Simple authorization check
    if (req.user.role !== 'admin' ) {
      return res
        .status(403)
        .json({ message: 'Access denied. Only the author or an admin can view these tests.' });
    }

    // 🗂  Fetch tests, including creator info and full question objects
    const tests = await Test.find({ createdBy: creatorId })
           // basic author info
                            // full questions array
      .lean();                                       // plain JS objects (faster, smaller)
 
    return res.json(tests);
  } catch (err) {
    console.error('[GET /tests/creator/:creatorId] ‑', err);
    res.status(500).json({ message: err.message });
  }
});



router.get('/test/:testId', authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;
    console.log("test id is ", testId);
    const objectId = new mongoose.Types.ObjectId(testId);
    console.log("test id is ", testId, objectId);
    // console.log("test id type", Mongoose.objectId(testId));
    const assessments = await Assessment.find({ testId:objectId }).populate('userId', 'name').lean();
                 // basic test info
                                          // return plain JS objects
    console.log("assessments", assessments)
    if (!assessments.length) {
      return res
        .status(404)
        .json({ message: 'No assessments found for this test.' });
    }
    console.log("assessments again", assessments)

    res.json({ data: assessments });
  } catch (err) {
    console.error('Failed to fetch assessments:', err);
    res.status(500).json({ message: err.message });
  }
});





// routes/assessments.js  (or wherever you defined this router)
router.get('/user/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;

    // ─── Authorisation ────────────────────────────────────────────────
    // Students may only view their own results; teachers/admins can view anyone.
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // ─── Fetch + populate ────────────────────────────────────────────
    const assessments = await Assessment.find({ userId })
      .populate({
        path: 'testId',
        select:
          'title testCode description duration startTime endTime createdBy', // choose only what you need
        populate: {
          path: 'createdBy',
          select: 'name email', // optional: who made the test
        },
      })
      .sort({ startedAt: -1 }) // newest first
      .lean(); // plain JS objects (saves memory)

    if (!assessments.length) {
      return res
        .status(404)
        .json({ message: 'No assessments found for this user.' });
    }

    res.json({ data: assessments });
  } catch (err) {
    console.error('Failed to fetch assessments:', err);
    res.status(500).json({ message: err.message });
  }
});






/**
 * GET /api/assessments/:assessmentId/details
 *  ↳ Returns assessment + full test data (questions + correct answers)
 *  Access rules:
 *    • The student who took it (role === "student" AND owns the record), OR
 *    • The test creator / any teacher or admin
 */
router.get('/ass/:assessmentId', authenticateJWT, async (req, res) => {
  try {
    const { assessmentId } = req.params;
     console.log("we are here")
    // 1️⃣ Fetch assessment and populate the referenced Test document
    const assessment = await Assessment.findById(assessmentId)
      .populate({
        path: 'testId',
        select: 'title description duration questions', // only what we need
      })
      .populate({
        path: 'userId',
        select: 'name role email', // for ownership / auditing
      });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // 2️⃣ Authorisation guard — students may only view their own assessments
    const isStudent = req.user.role === 'student';
    const ownsAssessment =
      assessment.userId._id.toString() === req.user.id.toString();

    if (isStudent && !ownsAssessment) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // 3️⃣ Reshape for a clean, front‑end‑friendly payload
    const { testId: test, ...assessmentData } = assessment.toObject();

    res.json({
      ...assessmentData, // startedAt, submittedAt, userAnswers, score, …
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration, // minutes
        questions: test.questions.map((q, idx) => ({
          index: idx,              // easier for the UI
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer, // index of the correct option
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




export default router;
