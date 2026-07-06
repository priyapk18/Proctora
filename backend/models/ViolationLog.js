import mongoose from 'mongoose';

const violationLogSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  violationType: { 
    type: String, 
    enum: ['TabSwitch', 'CopyPaste', 'NoFace', 'MultipleFaces'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  proofImageUrl: { type: String }
});

const ViolationLog = mongoose.model('ViolationLog', violationLogSchema);
export default ViolationLog;
