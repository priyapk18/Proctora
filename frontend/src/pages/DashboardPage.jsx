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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, assessmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/candidates'),
          axios.get('http://localhost:5000/api/assessments')
        ]);
        
        // Initialize violations array for each candidate for the live dashboard
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-8">HR Portal</h2>
        <nav className="space-y-4">
          <a href="#" className="flex items-center text-gray-700 bg-purple-50 px-4 py-2 rounded-lg font-medium">
            Live Dashboard
          </a>
          <a href="#" className="flex items-center text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition">
            Assessments
          </a>
          <a href="#" className="flex items-center text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition">
            Candidates
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800">Live Dashboard</h1>
          <button 
            onClick={() => navigate('/create-assessment')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-sm font-medium transition cursor-pointer">
            + New Assessment
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Candidates List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Candidates</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Candidate</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Violations</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidates.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No candidates found. Upload candidates to begin.</td></tr>
                  )}
                  {candidates.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${c.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                            c.status === 'InProgress' ? 'bg-blue-100 text-blue-700' : 
                            c.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-red-500 font-medium">
                        {c.violations?.length > 0 ? c.violations.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedCandidate(c)}
                          className="text-purple-600 hover:underline font-medium text-sm cursor-pointer">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Assessments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Assessments (Test IDs)</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Title</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Type</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Test ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assessments.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No assessments found. Create one to begin.</td></tr>
                  )}
                  {assessments.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{a.title}</td>
                      <td className="px-6 py-4 text-gray-600">{a.type}</td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 text-purple-600 px-2 py-1 rounded text-xs select-all font-bold">{a.testId || a._id}</code>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(a.testId || a._id);
                            alert('Test ID copied to clipboard!');
                          }}
                          className="text-purple-600 hover:underline font-medium text-sm cursor-pointer">Copy ID</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Alerts
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No violations detected.</p>
              ) : (
                alerts.map((alert, i) => (
                  <div key={i} className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-800">
                    <p className="font-semibold">{alert.violationType} detected!</p>
                    <p className="text-xs mt-1 text-red-600 opacity-80">Candidate ID: {alert.candidateId} • {alert.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedCandidate.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedCandidate.email}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {selectedCandidate.submissions && selectedCandidate.submissions.length > 0 ? (
                <div className="space-y-6">
                  {selectedCandidate.submissions.map((sub, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800">Assessment ID: {sub.assessmentId}</h4>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">Score: {sub.score}</span>
                      </div>
                      <h5 className="font-medium text-gray-600 mb-3 text-sm uppercase tracking-wider">Submitted Answers:</h5>
                      <div className="space-y-3">
                        {sub.answers && Object.entries(sub.answers).map(([qId, ans]) => (
                          <div key={qId} className="bg-white border border-gray-100 rounded-lg p-3 text-sm">
                            <span className="text-gray-500 block mb-1">Q_ID: {qId}</span>
                            <span className="font-medium text-gray-800">{ans}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p>No submissions found for this candidate yet.</p>
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
