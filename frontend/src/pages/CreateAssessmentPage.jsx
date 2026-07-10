import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateAssessmentPage = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Technical');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Manual Question State
  const [manualQText, setManualQText] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectIdx, setManualCorrectIdx] = useState(0);

  const navigate = useNavigate();

  const handleGenerateAI = async () => {
    if (!aiPrompt) return alert('Please enter a prompt for AI generation');
    setIsGenerating(true);
    try {
      const response = await axios.post('http://localhost:5000/api/assessments/generate-preview', {
        prompt: aiPrompt,
        count: aiCount
      });
      setQuestions(prev => [...prev, ...response.data.questions]);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
      alert('Error generating questions. Please ensure OPENAI_API_KEY is valid in backend .env');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManual = () => {
    if (!manualQText) return alert('Please enter question text');
    if (manualOptions.some(opt => !opt.trim())) return alert('Please fill in all 4 options');
    
    const newQ = {
      questionText: manualQText,
      type: 'MCQ',
      options: manualOptions,
      correctAnswer: manualOptions[manualCorrectIdx]
    };

    setQuestions(prev => [...prev, newQ]);
    
    // Reset manual form
    setManualQText('');
    setManualOptions(['', '', '', '']);
    setManualCorrectIdx(0);
  };

  const handleSaveAssessment = async () => {
    if (!title || !durationMinutes) return alert('Title and Duration are required');
    if (questions.length === 0) {
      const confirmSave = window.confirm('This assessment has no questions. Do you still want to save it?');
      if (!confirmSave) return;
    }
    setIsSaving(true);
    try {
      const response = await axios.post('http://localhost:5000/api/assessments', {
        title,
        type,
        description,
        durationMinutes,
        questions: questions // Save the previewed questions
      });
      
      alert('Assessment Created Successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 flex items-center justify-center font-sans">
      <div className="max-w-7xl w-full mx-auto pro-card overflow-hidden flex flex-col lg:flex-row h-[90vh] shadow-xl border-t-4 border-t-emerald-500">
        
        {/* Left Pane: Settings & Instructions */}
        <div className="w-full lg:w-1/2 p-8 md:p-10 border-r border-slate-200 flex flex-col bg-white">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Create Assessment</h2>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assessment Title</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="pro-input"
                placeholder="e.g. Senior Frontend Developer Test"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="pro-input appearance-none cursor-pointer">
                  <option value="Technical">Technical</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Communication">Communication</option>
                </select>
                <label className="absolute left-3 -top-2.5 text-xs text-emerald-600 font-semibold bg-white px-1">Type</label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="flex-1 relative group">
                <input 
                  type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}
                  className="pro-input peer placeholder-transparent"
                  id="durationMins"
                  placeholder="60"
                  min="1"
                />
                <label htmlFor="durationMins" className="absolute left-3 -top-2.5 text-xs text-emerald-600 font-semibold bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-emerald-600 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:text-emerald-600">
                  Duration (Mins)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Instructions Panel</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="pro-input resize-none custom-scrollbar"
                placeholder="Write instructions for the candidates here..."
              ></textarea>
            </div>

            <div className="mt-8 p-6 rounded-xl border border-emerald-200 bg-emerald-50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                  <span className="text-xl">✨</span> Auto-Generate with AI
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-emerald-800">Count:</label>
                  <input 
                    type="number" 
                    value={aiCount} 
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-emerald-300 rounded text-sm outline-none"
                    min="1" max="20"
                  />
                </div>
              </div>
              <p className="text-sm text-emerald-700/80 mb-4 font-medium">Describe the topics and difficulty to magically generate MCQ questions in seconds.</p>
              <textarea 
                value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                rows="3"
                className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none resize-none mb-4 shadow-inner custom-scrollbar"
                placeholder="e.g. Generate 5 intermediate React JS questions covering hooks and context..."
              ></textarea>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Synthesizing...
                  </>
                ) : 'Generate Questions'}
              </button>
            </div>

            <div className="mt-6 p-6 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">✍️</span> Manual Question Entry
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
                  <textarea 
                    value={manualQText} onChange={(e) => setManualQText(e.target.value)}
                    rows="2"
                    className="pro-input resize-none text-sm p-2"
                    placeholder="Enter question..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx}>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="correctOption"
                          checked={manualCorrectIdx === idx}
                          onChange={() => setManualCorrectIdx(idx)}
                          className="w-3.5 h-3.5 text-emerald-600"
                        />
                        Option {idx + 1} (Select if Correct)
                      </label>
                      <input 
                        type="text" 
                        value={manualOptions[idx]} 
                        onChange={(e) => {
                          const newOpts = [...manualOptions];
                          newOpts[idx] = e.target.value;
                          setManualOptions(newOpts);
                        }}
                        className={`pro-input text-sm p-2 ${manualCorrectIdx === idx ? 'border-emerald-500 bg-emerald-50/30' : ''}`}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleAddManual}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all active:scale-95 text-sm">
                  Add Question to Assessment
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors">Cancel</button>
            <button 
              onClick={handleSaveAssessment}
              disabled={isSaving}
              className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-3.5 rounded-lg shadow-md font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider text-sm">
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
        </div>

        {/* Right Pane: Questions Follow-up */}
        <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col bg-slate-50 border-l border-slate-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            Questions Preview
            <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200 font-bold">{questions.length} Items</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-white">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-lg font-bold text-slate-600 mb-2">No questions generated</p>
                <p className="text-sm">Use the AI generator on the left to quickly populate this assessment with tailored questions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex gap-4">
                      <span className="text-emerald-600 font-black text-lg mt-0.5">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 mb-4 leading-relaxed">{q.questionText}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, j) => (
                            <div key={j} className={`px-4 py-3 text-sm rounded-lg transition-colors border ${
                              q.correctAnswer === opt 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' 
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateAssessmentPage;
