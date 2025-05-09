import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle, Volume2, VolumeX, BookOpen, Clock } from 'lucide-react';
import { speechService } from '../../services/speech';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  onFinish: () => void;
  language: string;
  timeLimit?: string | null;
  totalTimeLimit?: string | null;
  customTimeLimit?: number | null;
  customTotalTimeLimit?: number | null;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswer,
  onPrevious,
  onNext,
  isLastQuestion,
  onFinish,
  language,
  timeLimit,
  totalTimeLimit,
  customTimeLimit,
  customTotalTimeLimit,
  mode,
  answerMode,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (totalTimeLimit && totalTimeLimit !== 'none') {
      return totalTimeLimit === 'custom'
        ? customTotalTimeLimit || 300
        : parseInt(totalTimeLimit);
    }
    
    if (!timeLimit || timeLimit === 'none') return null;
    if (timeLimit === 'custom') {
      return customTimeLimit || 30;
    }
    return parseInt(timeLimit);
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  
  useEffect(() => {
    setSelectedAnswer(userAnswer || '');
    setHasAnswered(!!userAnswer);
  }, [userAnswer, question.id]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNext();
    }
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const handleNext = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setTimeLeft(timeLeft);
    setHasAnswered(false);
    onNext();
  };
  
  const handlePrevious = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setTimeLeft(timeLeft);
    setHasAnswered(false);
    onPrevious();
  };
  
  const handleFinish = () => {
    onAnswer(selectedAnswer);
    onFinish();
  };
  
  const handleAnswerSubmit = () => {
    setHasAnswered(true);
    if (mode === 'practice' || answerMode === 'immediate') {
      setShowExplanation(true);
    }
  };
  
  const playQuestionAudio = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(question.text, language);
      setIsSpeaking(true);
      
      const checkSpeakingInterval = setInterval(() => {
        if (!speechService.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingInterval);
        }
      }, 100);
    }
  };
  
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'basic': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const isAnswerCorrect = () => {
    return selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
  };
  
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <motion.div 
            className="space-y-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate'
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === option
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    : selectedAnswer === option
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                } cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-md`}
                onClick={() => !hasAnswered && setSelectedAnswer(option)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedAnswer === option
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedAnswer === option && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      
      case 'true-false':
        return (
          <motion.div 
            className="flex space-x-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {['True', 'False'].map((option) => (
              <button
                key={option}
                type="button"
                disabled={hasAnswered}
                className={`flex-1 py-4 px-6 rounded-lg font-medium transform transition-all duration-300 ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate'
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'bg-green-600 text-white'
                      : selectedAnswer === option
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    : selectedAnswer === option
                      ? 'bg-purple-600 text-white scale-105 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:scale-102'
                }`}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </button>
            ))}
          </motion.div>
        );
      
      case 'fill-blank':
      case 'short-answer':
        return (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={hasAnswered}
              isFullWidth
              className={`py-3 text-lg transition-all duration-300 ${
                hasAnswered && mode === 'practice' && answerMode === 'immediate'
                  ? isAnswerCorrect()
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full transform transition-all duration-300 hover:shadow-lg">
      <CardBody className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-500">
              Question {questionNumber} of {totalQuestions}
            </div>
            <span className={`text-sm font-medium capitalize px-3 py-1 rounded-full ${getDifficultyColor()}`}>
              {question.difficulty}
            </span>
            {timeLeft !== null && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`font-medium ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className={`p-2 rounded-full transition-all duration-300 ${
                showExplanation 
                  ? 'bg-purple-100 text-purple-600 scale-110' 
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:scale-105'
              }`}
              aria-label="Show explanation"
              disabled={!hasAnswered || (mode === 'exam' && answerMode === 'end')}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={playQuestionAudio}
              className={`p-2 rounded-full transition-all duration-300 ${
                isSpeaking 
                  ? 'bg-purple-100 text-purple-600 scale-110' 
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:scale-105'
              }`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Speak question'}
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        <div className="py-4">
          <h3 className="text-xl font-medium text-gray-800 mb-4">{question.text}</h3>
          {renderQuestionContent()}
          
          <AnimatePresence>
            {showExplanation && question.explanation && hasAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                <div className={`p-4 rounded-lg border ${
                  isAnswerCorrect()
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    isAnswerCorrect() ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isAnswerCorrect() ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-gray-700">{question.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </CardBody>
      
      <CardFooter className="flex justify-between bg-gray-50">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={questionNumber === 1}
          className="hover:bg-purple-50 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {!hasAnswered ? (
          <Button
            type="button"
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer}
            className="gradient-bg hover:opacity-90 transition-all duration-300"
          >
            Submit Answer
          </Button>
        ) : (
          isLastQuestion ? (
            <Button
              type="button"
              onClick={handleFinish}
              className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Finish Quiz
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;