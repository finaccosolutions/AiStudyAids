import React, { useState, useEffect } from 'react';
import { QuestionType, QuizPreferences } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { BookOpen, Check, Languages, ListChecks, Save } from 'lucide-react';

interface QuizPreferencesFormProps {
  userId: string;
  initialPreferences: QuizPreferences;
  onSave?: () => void;
}

const QuizPreferencesForm: React.FC<QuizPreferencesFormProps> = ({ 
  userId, 
  initialPreferences,
  onSave
}) => {
  const [preferences, setPreferences] = useState<QuizPreferences>(initialPreferences);
  const { savePreferences, isLoading, error } = useQuizStore();
  
  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);
  
  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'yes-no', label: 'Yes/No' },
    { value: 'short-answer', label: 'Short Answer' },
  ];
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'hi', label: 'Hindi' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePreferences(userId, preferences);
    if (onSave) onSave();
  };
  
  const handleQuestionTypeToggle = (type: QuestionType) => {
    setPreferences(prev => {
      const currentTypes = prev.questionTypes;
      
      // If type is already selected, remove it (unless it's the only one)
      if (currentTypes.includes(type) && currentTypes.length > 1) {
        return {
          ...prev,
          questionTypes: currentTypes.filter(t => t !== type)
        };
      }
      
      // If type is not selected, add it
      if (!currentTypes.includes(type)) {
        return {
          ...prev,
          questionTypes: [...currentTypes, type]
        };
      }
      
      return prev;
    });
  };
  
  const isQuestionTypeSelected = (type: QuestionType) => {
    return preferences.questionTypes.includes(type);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-800">Quiz Preferences</h2>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-6">
          <div>
            <label htmlFor="topic" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
              Quiz Topic
            </label>
            <Input
              id="topic"
              type="text"
              placeholder="Enter a topic (e.g., World History, Physics, Literature)"
              value={preferences.topic}
              onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
              required
              isFullWidth
            />
          </div>
          
          <div>
            <label htmlFor="questionCount" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <ListChecks className="w-4 h-4 mr-2 text-purple-600" />
              Number of Questions
            </label>
            <Input
              id="questionCount"
              type="number"
              min={1}
              max={20}
              value={preferences.questionCount}
              onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) || 5 })}
              isFullWidth
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Check className="w-4 h-4 mr-2 text-purple-600" />
              Question Types
            </label>
            <div className="flex flex-wrap gap-2">
              {questionTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isQuestionTypeSelected(option.value as QuestionType)
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                  onClick={() => handleQuestionTypeToggle(option.value as QuestionType)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="language" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Languages className="w-4 h-4 mr-2 text-purple-600" />
              Quiz Language
            </label>
            <Select
              id="language"
              options={languageOptions}
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              isFullWidth
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-medium py-2 px-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardBody>
        
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !preferences.topic}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default QuizPreferencesForm;

// Import useQuizStore separately to avoid circular dependency
import { useQuizStore } from '../../store/useQuizStore';