import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { 
  BookOpen, Save, Clock, Languages, ListChecks, 
  BarChart3, Timer, AlertTriangle, Settings, 
  CheckCircle2, AlarmClock
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
  const [timingMode, setTimingMode] = useState<'per-question' | 'total'>('per-question');
  
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

  const calculateTotalTime = () => {
    if (preferences.timeLimit === 'none') return 'No time limit';
    if (preferences.timeLimit === 'custom') {
      return `${preferences.customTimeLimit || 30} seconds`;
    }
    const perQuestionTime = parseInt(preferences.timeLimit || '30');
    return `${perQuestionTime * preferences.questionCount} seconds`;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-3xl font-bold gradient-text mb-2">Quiz Preferences</h2>
          <p className="text-gray-600">Customize your learning experience</p>
        </div>
        
        <form onSubmit={handleSubmit} className="divide-y divide-purple-100">
          {/* Basic Preferences */}
          <div className="p-8 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-purple-600" />
              Basic Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Topic / Subject
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Python Programming"
                  value={preferences.topic}
                  onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                  required
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sub-topic (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={preferences.subtopic || ''}
                  onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty Level
                </label>
                <Select
                  options={difficultyOptions}
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
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
                  className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Question Types */}
          <div className="p-8 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <ListChecks className="w-6 h-6 mr-3 text-purple-600" />
              Question Types
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {questionTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleQuestionTypeToggle(option.value)}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-102 ${
                    isQuestionTypeSelected(option.value)
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-md hover:bg-purple-200'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-100 hover:bg-gray-100 hover:border-purple-200'
                  }`}
                >
                  {isQuestionTypeSelected(option.value) ? (
                    <CheckCircle2 className="w-5 h-5 mb-2 mx-auto text-purple-600" />
                  ) : (
                    <div className="w-5 h-5 mb-2" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Settings */}
          <div className="p-8 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Timer className="w-6 h-6 mr-3 text-purple-600" />
              Time Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setTimingMode('per-question')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    timingMode === 'per-question'
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Clock className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Time per Question</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTimingMode('total')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    timingMode === 'total'
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <AlarmClock className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Total Quiz Time</div>
                </button>
              </div>
              
              <div className="space-y-4">
                {timingMode === 'per-question' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                      <div className="mt-4">
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
                        <p className="text-sm text-gray-500 mt-1">
                          Enter a value between 1 and 3600 seconds
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Quiz Time
                    </label>
                    <div className="text-lg font-medium text-purple-700 bg-purple-50 p-4 rounded-xl border border-purple-200">
                      {calculateTotalTime()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quiz Mode */}
          <div className="p-8 space-y-6 hover:bg-purple-50/30 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
              Quiz Mode
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPreferences({ ...preferences, mode: 'practice' })}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  preferences.mode === 'practice'
                    ? 'border-purple-300 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                  <span className="font-semibold text-lg">Practice Mode</span>
                </div>
                <p className="text-sm text-gray-600">
                  Get immediate feedback after each question. Perfect for learning and understanding concepts.
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setPreferences({ ...preferences, mode: 'exam' })}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  preferences.mode === 'exam'
                    ? 'border-purple-300 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                  <span className="font-semibold text-lg">Exam Mode</span>
                </div>
                <p className="text-sm text-gray-600">
                  See results only at the end. Simulates real exam conditions for better preparation.
                </p>
              </button>
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
          
          <div className="p-8 bg-gray-50 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !preferences.topic}
              className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105 group text-lg px-8 py-3"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
              <Save className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizPreferencesForm;