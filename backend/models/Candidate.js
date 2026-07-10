import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Flagged'],
    default: 'Active' 
  },
  submissions: [{
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    answers: { type: Map, of: String },
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
