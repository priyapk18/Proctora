import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Aptitude', 'Technical', 'Communication'], required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String },
    type: { type: String, enum: ['MCQ', 'Coding', 'Subjective'] },
    generatedByAI: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
