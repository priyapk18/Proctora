import ViolationLog from '../models/ViolationLog.js';
import Candidate from '../models/Candidate.js';

// @desc    Report a proctoring violation
// @route   POST /api/violations
// @access  Public (Candidate)
export const reportViolation = async (req, res) => {
  try {
    const { candidateId, assessmentId, violationType, proofImageUrl } = req.body;
    
    const violation = new ViolationLog({
      candidateId,
      assessmentId,
      violationType,
      proofImageUrl
    });

    await violation.save();

    // Flag the candidate
    await Candidate.findByIdAndUpdate(candidateId, { status: 'Flagged' });

    res.status(201).json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all violations for a candidate
// @route   GET /api/violations/:candidateId/:assessmentId
// @access  Private (HR)
export const getViolations = async (req, res) => {
  try {
    const { candidateId, assessmentId } = req.params;
    const violations = await ViolationLog.find({ candidateId, assessmentId }).sort({ timestamp: -1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
