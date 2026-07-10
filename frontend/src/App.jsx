import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import CreateAssessmentPage from './pages/CreateAssessmentPage';
import CandidateDashboard from './pages/CandidateDashboard';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-assessment" element={<CreateAssessmentPage />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
