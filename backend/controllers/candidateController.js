import Candidate from '../models/Candidate.js';
import xlsx from 'xlsx';
import sendEmail from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Upload candidates via Excel/CSV
// @route   POST /api/candidates/upload
// @access  Private
export const uploadCandidates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an excel or csv file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const assessmentId = req.body.assessmentId;

    const savedCandidates = [];

    for (let row of data) {
      if (!row.email || !row.name) continue;

      let candidate = await Candidate.findOne({ email: row.email });
      
      const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();

      if (!candidate) {
        candidate = new Candidate({
          name: row.name,
          email: row.email,
          phone: row.phone,
          accessCode,
          assignedAssessments: assessmentId ? [assessmentId] : []
        });
      } else {
        if (assessmentId && !candidate.assignedAssessments.includes(assessmentId)) {
          candidate.assignedAssessments.push(assessmentId);
        }
      }

      await candidate.save();
      savedCandidates.push(candidate);

      // Send Email
      try {
        const inviteLink = `http://localhost:5173/assessment?code=${candidate.accessCode}`;
        await sendEmail({
          email: candidate.email,
          subject: 'Assessment Invitation',
          html: `<p>Hello ${candidate.name},</p>
                 <p>You have been invited to take an assessment. Please use the following access code: <b>${candidate.accessCode}</b></p>
                 <p>Click <a href="${inviteLink}">here</a> to begin.</p>`
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${candidate.email}:`, emailError);
      }
    }

    res.status(201).json({ message: `${savedCandidates.length} candidates processed successfully`, candidates: savedCandidates });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Candidate login for assessment
// @route   POST /api/candidates/login
// @access  Public
export const loginCandidate = async (req, res) => {
  try {
    const { email, testId } = req.body;
    
    if (!email || !testId) {
      return res.status(400).json({ message: 'Email and Test ID are required.' });
    }

    import('mongoose').then(async (mongoose) => {
      const Assessment = mongoose.model('Assessment');
      const assessment = await Assessment.findOne({ testId });
      
      if (!assessment) {
        return res.status(404).json({ message: 'Invalid Test ID.' });
      }

      let candidate = await Candidate.findOne({ email });

      if (!candidate) {
        // Auto-register candidate like a Google Form
        const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        candidate = new Candidate({
          name: email.split('@')[0], // Default name from email
          email,
          accessCode,
          assignedAssessments: [assessment._id]
        });
        await candidate.save();
      }

      // We allow anyone to take the test if they enter valid email and testId.
      if (!candidate.assignedAssessments.includes(assessment._id)) {
        candidate.assignedAssessments.push(assessment._id);
        await candidate.save();
      }

      res.json({ message: 'Login successful', candidateId: candidate._id, assessmentId: assessment._id });
    }).catch(err => {
      res.status(500).json({ message: err.message });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
