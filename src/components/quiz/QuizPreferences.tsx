import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { 
  BookOpen, Save, Clock, Languages, ListChecks, 
  BarChart3, Timer, AlertTriangle, Settings, 
  CheckCircle2
} from 'lucide-react';

interface QuizPreferencesFormProps {
  userId: string;
  initialPreferences: QuizPreferences;
  onSave?: () => void;
}

const timeOptions = [
  { value: 'none', label: 'No Time Limit' },
  { value: 'custom', label: 'Custom Time Limit' },
  { value: '15', label: '15 Seconds' },
  { value: '30', label: '30 Seconds' },
  { value: '45', label: '45 Seconds' },
  { value: '60', label: '60 Seconds' },
  { value: '90', label: '90 Seconds' },
  { value: '120', label: '120 Seconds' },
];

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
  
  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];
  
  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in the Blank' },
    { value: 'matching', label: 'Match the Following' },
    { value: 'code-output', label: 'Code Snippet/Output' },
    { value: 'assertion-reason', label: 'Assertion & Reason' },
  ];
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'tl', label: 'Tamil' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePreferences(userId, preferences);
    if (onSave) onSave();
  };
  
  const handleQuestionTypeToggle = (type: string) => {
    setPreferences(prev => {
      const currentTypes = prev.questionTypes;
      
      if (currentTypes.includes(type) && currentTypes.length > 1) {
        return {
          ...prev,
          questionTypes: currentTypes.filter(t => t !== type)
        };
      }
      
      if (!currentTypes.includes(type)) {
        return {
          ...prev,
          questionTypes: [...currentTypes, type]
        };
      }
      
      return prev;
    });
  };
  
  const isQuestionTypeSelected = (type: string) => {
    return preferences.questionTypes.includes(type);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-2xl font-bold gradient-text">Quiz Preferences</h2>
          <p className="text-gray-600 mt-1">Customize your quiz settings</p>
        </div>
        
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          {/* Basic Preferences */}
          <div className="p-6 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Basic Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Topic / Subject
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Python, Mathematics, History"
                  value={preferences.topic}
                  onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                  required
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Sub-topic (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Data Types, Calculus, World War II"
                  value={preferences.subtopic || ''}
                  onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Difficulty Level
                </label>
                <Select
                  options={difficultyOptions}
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Number of Questions
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={preferences.questionCount}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    questionCount: parseInt(e.target.value) || 5 
                  })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
          
          {/* Question Types */}
          <div className="p-6 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-purple-600" />
              Question Types
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {questionTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleQuestionTypeToggle(option.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isQuestionTypeSelected(option.value)
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-md hover:bg-purple-200'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-100 hover:bg-gray-100 hover:border-purple-200'
                  }`}
                >
                  {isQuestionTypeSelected(option.value) ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 inline-block" />
                  ) : (
                    <div className="w-4 h-4 mr-2 inline-block" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quiz Settings */}
          <div className="p-6 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Timer className="w-5 h-5 mr-2 text-purple-600" />
              Quiz Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Time Limit per Question
                </label>
                <Select
                  options={timeOptions}
                  value={preferences.timeLimit || 'none'}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    timeLimit: e.target.value,
                    customTimeLimit: e.target.value === 'custom' ? 30 : undefined
                  })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
                
                {preferences.timeLimit === 'custom' && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={1}
                      max={3600}
                      value={preferences.customTimeLimit || 30}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        customTimeLimit: parseInt(e.target.value) || 30
                      })}
                      placeholder="Enter time in seconds"
                      className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a value between 1 and 3600 seconds
                    </p>
                  </div>
                )}
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                  Quiz Language
                </label>
                <Select
                  options={languageOptions}
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.negativeMarking}
                    onChange={(e) => setPreferences({ 
                      ...preferences, 
                      negativeMarking: e.target.checked 
                    })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-colors group-hover:border-purple-400"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    Enable Negative Marking
                  </span>
                </label>
              </div>
              
              {preferences.negativeMarking && (
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-purple-700 transition-colors">
                    Negative Marks (per wrong answer)
                  </label>
                  <Input
                    type="number"
                    step="0.25"
                    min="-5"
                    max="0"
                    value={preferences.negativeMarks || -0.25}
                    onChange={(e) => setPreferences({ 
                      ...preferences, 
                      negativeMarks: parseFloat(e.target.value) 
                    })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Quiz Mode */}
          <div className="p-6 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Quiz Mode
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quiz Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md">
                    <input
                      type="radio"
                      name="quizMode"
                      value="practice"
                      checked={preferences.mode === 'practice'}
                      onChange={(e) => setPreferences({ 
                        ...preferences, 
                        mode: e.target.value 
                      })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Practice Mode</span>
                    <span className="text-xs text-gray-500 ml-2">(Show answers after each question)</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md">
                    <input
                      type="radio"
                      name="quizMode"
                      value="exam"
                      checked={preferences.mode === 'exam'}
                      onChange={(e) => setPreferences({ 
                        ...preferences, 
                        mode: e.target.value 
                      })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Exam Mode</span>
                    <span className="text-xs text-gray-500 ml-2">(Show results at end)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="p-6 bg-gray-50 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !preferences.topic}
              className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105 group"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
              <Save className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizPreferencesForm;