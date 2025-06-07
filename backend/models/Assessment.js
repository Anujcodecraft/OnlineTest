// models/Assessment.js
import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completed: { type: Boolean, default: false },
  userAnswers: [{ type: Number }], // Indexes of selected options per question
  score: { type: Number, default: 0 },
  timeTaken: { type: Number }, // in seconds
}, { timestamps: true });

assessmentSchema.index({ userId: 1, testId: 1 }, { unique: true }); // Prevent multiple submissions

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
