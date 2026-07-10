import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrollToStart = () => {
    document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/candidates/login', formData);
      localStorage.setItem('candidateId', response.data.candidateId);
      navigate('/candidate-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        </div>

        <div className="z-10 max-w-3xl">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-emerald-600/20 transform rotate-3">
            <svg className="w-10 h-10 text-white -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Welcome to <span className="text-emerald-600">Proctora</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The professional, secure, and intuitive AI-powered assessment platform. Ensure integrity and excellence in every examination.
          </p>
          
          <button 
            onClick={handleScrollToStart}
            className="group flex flex-col items-center mx-auto text-slate-400 hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
          >
            <span className="text-sm font-semibold tracking-widest uppercase mb-2">Get Started</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </button>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="min-h-screen bg-white flex flex-col items-center justify-center p-6 border-t border-slate-200 z-10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

        <div className="pro-card p-10 w-full max-w-xl z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Candidate Profile</h2>
            <p className="text-slate-500 text-sm">Please provide your details to access available assessments</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pro-input"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="pro-input"
                  placeholder="e.g. 25"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pro-input"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pro-input"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="pro-btn-primary mt-8 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                  Access Portal
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
