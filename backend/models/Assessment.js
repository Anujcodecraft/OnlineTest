import mongoose from 'mongoose';

const codeResultSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  actualOutput: String,
  status: String // e.g., "Passed", "Failed"
});

const codingAnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  sourceCode: String,
  passedCount: Number,
  totalCount: Number,
  testCaseResults: [codeResultSchema]
});

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completed: { type: Boolean, default: false },

  // MCQ answers
  userAnswers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: Number }],

  // Coding answers
  codingAnswers: [codingAnswerSchema],

  score: { type: Number, default: 0 },
  timeTaken: { type: Number } // in seconds
}, { timestamps: true });

assessmentSchema.index({ userId: 1, testId: 1 }, { unique: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
