import React, { useState } from 'react';
import { QuizResult } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { CheckCircle, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';

interface QuizResultsProps {
  result: QuizResult;
  onNewQuiz: () => void;
  onChangePreferences: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onNewQuiz,
  onChangePreferences,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const { getExplanation, explanation, isLoading, resetExplanation, preferences } = useQuizStore();
  
  const handleGetExplanation = async (questionId: number) => {
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
      resetExplanation();
    } else {
      setSelectedQuestionId(questionId);
      await getExplanation(questionId);
    }
  };

  // Calculate final score considering negative marking
  const calculateFinalScore = () => {
    if (!preferences?.negativeMarking || !preferences?.negativeMarks) {
      return result.correctAnswers;
    }

    const incorrectAnswers = result.totalQuestions - result.correctAnswers;
    return result.correctAnswers + (incorrectAnswers * preferences.negativeMarks);
  };

  const finalScore = calculateFinalScore();
  const finalPercentage = Math.max(0, (finalScore / result.totalQuestions) * 100);
  
  // Determine result message based on percentage
  const getResultMessage = () => {
    const percentage = finalPercentage;
    
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 70) return 'Good work!';
    if (percentage >= 60) return 'Not bad!';
    if (percentage >= 50) return 'You passed!';
    return 'Keep studying!';
  };
  
  // Determine result color based on percentage
  const getResultColor = () => {
    const percentage = finalPercentage;
    
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Quiz Results</h2>
        </CardHeader>
        
        <CardBody className="text-center py-6">
          <h3 className="text-2xl font-bold mb-1">{getResultMessage()}</h3>
          
          <div className="text-4xl font-bold my-4">
            <span className={getResultColor()}>{finalPercentage.toFixed(1)}%</span>
          </div>
          
          <p className="text-gray-600">
            You got {result.correctAnswers} out of {result.totalQuestions} questions correct
            {preferences?.negativeMarking && (
              <span className="block text-sm text-gray-500 mt-1">
                Final score: {finalScore.toFixed(2)} (with negative marking of {preferences.negativeMarks} per wrong answer)
              </span>
            )}
          </p>
          
          <div className="w-full max-w-xs mx-auto mt-6">
            <div className="h-4 w-full bg-gray-200 rounded-full">
              <div
                className={`h-4 rounded-full ${
                  finalPercentage >= 80
                    ? 'bg-green-500'
                    : finalPercentage >= 60
                    ? 'bg-blue-500'
                    : finalPercentage >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, finalPercentage))}%` }}
              ></div>
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="flex flex-col sm:flex-row sm:justify-center gap-4">
          <Button
            type="button"
            onClick={onNewQuiz}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onChangePreferences}
          >
            Change Preferences
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Question Review</h3>
        
        {result.questions.map((question) => (
          <Card key={question.id} className="w-full">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    {question.userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <h4 className="text-md font-medium text-gray-800">{question.text}</h4>
                  </div>
                  
                  <div className="mt-3 ml-7">
                    <div className="grid grid-cols-1 gap-2">
                      {question.userAnswer && (
                        <div className="text-sm">
                          <span className="font-medium">Your answer:</span>{' '}
                          <span 
                            className={question.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase() 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            }
                          >
                            {question.userAnswer}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="font-medium">Correct answer:</span>{' '}
                        <span className="text-green-600">{question.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleGetExplanation(question.id)}
                  className="flex-shrink-0"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
              
              {selectedQuestionId === question.id && (
                <div className="ml-7 mt-2">
                  {isLoading ? (
                    <div className="animate-pulse h-20 bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="bg-purple-50 p-3 rounded-md text-sm text-gray-700">
                      <h5 className="font-medium text-purple-700 mb-1">Explanation:</h5>
                      <div className="prose prose-sm">{explanation}</div>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizResults;