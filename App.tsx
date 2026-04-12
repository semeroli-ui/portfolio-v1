import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Background3D } from './components/Background3D';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => setIsAuth(res.ok))
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return null;
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen text-white selection:bg-cyan-500/30 selection:text-cyan-200">
        <Background3D />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <>
              <Navbar onOpenResume={() => setResumeOpen(true)} />
              <main className="relative z-10">
                <Hero />
                <About />
                <Projects />
                <Contact />
              </main>
              <Footer />
            </>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
