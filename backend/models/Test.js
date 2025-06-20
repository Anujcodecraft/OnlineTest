import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  inputFileUrl: { type: String },
  outputFileUrl: { type: String}
});

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['MCQ', 'coding'], required: true },
  question: { type: String },

  // MCQ-specific
  options: [String],
  correctAnswer: Number, // index of correct option

  // Coding-specific
  initialCode: String,
  // languageId: Number, // Judge0 language ID
  testCases: [testCaseSchema]
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  testCode: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // in minutes
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', testSchema);
export default Test;
