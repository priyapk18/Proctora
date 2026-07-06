import express from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  generateAIQuestions,
  generatePreviewQuestions,
  submitAssessment
} from '../controllers/assessmentController.js';

const router = express.Router();

router.route('/')
  .post(createAssessment)
  .get(getAssessments);

router.post('/generate-preview', generatePreviewQuestions);

router.post('/:id/submit', submitAssessment);

router.route('/:id')
  .get(getAssessmentById);

router.route('/:id/generate-ai')
  .post(generateAIQuestions);

export default router;
