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

    const savedCandidates = [];

    for (let row of data) {
      if (!row.email || !row.name) continue;

      let candidate = await Candidate.findOne({ email: row.email });
      
      if (!candidate) {
        candidate = new Candidate({
          name: row.name,
          email: row.email,
          phone: row.phone
        });
      }

      await candidate.save();
      savedCandidates.push(candidate);

      // Send Email
      try {
        const inviteLink = `http://localhost:5173/`;
        await sendEmail({
          email: candidate.email,
          subject: 'Assessment Invitation',
          html: `<p>Hello ${candidate.name},</p>
                 <p>You have been invited to take an assessment. Please log in at our portal using this email to view your available tests.</p>
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

// @desc    Candidate login/registration
// @route   POST /api/candidates/login
// @access  Public
export const loginCandidate = async (req, res) => {
  try {
    const { email, name, age, phone } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and Name are required.' });
    }

    let candidate = await Candidate.findOne({ email });

    if (!candidate) {
      // Auto-register candidate
      candidate = new Candidate({
        name: name || email.split('@')[0],
        age: age || undefined,
        phone: phone || undefined,
        email
      });
      await candidate.save();
    } else {
      // Update details if provided during subsequent logins
      let updated = false;
      if (name && candidate.name !== name) { candidate.name = name; updated = true; }
      if (age && candidate.age !== Number(age)) { candidate.age = Number(age); updated = true; }
      if (phone && candidate.phone !== phone) { candidate.phone = phone; updated = true; }
      if (updated) await candidate.save();
    }

    res.json({ message: 'Login successful', candidateId: candidate._id });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get candidate profile and submissions
// @route   GET /api/candidates/:id/profile
// @access  Public
export const getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('submissions.assessmentId');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get candidate leaderboards by category
// @route   GET /api/candidates/leaderboards
// @access  Public
export const getLeaderboards = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('submissions.assessmentId');
    
    let leaderboards = {
      Technical: [],
      Aptitude: [],
      Communication: []
    };

    candidates.forEach(candidate => {
      let scores = { Technical: 0, Aptitude: 0, Communication: 0 };
      
      if (candidate.submissions && candidate.submissions.length > 0) {
        candidate.submissions.forEach(sub => {
          if (sub.assessmentId && sub.assessmentId.type) {
            scores[sub.assessmentId.type] += sub.score;
          }
        });
      }

      ['Technical', 'Aptitude', 'Communication'].forEach(cat => {
        if (scores[cat] > 0) {
          leaderboards[cat].push({
            id: candidate._id,
            name: candidate.name,
            score: scores[cat]
          });
        }
      });
    });

    // Sort each category by score descending
    ['Technical', 'Aptitude', 'Communication'].forEach(cat => {
      leaderboards[cat].sort((a, b) => b.score - a.score);
      // Optional: limit to top 10
      // leaderboards[cat] = leaderboards[cat].slice(0, 10);
    });

    res.json(leaderboards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
