import express from 'express';
import { reportViolation, getViolations } from '../controllers/violationController.js';

const router = express.Router();

router.post('/', reportViolation);
router.get('/:candidateId/:assessmentId', getViolations);

export default router;
