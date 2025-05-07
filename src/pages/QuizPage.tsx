import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { Navigate } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import { Button } from '../components/ui/Button';
import { Settings } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { 
    apiKey, loadApiKey, 
    preferences, loadPreferences, 
    questions, generateQuiz, 
    currentQuestionIndex, answers, answerQuestion, 
    nextQuestion, prevQuestion, 
    finishQuiz, resetQuiz, result 
  } = useQuizStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'api-key' | 'preferences' | 'quiz' | 'results'>('api-key');
  
  useEffect(() => {
    if (user) {
      // Load API key and preferences
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);
  
  useEffect(() => {
    if (apiKey && !preferences) {
      setStep('preferences');
    } else if (apiKey && preferences && questions.length === 0 && !result) {
      setStep('preferences');
    } else if (questions.length > 0 && !result) {
      setStep('quiz');
    } else if (result) {
      setStep('results');
    } else if (!apiKey) {
      setStep('api-key');
    }
  }, [apiKey, preferences, questions, result]);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }
  
  const handleStartQuiz = async () => {
    if (!user) return;
    
    await generateQuiz(user.id);
    setStep('quiz');
  };
  
  const handleApiKeySaved = () => {
    setStep('preferences');
  };
  
  const handleFinishQuiz = () => {
    finishQuiz();
    setStep('results');
  };
  
  const handleNewQuiz = () => {
    resetQuiz();
    setStep('preferences');
  };
  
  const handleChangePreferences = () => {
    resetQuiz();
    setStep('preferences');
  };
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <QuizPreferencesForm
              userId={user.id}
              initialPreferences={preferences || defaultPreferences}
            />
            
            <div className="flex justify-center">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                disabled={!preferences?.topic}
              >
                Generate Quiz
              </Button>
            </div>
          </div>
        );
      
      case 'quiz':
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
          return null;
        }
        
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) {
          return null;
        }
        
        return (
          <div className="max-w-3xl mx-auto">
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              userAnswer={answers[currentQuestion.id]}
              onAnswer={(answer) => answerQuestion(currentQuestion.id, answer)}
              onPrevious={prevQuestion}
              onNext={nextQuestion}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
              onFinish={handleFinishQuiz}
              language={preferences?.language || 'en'}
            />
          </div>
        );
      
      case 'results':
        if (!result) return null;
        
        return (
          <div className="max-w-3xl mx-auto">
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
    <div className="relative">
      {step !== 'api-key' && (
        <div className="absolute top-0 right-0">
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {showSettings && step !== 'api-key' && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <ApiKeyForm userId={user!.id} />
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default QuizPage;