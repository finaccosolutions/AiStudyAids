// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage'; // This is now the main quiz page
import AuthPage from './pages/AuthPage';
import PreferencesPage from './pages/PreferencesPage';
import ApiSettingsPage from './pages/ApiSettingsPage';
import QuestionBankPage from './pages/QuestionBankPage';
import AnswerEvaluationPage from './pages/AnswerEvaluationPage';
import NotesGeneratorPage from './pages/NotesGeneratorPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CompetitionPage from './pages/CompetitionPage'; // This is the Quiz Dashboard
import AiTutorialPage from './pages/AiTutorialPage';
import AuthRedirectPage from './pages/AuthRedirectPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import SharedQuizResultPage from './pages/SharedQuizResultPage';
import SharedCompetitionResultPage from './pages/SharedCompetitionResultPage';
import QuizPage from './pages/QuizPage'; // Keep QuizPage.tsx

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { loadUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} /> {/* Homepage is now the quiz hub */}
        <Route path="auth" element={<AuthPage />} />
        <Route path="auth-redirect" element={<AuthRedirectPage />} />
        <Route path="EmailConfirmationPage" element={<EmailConfirmationPage />} />
        <Route path="quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} /> {/* QuizPage remains */}
        <Route path="api-settings" element={<ProtectedRoute><ApiSettingsPage /></ProtectedRoute>} />
        <Route path="question-bank" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
        <Route path="answer-evaluation" element={<ProtectedRoute><AnswerEvaluationPage /></ProtectedRoute>} />
        <Route path="notes" element={<ProtectedRoute><NotesGeneratorPage /></ProtectedRoute>} />
        <Route path="study-plan" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
        <Route path="progress" element={<ProtectedRoute><ProgressTrackerPage /></ProtectedRoute>} />
        <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="competitions" element={<ProtectedRoute><CompetitionPage /></ProtectedRoute>} /> {/* Quiz Dashboard */}
        <Route path="ai-tutorial" element={<ProtectedRoute><AiTutorialPage /></ProtectedRoute>} />
        <Route path="/shared-quiz-result/:resultId" element={<SharedQuizResultPage />} />
        <Route path="/shared-competition-result/:resultId" element={<SharedCompetitionResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App; 