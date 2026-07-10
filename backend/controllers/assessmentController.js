import Assessment from '../models/Assessment.js';
import { generateQuestions } from '../services/aiService.js';

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private
export const createAssessment = async (req, res) => {
  try {
    const { title, type, description, durationMinutes, questions } = req.body;
    
    if (!title || !type || !durationMinutes) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const assessment = new Assessment({
      title,
      type,
      description,
      durationMinutes,
      questions: questions || [],
    });

    const createdAssessment = await assessment.save();
    res.status(201).json(createdAssessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
export const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({}).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (assessment) {
      res.json(assessment);
    } else {
      res.status(404).json({ message: 'Assessment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate and add AI questions to an assessment
// @route   POST /api/assessments/:id/generate-ai
// @access  Private
export const generateAIQuestions = async (req, res) => {
  try {
    const { prompt, count } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const newQuestions = await generateQuestions(prompt, count);
    
    const formattedQuestions = newQuestions.map(q => ({
      ...q,
      generatedByAI: true
    }));

    assessment.questions.push(...formattedQuestions);
    await assessment.save();

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI questions preview (without saving)
// @route   POST /api/assessments/generate-preview
// @access  Private
export const generatePreviewQuestions = async (req, res) => {
  try {
    const { prompt, count } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const newQuestions = await generateQuestions(prompt, count);
    
    const formattedQuestions = newQuestions.map(q => ({
      ...q,
      generatedByAI: true
    }));

    res.json({ questions: formattedQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit assessment answers
// @route   POST /api/assessments/:id/submit
// @access  Public
export const submitAssessment = async (req, res) => {
  try {
    const { candidateId, answers } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    import('mongoose').then(async (mongoose) => {
      const Candidate = mongoose.model('Candidate');
      const candidate = await Candidate.findById(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      // Calculate score
      let score = 0;
      assessment.questions.forEach(q => {
        if (q.type === 'MCQ' && answers[q._id.toString()] === q.correctAnswer) {
          score += 1;
        }
      });

      // Save submission
      candidate.submissions.push({
        assessmentId: assessment._id,
        answers,
        score
      });

      await candidate.save();

      res.json({ message: 'Assessment submitted successfully', score });
    }).catch(err => {
      res.status(500).json({ message: err.message });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private
export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assessment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
