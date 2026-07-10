import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const socket = useSocket();
  const [candidates, setCandidates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, assessmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/candidates'),
          axios.get('http://localhost:5000/api/assessments')
        ]);
        
        const fetchedCandidates = candidatesRes.data.map(c => ({
          ...c,
          violations: []
        }));
        setCandidates(fetchedCandidates);
        setAssessments(assessmentsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('hr_violation_alert', (data) => {
      setAlerts(prev => [{ ...data, time: new Date().toLocaleTimeString() }, ...prev]);
      setCandidates(prev => prev.map(c => 
        c._id === data.candidateId 
          ? { ...c, violations: [...c.violations, data.violationType], status: 'Flagged' }
          : c
      ));
    });

    socket.on('hr_status_update', (data) => {
      setCandidates(prev => prev.map(c => 
        c._id === data.candidateId ? { ...c, status: data.status } : c
      ));
    });

    return () => {
      socket.off('hr_violation_alert');
      socket.off('hr_status_update');
    };
  }, [socket]);

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/assessments/${id}`);
      setAssessments(prev => prev.filter(a => a._id !== id));
      alert('Assessment deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete assessment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-10 shadow-sm">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md text-white font-bold">P</div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Proctora</h2>
        </div>
        <nav className="space-y-2 flex-1">
          {['live', 'assessments', 'candidates'].map((tab) => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === tab 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className="capitalize">{tab} {tab === 'live' && 'Overview'}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto relative z-10 custom-scrollbar">
        <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'live' && 'Live Overview'}
              {activeTab === 'assessments' && 'Assessment Directory'}
              {activeTab === 'candidates' && 'Candidate Roster'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {activeTab === 'live' && 'Monitor active sessions and security alerts in real-time.'}
              {activeTab === 'assessments' && 'Manage your organization’s tests and templates.'}
              {activeTab === 'candidates' && 'Review submissions and candidate profiles.'}
            </p>
          </div>
          {activeTab === 'assessments' && (
            <button 
              onClick={() => navigate('/create-assessment')}
              className="pro-btn-primary w-auto py-2.5 px-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New Assessment
            </button>
          )}
        </header>

        {activeTab === 'live' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="pro-card p-6 flex items-center justify-between border-l-4 border-l-blue-500">
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Active Takers</p>
                    <p className="text-4xl font-black text-slate-800">{candidates.filter(c => c.status === 'InProgress').length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                </div>
                <div className="pro-card p-6 flex items-center justify-between border-l-4 border-l-red-500">
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Flagged Users</p>
                    <p className="text-4xl font-black text-slate-800">{candidates.filter(c => c.status === 'Flagged').length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                </div>
              </div>
              
              {/* Activity Table */}
              <div className="pro-card">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Current Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs tracking-wider uppercase">Candidate</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs tracking-wider uppercase">Status</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs tracking-wider uppercase">Violations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.filter(c => c.status === 'InProgress' || c.status === 'Flagged').length === 0 && (
                        <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic font-medium">No active candidates right now.</td></tr>
                      )}
                      {candidates.filter(c => c.status === 'InProgress' || c.status === 'Flagged').map(c => (
                        <tr key={c._id} className="hover:bg-slate-50 transition-colors duration-200">
                          <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                              c.status === 'Flagged' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-red-600 font-medium text-sm">
                            {c.violations?.length > 0 ? c.violations.join(', ') : <span className="text-slate-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="pro-card border-t-4 border-t-red-500 h-fit max-h-[600px] flex flex-col shadow-md">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-red-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Live Security Alerts
                </h3>
              </div>
              <div className="p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-sm font-medium">Monitoring active... No violations.</p>
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div key={i} className="bg-white border border-red-200 p-4 rounded-lg shadow-sm text-sm border-l-4 border-l-red-500">
                      <p className="font-bold text-red-700 mb-1">{alert.violationType} Detected!</p>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span>ID: {alert.candidateId.substring(0,8)}...</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="pro-card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Title</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Duration</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No assessments found. Create one to begin.</td></tr>
                )}
                {assessments.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors duration-200 group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{a.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{a.durationMinutes} mins</td>
                    <td className="px-6 py-4">
                      <code className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold">{a._id.substring(0,8)}...</code>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteAssessment(a._id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors flex items-center gap-1.5 opacity-70 group-hover:opacity-100 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="pro-card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Candidate</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Score</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">No candidates found.</td></tr>
                )}
                {candidates.map(c => {
                  const latestSubmission = c.submissions && c.submissions.length > 0 ? c.submissions[c.submissions.length - 1] : null;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {c.name.substring(0,2)}
                        </div>
                        {c.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border
                          ${c.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                            c.status === 'InProgress' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                            c.status === 'Flagged' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {latestSubmission ? (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{latestSubmission.score}</span>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedCandidate(c)}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-colors border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md cursor-pointer">
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="pro-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border border-emerald-200">
                  {selectedCandidate.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{selectedCandidate.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {selectedCandidate.submissions && selectedCandidate.submissions.length > 0 ? (
                <div className="space-y-6">
                  {selectedCandidate.submissions.map((sub, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
                        <h4 className="font-semibold text-slate-500 text-xs tracking-wider uppercase">ASSESSMENT ID: <span className="text-slate-800 font-mono ml-2 font-bold">{(sub.assessmentId._id || sub.assessmentId).toString().substring(0,8)}...</span></h4>
                        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                          <span className="text-xs uppercase font-bold text-emerald-600 mr-2">Score</span>
                          <span className="font-black text-emerald-700">{sub.score}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {sub.answers && Object.entries(sub.answers).map(([qId, ans], index) => (
                          <div key={qId} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1.5">Question {index + 1}</span>
                            <span className="text-slate-800 font-medium text-sm leading-relaxed block">{ans}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-1">No Submissions Yet</h4>
                  <p className="text-slate-500 text-sm">This candidate hasn't completed any assessments.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
