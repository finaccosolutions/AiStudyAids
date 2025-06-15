import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import CompetitionModeSelector from '../components/competition/CompetitionModeSelector';
import CreateCompetitionModal from '../components/competition/CreateCompetitionModal';
import JoinCompetitionModal from '../components/competition/JoinCompetitionModal';
import RandomMatchmaking from '../components/competition/RandomMatchmaking';
import CompetitionLobby from '../components/competition/CompetitionLobby';
import CompetitionQuiz from '../components/competition/CompetitionQuiz';
import CompetitionResults from '../components/competition/CompetitionResults';
import InviteNotification from '../components/competition/InviteNotification';
import { Button } from '../components/ui/Button';
import { RefreshCw, X, Users, Trophy } from 'lucide-react';
import { generateQuiz } from '../services/gemini';

const QuizPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { 
    apiKey, loadApiKey, 
    preferences, loadPreferences, 
    questions, generateQuiz: generateSoloQuiz, 
    currentQuestionIndex, answers, answerQuestion, 
    nextQuestion, prevQuestion, 
    finishQuiz, resetQuiz, result 
  } = useQuizStore();
  
  const {
    currentCompetition,
    loadCompetition,
    joinCompetition
  } = useCompetitionStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get('join');
  
  const [step, setStep] = useState<'api-key' | 'preferences' | 'quiz' | 'results' | 'competition-mode' | 'create-competition' | 'join-competition' | 'random-matching' | 'competition-lobby' | 'competition-quiz' | 'competition-results'>('api-key');
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const [competitionMode, setCompetitionMode] = useState<'private' | 'random' | null>(null);
  const [competitionQuestions, setCompetitionQuestions] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);

  // Handle join competition from URL
  useEffect(() => {
    if (joinCode && apiKey) {
      handleJoinCompetition(joinCode);
    }
  }, [joinCode, apiKey]);

  // Handle navigation state for competition mode
  useEffect(() => {
    const state = location.state as any;
    if (state?.mode === 'competition') {
      setStep('competition-mode');
    } else if (state?.mode === 'join-competition') {
      setStep('join-competition');
    }
  }, [location.state]);
  
  useEffect(() => {
    if (apiKey && !preferences) {
      setStep('preferences');
    } else if (apiKey && preferences && questions.length === 0 && !result && !currentCompetition) {
      setStep('preferences');
    } else if (currentCompetition) {
      if (currentCompetition.status === 'waiting') {
        setStep('competition-lobby');
      } else if (currentCompetition.status === 'active') {
        setStep('competition-quiz');
      } else if (currentCompetition.status === 'completed') {
        setStep('competition-results');
      }
    } else if (questions.length > 0 && !result) {
      setStep('quiz');
      // Initialize total time if set
      if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit) {
        setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
      }
    } else if (result) {
      setStep('results');
    } else if (!apiKey) {
      setStep('api-key');
    }
  }, [apiKey, preferences, questions, result, currentCompetition]);

  // Total quiz timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (totalTimeRemaining !== null && totalTimeRemaining > 0 && step === 'quiz') {
      timer = setInterval(() => {
        setTotalTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (totalTimeRemaining === 0) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [totalTimeRemaining, step]);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }
  
  const handleStartSoloQuiz = async () => {
    if (!user) return;
    await generateSoloQuiz(user.id);
    setStep('quiz');
  };

  const handleStartCompetition = () => {
    setStep('competition-mode');
  };

  const handleJoinCompetitionFromPrefs = () => {
    setStep('join-competition');
  };

  const handleCompetitionModeSelect = (mode: 'private' | 'random') => {
    setCompetitionMode(mode);
    
    if (mode === 'private') {
      setStep('create-competition');
    } else {
      setStep('random-matching');
    }
  };

  const handleCreateCompetitionSuccess = async (competitionId: string) => {
    await loadCompetition(competitionId);
    setStep('competition-lobby');
  };

  const handleJoinCompetition = async (code: string) => {
    try {
      await joinCompetition(code);
      // Competition will be loaded and step will be updated via useEffect
    } catch (error) {
      console.error('Error joining competition:', error);
    }
  };

  const handleJoinCompetitionSuccess = async (competitionId: string) => {
    await loadCompetition(competitionId);
    setStep('competition-lobby');
  };

  const handleRandomMatchFound = async (competitionId: string) => {
    await loadCompetition(competitionId);
    setStep('competition-lobby');
  };

  const handleStartCompetitionQuiz = async () => {
    if (!currentCompetition || !apiKey) return;

    try {
      // Generate questions for the competition
      const generatedQuestions = await generateQuiz(apiKey, currentCompetition.quiz_preferences);
      setCompetitionQuestions(generatedQuestions);
      setStep('competition-quiz');
    } catch (error) {
      console.error('Error generating competition questions:', error);
    }
  };

  const handleCompetitionComplete = () => {
    setStep('competition-results');
  };
  
  const handleApiKeySaved = () => {
    setStep('preferences');
  };
  
  const handleFinishQuiz = useCallback(() => {
    finishQuiz();
    setStep('results');
    setTotalTimeRemaining(null);
  }, [finishQuiz]);
  
  const handleNewQuiz = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    setStep('preferences');
  };
  
  const handleChangePreferences = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    navigate('/preferences');
  };

  const handleCloseQuiz = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    navigate('/preferences');
  };

  const handleCloseCompetition = () => {
    setStep('preferences');
    setCompetitionMode(null);
    setCompetitionQuestions([]);
  };

  const handleAnswerSubmit = useCallback(() => {
    // This will be called from QuizQuestion when answer is submitted
  }, []);

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handlePrevious = useCallback(() => {
    prevQuestion();
  }, [prevQuestion]);
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;
      
      case 'preferences':
        return (
          <QuizPreferencesForm
            userId={user.id}
            initialPreferences={preferences || defaultPreferences}
            onSave={handleStartSoloQuiz}
            onStartCompetition={handleStartCompetition}
            onJoinCompetition={handleJoinCompetitionFromPrefs}
          />
        );

      case 'competition-mode':
        return (
          <CompetitionModeSelector
            onSelectMode={handleCompetitionModeSelect}
            onCancel={() => setStep('preferences')}
          />
        );

      case 'create-competition':
        return (
          <CreateCompetitionModal
            mode={competitionMode!}
            quizPreferences={preferences || defaultPreferences}
            onClose={() => setStep('preferences')}
            onSuccess={handleCreateCompetitionSuccess}
          />
        );

      case 'join-competition':
        return (
          <JoinCompetitionModal
            onClose={() => setStep('preferences')}
            onSuccess={handleJoinCompetitionSuccess}
          />
        );

      case 'random-matching':
        return (
          <RandomMatchmaking
            onClose={() => setStep('preferences')}
            onMatchFound={handleRandomMatchFound}
          />
        );

      case 'competition-lobby':
        return currentCompetition ? (
          <CompetitionLobby
            competition={currentCompetition}
            onStartQuiz={handleStartCompetitionQuiz}
          />
        ) : null;

      case 'competition-quiz':
        return currentCompetition && competitionQuestions.length > 0 ? (
          <CompetitionQuiz
            competition={currentCompetition}
            questions={competitionQuestions}
            onComplete={handleCompetitionComplete}
          />
        ) : null;

      case 'competition-results':
        return currentCompetition ? (
          <CompetitionResults
            competition={currentCompetition}
            onNewCompetition={() => setStep('preferences')}
            onBackToHome={() => navigate('/')}
          />
        ) : null;
      
      case 'quiz':
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
          return null;
        }
        
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !preferences) {
          return null;
        }
        
        return (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleCloseQuiz}
                variant="ghost"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Close Quiz
              </Button>
            </div>
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              userAnswer={answers[currentQuestion.id]}
              onAnswer={(answer) => answerQuestion(currentQuestion.id, answer)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
              onFinish={handleFinishQuiz}
              language={preferences.language || 'en'}
              timeLimitEnabled={preferences.timeLimitEnabled || false}
              timeLimit={preferences.timeLimit}
              totalTimeLimit={preferences.totalTimeLimit}
              totalTimeRemaining={totalTimeRemaining}
              mode={preferences.mode || 'practice'}
              answerMode={preferences.mode === 'practice' ? 'immediate' : 'end'}
            />
          </div>
        );
      
      case 'results':
        if (!result) return null;
        
        return (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <QuizResults
              result={result}
              onNewQuiz={handleNewQuiz}
              onChangePreferences={handleChangePreferences}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Invite Notifications */}
      <InviteNotification />
      
      {renderContent()}
    </div>
  );
};

export default QuizPage;