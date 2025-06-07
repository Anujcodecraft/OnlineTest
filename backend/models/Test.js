// models/Test.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: Number, required: true } // index of correct option
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
