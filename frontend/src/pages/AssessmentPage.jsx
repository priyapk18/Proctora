import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProctoring } from '../hooks/useProctoring';

const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const candidateId = location.state?.candidateId;
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const { videoRef, isModelsLoaded, violation, violationCount } = useProctoring(candidateId, assessmentId, isReviewMode);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!candidateId) {
      alert('Unauthorized access. Please login.');
      navigate('/');
      return;
    }

    const fetchAssessment = async () => {
      try {
        const [assessmentRes, profileRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/assessments/${assessmentId}`),
          axios.get(`http://localhost:5000/api/candidates/${candidateId}/profile`)
        ]);
        
        const fetchedAssessment = assessmentRes.data;
        const candidateProfile = profileRes.data;
        
        setAssessment(fetchedAssessment);

        // Check if candidate already completed this
        if (candidateProfile && candidateProfile.submissions) {
          const pastSubmission = candidateProfile.submissions.find(s => 
            (s.assessmentId?._id?.toString() || s.assessmentId?.toString()) === assessmentId.toString()
          );
          
          if (pastSubmission) {
            setIsReviewMode(true);
            setAnswers(pastSubmission.answers || {});
            setFinalScore(pastSubmission.score);
            setShowReview(true);
          }
        }

      } catch (err) {
        console.error('Failed to load assessment', err);
        alert('Failed to load assessment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, candidateId, navigate]);

  useEffect(() => {
    if (assessment && timeLeft === null) {
      setTimeLeft(assessment.durationMinutes * 60);
    }
  }, [assessment, timeLeft]);

  useEffect(() => {
    if (isReviewMode || timeLeft === null || finalScore !== null) return;
    if (timeLeft <= 0) {
      alert("Time is up! Your assessment is being submitted automatically.");
      handleSubmit(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finalScore]);

  useEffect(() => {
    if (violationCount >= 3 && finalScore === null) {
      alert("You have been flagged 3 times. Your assessment is being terminated.");
      handleSubmit(true);
    }
  }, [violationCount, finalScore]);

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (isFlagged = false) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/assessments/${assessmentId}/submit`, {
        candidateId,
        answers
      });
      setFinalScore(isFlagged ? "Flagged (Terminated)" : res.data.score);
    } catch (err) {
      console.error('Failed to submit assessment', err);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="font-semibold tracking-wide text-slate-600">Initializing Environment...</p>
      </div>
    );
  }

  if (!assessment) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Assessment not found.</div>;
  }

  if (finalScore !== null) {
    if (showReview) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
          <div className="max-w-4xl w-full mx-auto">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Assessment Review</h1>
                <p className="text-slate-500 font-medium">Final Score: {finalScore}</p>
              </div>
              <button 
                onClick={() => navigate('/candidate-dashboard')}
                className="pro-btn-secondary w-auto px-6 py-2"
              >
                Back to Dashboard
              </button>
            </header>
            
            <main className="space-y-6">
              {assessment.questions.map((q, index) => {
                const isCorrect = answers[q._id] === q.correctAnswer;
                return (
                  <div key={q._id} className="pro-card p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                      Q{index + 1}. {q.questionText}
                    </h2>
                    
                    {q.type === 'MCQ' || (q.options && q.options.length > 0) ? (
                      <div className="space-y-3">
                        {q.options.map((opt, i) => {
                          let optionClass = "border-slate-200 bg-white text-slate-600";
                          let icon = null;
                          
                          if (opt === q.correctAnswer) {
                            optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                            icon = <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>;
                          } else if (answers[q._id] === opt && opt !== q.correctAnswer) {
                            optionClass = "border-red-500 bg-red-50 text-red-900 line-through opacity-75";
                            icon = <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>;
                          }
                          
                          return (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-lg border-2 ${optionClass}`}>
                              <span>{opt}</span>
                              {icon && <span>{icon}</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-1">Your Answer:</p>
                          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap">
                            {answers[q._id] || <span className="text-slate-400 italic">No answer provided.</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-600 mb-1">Expected / Correct Answer:</p>
                          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 whitespace-pre-wrap font-medium">
                            {q.correctAnswer}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

        <div className="pro-card p-12 text-center max-w-lg w-full relative z-10 shadow-xl">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Test Submitted!</h2>
          <p className="text-slate-500 mb-10 text-sm">Thank you for taking the assessment. Your results have been successfully recorded for HR review.</p>
          
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10 shadow-inner">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Your Score</p>
            <p className="text-6xl font-black text-slate-800 drop-shadow-sm">{finalScore}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setShowReview(true)}
              className="pro-btn-primary py-4 uppercase tracking-wider text-sm">
              Review Submission
            </button>
            <button 
              onClick={() => navigate('/candidate-dashboard')}
              className="text-slate-500 hover:text-slate-800 font-semibold transition-colors text-sm">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-200 pb-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{assessment.title}</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">{assessment.description}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Time Remaining</span>
              <span className={`text-2xl font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-40 h-28 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-md relative bg-slate-900">
              {!isModelsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-xs text-emerald-400 font-bold z-20 flex-col gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Proctoring
                </div>
              )}
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full pro-card p-6 md:p-10 relative flex flex-col shadow-lg border-t-4 border-t-emerald-500">
          {violation && (
            <div className="absolute top-0 left-0 w-full bg-red-50 border-b border-red-200 text-red-700 px-8 py-3 flex items-center justify-between z-30 shadow-sm">
              <span className="font-bold flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner animate-bounce">!</span>
                Proctoring Alert: {violation} detected! (Warning {violationCount} of 3)
              </span>
              <span className="text-xs font-semibold bg-red-100 px-3 py-1 rounded-full">RECORDED</span>
            </div>
          )}

          <div className={`space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-4 ${violation ? 'mt-12' : ''}`}>
            {assessment.questions && assessment.questions.length > 0 ? (
              assessment.questions.map((q, index) => (
                <div key={q._id || index} className="bg-slate-50 p-8 rounded-xl border border-slate-200 relative group">
                  <h2 className="text-lg font-bold mb-6 text-slate-800 flex gap-3">
                    <span className="text-emerald-600 font-black mt-0.5">{index + 1}.</span> 
                    <span className="leading-relaxed">{q.questionText}</span>
                  </h2>
                  
                  {q.type === 'MCQ' || (q.options && q.options.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {q.options.map((opt, i) => {
                        const isSelected = answers[q._id] === opt;
                        return (
                          <label key={i} className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}>
                            <input 
                              type="radio" 
                              name={`question-${q._id}`} 
                              value={opt}
                              checked={isSelected}
                              onChange={() => handleOptionChange(q._id, opt)}
                              className="w-5 h-5 text-emerald-600 border-slate-300 focus:ring-emerald-500 mr-4"
                            />
                            <span className={`font-semibold ${isSelected ? 'text-emerald-900' : ''}`}>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <textarea 
                        className="pro-input h-48 custom-scrollbar resize-none bg-white"
                        placeholder="Write your detailed answer here..."
                        value={answers[q._id] || ''}
                        onChange={(e) => handleOptionChange(q._id, e.target.value)}
                      ></textarea>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p className="font-semibold">No questions available for this assessment.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
            <button 
              onClick={() => handleSubmit(false)}
              className="pro-btn-primary w-auto px-10 py-4 text-lg">
              Submit Assessment
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentPage;
