import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [leaderboards, setLeaderboards] = useState({ Technical: [], Aptitude: [], Communication: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Technical');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const candidateId = localStorage.getItem('candidateId');
      if (!candidateId) {
        navigate('/');
        return;
      }

      try {
        const [profileRes, assessmentsRes, leaderboardsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/candidates/${candidateId}/profile`),
          axios.get('http://localhost:5000/api/assessments'),
          axios.get('http://localhost:5000/api/candidates/leaderboards')
        ]);
        
        setCandidate(profileRes.data);
        setAssessments(assessmentsRes.data);
        setLeaderboards(leaderboardsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (err.response?.status === 404) {
          localStorage.removeItem('candidateId');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('candidateId');
    navigate('/');
  };

  const getTopScorers = (category) => {
    const list = leaderboards[category] || [];
    return list.slice(0, 5); // Show top 5
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const completedAssessmentIds = candidate?.submissions?.map(sub => sub.assessmentId?._id?.toString() || sub.assessmentId?.toString()) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header / Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-700 shadow-inner">
              {candidate?.name?.substring(0,2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{candidate?.name}</h1>
              <p className="text-slate-500 font-medium">{candidate?.email}</p>
              <div className="flex gap-4 mt-3">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  {candidate?.submissions?.length || 0} Tests Taken
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="text-slate-400 hover:text-slate-700 font-semibold cursor-pointer">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recommendations & History */}
          <div className="space-y-8">
            <div className="pro-card p-6 bg-white border-t-4 border-t-purple-500 shadow-md">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-xl">
                <span>🏆</span> Category Leaderboards
              </h3>
              
              <div className="space-y-8">
                {['Technical', 'Aptitude', 'Communication'].map(cat => (
                  <div key={cat}>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{cat} Top 5</h4>
                    <div className="space-y-3">
                      {getTopScorers(cat).length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No scores yet.</p>
                      ) : (
                        getTopScorers(cat).map((scorer, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                idx === 1 ? 'bg-slate-200 text-slate-700' : 
                                idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800 text-sm">{scorer.name}</span>
                            </div>
                            <span className="font-black text-emerald-600">{scorer.score} pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Test Catalog */}
          <div className="lg:col-span-2 pro-card bg-white p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Available Assessments</h2>
                <p className="text-slate-500 text-sm mt-1">Select a category to view and start your tests.</p>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
              {['Technical', 'Aptitude', 'Communication'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === cat 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Test List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.filter(a => a.type === activeTab).length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  No {activeTab} tests available right now.
                </div>
              ) : (
                assessments.filter(a => a.type === activeTab).map(a => {
                  const isCompleted = completedAssessmentIds.includes(a._id.toString());
                  const submission = isCompleted ? candidate.submissions.find(s => (s.assessmentId?._id?.toString() || s.assessmentId?.toString()) === a._id.toString()) : null;
                  
                  return (
                    <div key={a._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col h-full relative overflow-hidden group">
                      {isCompleted && (
                        <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                          Score: {submission?.score}
                        </div>
                      )}
                      
                      <div className="flex-1 mt-2">
                        <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">{a.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{a.description || 'No description provided.'}</p>
                        
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {a.durationMinutes} mins
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {a.questions?.length || 0} Qs
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/assessment/${a._id}`, { state: { candidateId: candidate._id }})}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                          isCompleted 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                        }`}
                      >
                        {isCompleted ? 'Review Answers' : 'Start Test'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
