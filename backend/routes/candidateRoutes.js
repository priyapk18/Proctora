import express from 'express';
import multer from 'multer';
import { uploadCandidates, getCandidates, loginCandidate, getCandidateProfile, getLeaderboards } from '../controllers/candidateController.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
  .get(getCandidates);

router.get('/leaderboards', getLeaderboards);
router.post('/login', loginCandidate);
router.get('/:id/profile', getCandidateProfile);

router.post('/upload', upload.single('file'), uploadCandidates);

export default router;
