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
  
  const [step, setStep] = useState<'api-key' | 'quiz' | 'results'>('api-key');
  
  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);
  
  useEffect(() => {
    if (!apiKey) {
      setStep('api-key');
    } else if (questions.length > 0 && !result) {
      setStep('quiz');
    } else if (result) {
      setStep('results');
    }
  }, [apiKey, questions, result]);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
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

export default QuizPage