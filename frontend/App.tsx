import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProfilePage from './pages/ProfilePage';
import JobAnalysisPage from './pages/JobAnalysisPage';
import ImprovementPlanPage from './pages/ImprovementPlanPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import CoverLetterPage from './pages/CoverLetterPage';

const queryClient = new QueryClient();

function AppInner() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute>
                <JobAnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="/improvement" element={
              <ProtectedRoute>
                <ImprovementPlanPage />
              </ProtectedRoute>
            } />
            <Route path="/resume" element={
              <ProtectedRoute>
                <ResumeBuilderPage />
              </ProtectedRoute>
            } />
            <Route path="/cover-letter" element={
              <ProtectedRoute>
                <CoverLetterPage />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
