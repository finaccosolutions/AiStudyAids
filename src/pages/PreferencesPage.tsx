import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { preferences, generateQuiz, isLoading } = useQuizStore();

  const handleSaveAndStart = async () => {
    if (!user) return;
    await generateQuiz(user.id);
    navigate('/quiz');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <QuizPreferencesForm
        userId={user.id}
        initialPreferences={preferences || defaultPreferences}
        onSave={handleSaveAndStart}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PreferencesPage;