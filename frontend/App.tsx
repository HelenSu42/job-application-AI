import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ProfilePage from './pages/ProfilePage';
import JobAnalysisPage from './pages/JobAnalysisPage';
import ImprovementPlanPage from './pages/ImprovementPlanPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import CoverLetterPage from './pages/CoverLetterPage';

const queryClient = new QueryClient();

function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/analysis/:userId" element={<JobAnalysisPage />} />
          <Route path="/improvement/:userId" element={<ImprovementPlanPage />} />
          <Route path="/resume/:userId" element={<ResumeBuilderPage />} />
          <Route path="/cover-letter/:userId" element={<CoverLetterPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
