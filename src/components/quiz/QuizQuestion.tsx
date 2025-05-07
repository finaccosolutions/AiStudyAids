import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { speechService } from '../../services/speech';

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
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  useEffect(() => {
    setSelectedAnswer(userAnswer || '');
  }, [userAnswer, question.id]);
  
  const handleNext = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    onNext();
  };
  
  const handlePrevious = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    onPrevious();
  };
  
  const handleFinish = () => {
    onAnswer(selectedAnswer);
    onFinish();
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
      case 'basic': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3 mt-6">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  selectedAnswer === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
                } cursor-pointer transition-colors`}
                onClick={() => setSelectedAnswer(option)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
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
              </div>
            ))}
          </div>
        );
      
      case 'yes-no':
        return (
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                selectedAnswer === 'Yes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
              onClick={() => setSelectedAnswer('Yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                selectedAnswer === 'No'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
              onClick={() => setSelectedAnswer('No')}
            >
              No
            </button>
          </div>
        );
      
      case 'short-answer':
        return (
          <div className="mt-6">
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              isFullWidth
              className="py-3"
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardBody className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-500">
              Question {questionNumber} of {totalQuestions}
            </div>
            <span className={`text-sm font-medium capitalize ${getDifficultyColor()}`}>
              {question.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className={`p-2 rounded-full ${
                showExplanation 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
              aria-label="Show explanation"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={playQuestionAudio}
              className={`p-2 rounded-full ${
                isSpeaking 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
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
          <h3 className="text-xl font-medium text-gray-800 mb-2">{question.text}</h3>
          {renderQuestionContent()}
          
          {showExplanation && question.explanation && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Explanation:</h4>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-6">
          <div
            className="bg-purple-600 h-1.5 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </CardBody>
      
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={questionNumber === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {isLastQuestion ? (
          <Button
            type="button"
            onClick={handleFinish}
            disabled={!selectedAnswer}
          >
            Finish Quiz
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;