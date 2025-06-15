import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz, isLoading } = useQuizStore();

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const handleStartQuiz = async () => {
    if (!user) return;
    
    await generateQuiz(user.id);
    navigate('/quiz', { state: { from: '/preferences' } });
  };

  const handleStartCompetition = () => {
    navigate('/quiz', { state: { mode: 'competition' } });
  };

  const handleJoinCompetition = () => {
    navigate('/quiz', { state: { mode: 'join-competition' } });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <QuizPreferencesForm
        userId={user.id}
        initialPreferences={preferences || defaultPreferences}
        onSave={handleStartQuiz}
        onStartCompetition={handleStartCompetition}
        onJoinCompetition={handleJoinCompetition}
      />
    </div>
  );
};

export default PreferencesPage;