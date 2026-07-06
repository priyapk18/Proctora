import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import CreateAssessmentPage from './pages/CreateAssessmentPage';
import CandidateLogin from './pages/CandidateLogin';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create-assessment" element={<CreateAssessmentPage />} />
          <Route path="/candidate-login" element={<CandidateLogin />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
