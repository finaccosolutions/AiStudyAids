import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { Navigate } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';

const QuizPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { 
    apiKey, loadApiKey, 
    preferences, loadPreferences, 
    questions, 
    currentQuestionIndex, answers, answerQuestion, 
    nextQuestion, prevQuestion, 
    finishQuiz, resetQuiz, result 
  } = useQuizStore();
  
  const [step, setStep] = useState<'api-key' | 'quiz' | 'results'>('quiz');
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      if (user) {
        setIsLoadingApiKey(true);
        await loadApiKey(user.id);
        await loadPreferences(user.id);
        setIsLoadingApiKey(false);
      }
    };
    
    initializeData();
  }, [user]);
  
  useEffect(() => {
    if (!isLoadingApiKey) {
      if (!apiKey) {
        setStep('api-key');
      } else if (result) {
        setStep('results');
      } else if (questions.length > 0) {
        setStep('quiz');
      }
    }
  }, [apiKey, questions, result, isLoadingApiKey]);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }
  
  if (isLoadingApiKey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  const handleApiKeySaved = () => {
    setStep('quiz');
  };
  
  const handleFinishQuiz = () => {
    finishQuiz();
    setStep('results');
  };
  
  const handleNewQuiz = () => {
    resetQuiz();
    setStep('quiz');
  };
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;
      
      case 'quiz':
        if (questions.length === 0) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-600">
                <p>No quiz questions available.</p>
                <p className="mt-2">Please generate a quiz from the preferences page.</p>
              </div>
            </div>
          );
        }
        
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
              timeLimit={preferences?.timeLimit}
              mode={preferences?.mode || 'practice'}
              answerMode={preferences?.mode === 'practice' ? 'immediate' : 'end'}
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
              onChangePreferences={() => resetQuiz()}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="relative">
      {renderContent()}
    </div>
  );
};

export default QuizPage;