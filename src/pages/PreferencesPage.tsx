import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import CompetitionPreferencesForm from '../components/competition/CompetitionPreferencesForm';
import JoinCompetitionModal from '../components/competition/JoinCompetitionModal';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz } = useQuizStore();
  const { createCompetition } = useCompetitionStore();

  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [showJoinCompetitionModal, setShowJoinCompetitionModal] = useState(false);
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false);

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
    setShowCompetitionForm(true);
  };

  const handleJoinCompetition = () => {
    setShowJoinCompetitionModal(true);
  };

  const handleCreateCompetition = async (competitionData: any) => {
    if (!user) return;

    setIsCreatingCompetition(true);
    try {
      const competition = await createCompetition({
        title: competitionData.title,
        description: competitionData.description,
        type: 'private',
        maxParticipants: competitionData.maxParticipants,
        quizPreferences: competitionData.quizPreferences,
        emails: competitionData.emails || []
      });

      setShowCompetitionForm(false);
      
      // Navigate to competition lobby
      navigate('/quiz', { 
        state: { 
          mode: 'competition-lobby',
          competitionId: competition.id
        } 
      });
    } catch (error) {
      console.error('Failed to create competition:', error);
    } finally {
      setIsCreatingCompetition(false);
    }
  };

  const handleJoinSuccess = (competitionId: string) => {
    setShowJoinCompetitionModal(false);
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId
      } 
    });
  };

  const handleCloseModals = () => {
    setShowCompetitionForm(false);
    setShowJoinCompetitionModal(false);
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

      {/* Competition Creation Form */}
      {showCompetitionForm && (
        <CompetitionPreferencesForm
          onCreateCompetition={handleCreateCompetition}
          onCancel={handleCloseModals}
          isLoading={isCreatingCompetition}
        />
      )}

      {/* Join Competition Modal */}
      {showJoinCompetitionModal && (
        <JoinCompetitionModal
          onClose={handleCloseModals}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default PreferencesPage;