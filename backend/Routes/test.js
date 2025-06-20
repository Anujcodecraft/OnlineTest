// routes/test.routes.js
import express from 'express';
import Test from '../models/Test.js';
import { authenticateJWT, authorizeAdmin } from '../Middleware/auth.js';
import Assessment from '../models/Assessment.js';
const router = express.Router();
import mongoose from 'mongoose';
import axios from 'axios';

import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });

import { default as fetch } from 'node-fetch';


const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': 'de5a2777d8mshd82208871b776b5p128cbfjsnb90b29acdb2c',
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};



// Create test (Admin only)
router.post(
  '/create',
  upload.fields([
    { name: 'inputFile', maxCount: 1 },
    { name: 'outputFile', maxCount: 1 },
  ]),
  authenticateJWT,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { title, description, testCode, duration, startTime, endTime } = req.body;
      let questions = req.body.questions;
      console.log(title,testCode,duration,startTime,endTime,questions)
      if (!title || !testCode || !duration || !startTime || !endTime || !questions) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
      // Parse questions from string to JSON if needed
      if (typeof questions === 'string') {
        questions = JSON.parse(questions);
      }
      
      const existing = await Test.findOne({ testCode });
      if (existing) return res.status(409).json({ message: 'Test code already exists.' });
      console.log("we are here        ")
      // Handle testCases file URLs for CODING questions
      for (let i = 0; i < questions.length; i++) {
        console.log(questions[i]);
        if (questions[i].type === 'coding') {
          console.log("i am in")
          if (!req.files.inputFile || !req.files.outputFile) {
            return res.status(400).json({ message: 'Coding question requires input/output files.' });
          }
          
          const inputFileUrl = req.files.inputFile[0].path;
          const outputFileUrl = req.files.outputFile[0].path;

          
          
          questions[i].testCases = [
            {
              inputFileUrl,
              outputFileUrl,
            },
          ];
          
        }
      }
      const test = new Test({
        title,
        description,
        testCode,
        duration: Number(duration),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdBy: req.user.id,
        questions,
      });
      
      await test.save();
      console.log("hello th")
      res.status(201).json({ message: 'Test created successfully.', test });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
);



//-------------------------------------------------submit test---------------------




router.post('/submit/code', authenticateJWT, async (req, res) => {
  try {
    const { code, languageId, questionId } = req.body;

    
    // Step 1: Find question in tests (nested lookup)
    const test = await Test.findOne({ 'questions._id': questionId });
    if (!test) return res.status(404).json({ message: 'Question not found' });
    
    const question = test.questions.find(q => q._id.toString() === questionId);
    if (!question || question.type !== 'coding') {
      return res.status(400).json({ message: 'Invalid coding question ID' });
    }
    
    const inputUrl = question.testCases[0].inputFileUrl;
    const outputUrl = question.testCases[0].outputFileUrl;
    
    // Step 2: Download input/output file content from Cloudinary
    console.log("mr thor 2")
    const [inputText, expectedOutput] = await Promise.all([
      (await fetch(inputUrl)).text(),
      (await fetch(outputUrl)).text()
    ]);
    console.log("mr thor 4",code,languageId)
    // Step 3: Submit code to Judge0
    console.log("the list are",)
    const judgeRes = await axios.post(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
      source_code: code,
      language_id: 54,
      stdin: inputText,
    }, { headers: JUDGE0_HEADERS });
    
    console.log("mr thor3")
    const { stdout, stderr, compile_output } = judgeRes.data;

    if (compile_output || stderr) {
      return res.status(400).json({
        success: false,
        message: 'Code failed to compile or crashed',
        error: compile_output || stderr
      });
    }

    // Step 4: Normalize output (trim extra lines/spaces)
    const normalize = str => (str || '').trim().replace(/\r\n/g, '\n');

    const actualOutput = normalize(stdout);
    const expected = normalize(expectedOutput);

    if (actualOutput === expected) {
      return res.json({ success: true, message: 'Correct Output ✅' });
    } else {
      return res.json({
        success: false,
        message: 'Output Mismatch ❌',
        expected: expected,
        actual: actualOutput,
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server Error' });
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
