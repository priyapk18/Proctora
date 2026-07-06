import express from 'express';
import multer from 'multer';
import { uploadCandidates, getCandidates, loginCandidate } from '../controllers/candidateController.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
  .get(getCandidates);

router.post('/login', loginCandidate);

router.post('/upload', upload.single('file'), uploadCandidates);

export default router;
