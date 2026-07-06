import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  accessCode: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['Invited', 'InProgress', 'Completed', 'Flagged'],
    default: 'Invited' 
  },
  assignedAssessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }],
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
