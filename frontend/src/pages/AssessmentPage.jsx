import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProctoring } from '../hooks/useProctoring';

const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const candidateId = location.state?.candidateId;
  
  const { videoRef, isModelsLoaded, violation } = useProctoring(candidateId, assessmentId);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    if (!candidateId) {
      alert('Unauthorized access. Please login.');
      navigate('/candidate-login');
      return;
    }

    const fetchAssessment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assessments/${assessmentId}`);
        setAssessment(res.data);
      } catch (err) {
        console.error('Failed to load assessment', err);
        alert('Failed to load assessment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, candidateId, navigate]);

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/assessments/${assessmentId}/submit`, {
        candidateId,
        answers
      });
      setFinalScore(res.data.score);
    } catch (err) {
      console.error('Failed to submit assessment', err);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Assessment...</div>;
  }

  if (!assessment) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Assessment not found.</div>;
  }

  if (finalScore !== null) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Test Submitted!</h2>
          <p className="text-gray-400 mb-8 text-sm">Thank you for taking the assessment. Your results have been successfully recorded for HR review.</p>
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700 mb-8 shadow-inner">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Your Auto-Graded Score</p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 drop-shadow-sm">{finalScore}</p>
          </div>
          <button 
            onClick={() => navigate('/candidate-login')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3.5 rounded-xl font-semibold transition shadow-sm cursor-pointer">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{assessment.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{assessment.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium bg-gray-800/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-inner text-gray-200 border border-gray-700">
            Time Left: {assessment.durationMinutes}:00
          </span>
          <div className="w-36 h-28 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 relative bg-black">
            {!isModelsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-xs text-purple-400 animate-pulse font-medium z-20">
                Initializing AI...
              </div>
            )}
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 shadow-2xl relative z-10">
        {violation && (
          <div className="absolute top-0 left-0 w-full bg-red-500/20 border-b border-red-500/50 text-red-200 px-6 py-3 flex items-center justify-between rounded-t-2xl animate-pulse backdrop-blur-sm z-30">
            <span className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Proctoring Alert: {violation} detected!
            </span>
            <span className="text-xs opacity-75">Your action has been recorded.</span>
          </div>
        )}

        <div className={`space-y-10 ${violation ? 'mt-8' : ''}`}>
          {assessment.questions && assessment.questions.length > 0 ? (
            assessment.questions.map((q, index) => (
              <div key={q._id || index} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                <h2 className="text-lg font-semibold mb-4 text-gray-200">
                  <span className="text-purple-400 mr-2">Q{index + 1}.</span> {q.questionText}
                </h2>
                
                {q.type === 'MCQ' || (q.options && q.options.length > 0) ? (
                  <div className="space-y-3 mt-4">
                    {q.options.map((opt, i) => (
                      <label key={i} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${answers[q._id] === opt ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700'}`}>
                        <input 
                          type="radio" 
                          name={`question-${q._id}`} 
                          value={opt}
                          checked={answers[q._id] === opt}
                          onChange={() => handleOptionChange(q._id, opt)}
                          className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 focus:ring-purple-500 focus:ring-2 accent-purple-500"
                        />
                        <span className="ml-3 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    className="w-full h-40 bg-gray-900/80 border border-gray-600 rounded-lg p-4 text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none shadow-inner"
                    placeholder="Write your answer here... (Copy-paste is disabled)"
                    value={answers[q._id] || ''}
                    onChange={(e) => handleOptionChange(q._id, e.target.value)}
                  ></textarea>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center py-10">No questions available for this assessment.</p>
          )}
        </div>

        <div className="mt-12 flex justify-end border-t border-gray-700/50 pt-8">
          <button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 cursor-pointer">
            Submit Assessment
          </button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentPage;
