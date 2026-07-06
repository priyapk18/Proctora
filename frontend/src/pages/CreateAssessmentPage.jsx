import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateAssessmentPage = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Technical');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const handleGenerateAI = async () => {
    if (!aiPrompt) return alert('Please enter a prompt for AI generation');
    setIsGenerating(true);
    try {
      const response = await axios.post('http://localhost:5000/api/assessments/generate-preview', {
        prompt: aiPrompt,
        count: 5 // Default to 5 questions
      });
      setQuestions(response.data.questions);
    } catch (err) {
      console.error(err);
      alert('Error generating questions. Please ensure OPENAI_API_KEY is valid in backend .env');
    } finally {
      setIsGenerating(false);
    }
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
      
      alert('Assessment Created Successfully! ID: ' + response.data._id);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error creating assessment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[85vh]">
        
        {/* Left Pane: Settings & Instructions */}
        <div className="w-full lg:w-1/2 p-8 border-r border-gray-100 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Assessment</h2>
          
          <div className="space-y-5 flex-1 overflow-y-auto pr-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Title</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                placeholder="e.g. Senior Frontend Engineer Test"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                  <option value="Technical">Technical</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Mins)</label>
                <input 
                  type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions Panel</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                placeholder="Instructions for the candidates..."
              ></textarea>
            </div>

            <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
                ✨ Auto-Generate with AI
              </h3>
              <p className="text-sm text-purple-600 mb-4">Describe the topics and difficulty to automatically generate MCQ questions.</p>
              <textarea 
                value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                rows="3"
                className="w-full border border-purple-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-3"
                placeholder="e.g. Generate 5 intermediate React JS questions covering hooks and context..."
              ></textarea>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition active:scale-95 disabled:opacity-50 cursor-pointer">
                {isGenerating ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer">Cancel</button>
            <button 
              onClick={handleSaveAssessment}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg shadow-md font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer">
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
        </div>

        {/* Right Pane: Questions Follow-up */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Questions Preview</h3>
          
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p>No questions added yet.</p>
                <p className="text-sm mt-2">Use the AI generator on the left or add manually (coming soon).</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
                    <p className="font-semibold text-gray-800 mb-3">{i + 1}. {q.questionText}</p>
                    <div className="space-y-2">
                      {q.options?.map((opt, j) => (
                        <div key={j} className={`p-2 text-sm rounded ${q.correctAnswer === opt ? 'bg-green-100 text-green-800 font-medium' : 'bg-white border border-gray-200 text-gray-600'}`}>
                          {opt}
                        </div>
                      ))}
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
