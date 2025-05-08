import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { preferences, loadPreferences, savePreferences, generateQuiz, isLoading } = useQuizStore();

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const handleGenerateQuiz = async () => {
    if (!user) return;
    
    // Save preferences and generate quiz in sequence
    await generateQuiz(user.id);
    navigate('/quiz');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <QuizPreferencesForm
        userId={user.id}
        initialPreferences={preferences || defaultPreferences}
        onGenerate={handleGenerateQuiz}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PreferencesPage