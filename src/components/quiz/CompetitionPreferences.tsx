import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Users, Clock, Target, Brain, 
  Settings, Zap, Crown, Sparkles, Info,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizPreferences } from '../../types';

interface CompetitionPreferencesProps {
  initialPreferences: QuizPreferences;
  onStartCompetition: (preferences: QuizPreferences) => void;
  onJoinCompetition: () => void;
  onCancel: () => void;
}

const CompetitionPreferences: React.FC<CompetitionPreferencesProps> = ({
  initialPreferences,
  onStartCompetition,
  onJoinCompetition,
  onCancel
}) => {
  const [preferences, setPreferences] = useState<QuizPreferences>({
    ...initialPreferences,
    mode: 'exam', // Always exam mode for competitions
    timeLimitEnabled: true, // Always enable time limits for competitions
    timeLimit: '30', // Default 30 seconds per question
    negativeMarking: true, // Enable negative marking for competitive fairness
    negativeMarks: -0.25,
    questionTypes: initialPreferences.questionTypes.length > 0 
      ? initialPreferences.questionTypes 
      : ['multiple-choice', 'true-false', 'short-answer'] // Default competitive question types
  });

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const competitionQuestionTypes = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Fast-paced single answer questions'
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Quick decision-making questions'
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Brief knowledge-based responses'
    },
    { 
      value: 'fill-blank', 
      label: 'Fill in the Blank',
      description: 'Complete sentences with missing words'
    },
    { 
      value: 'multi-select', 
      label: 'Multi-Select',
      description: 'Choose multiple correct options'
    }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
  ];

  const handleQuestionTypeToggle = (type: string) => {
    setPreferences(prev => {
      const currentTypes = prev.questionTypes;
      
      if (currentTypes.includes(type)) {
        // Don't allow removing all question types
        if (currentTypes.length === 1) {
          return prev;
        }
        return {
          ...prev,
          questionTypes: currentTypes.filter(t => t !== type)
        };
      }
      
      return {
        ...prev,
        questionTypes: [...currentTypes, type]
      };
    });
  };

  const isQuestionTypeSelected = (type: string) => {
    return preferences.questionTypes.includes(type);
  };

  const handleStartCompetition = () => {
    // Ensure we have at least one question type
    if (preferences.questionTypes.length === 0) {
      setPreferences(prev => ({
        ...prev,
        questionTypes: ['multiple-choice']
      }));
      return;
    }
    
    onStartCompetition(preferences);
  };

  const canStartCompetition = preferences.course && 
                             preferences.course.trim() !== '' && 
                             preferences.questionTypes.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-purple-600" />
                Competition Setup
              </h2>
              <p className="text-gray-600">Configure your competitive quiz experience</p>
            </div>
            <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Competitive Mode</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Competition Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Competition Rules</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Exam mode only - see results at the end</li>
                  <li>• Time limits are enforced for fair competition</li>
                  <li>• Negative marking applies to prevent guessing</li>
                  <li>• Real-time leaderboard during the quiz</li>
                  <li>• Chat with opponents before the quiz starts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Basic Competition Settings */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Quiz Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course / Subject *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={preferences.course || ''}
                  onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={preferences.topic || ''}
                  onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <Select
                  options={[
                    { value: '5', label: '5 Questions (Quick)' },
                    { value: '10', label: '10 Questions (Standard)' },
                    { value: '15', label: '15 Questions (Extended)' },
                    { value: '20', label: '20 Questions (Marathon)' }
                  ]}
                  value={preferences.questionCount.toString()}
                  onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <Select
                  options={difficultyOptions}
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Select
                  options={languageOptions}
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time per Question
                </label>
                <Select
                  options={[
                    { value: '15', label: '15 seconds (Lightning)' },
                    { value: '30', label: '30 seconds (Standard)' },
                    { value: '45', label: '45 seconds (Relaxed)' },
                    { value: '60', label: '60 seconds (Extended)' }
                  ]}
                  value={preferences.timeLimit || '30'}
                  onChange={(e) => setPreferences({ ...preferences, timeLimit: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Question Types</h3>
              <div className="tooltip ml-2">
                <Info className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-help" />
                <span className="tooltiptext z-50">Select question types optimized for competitive play</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitionQuestionTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  onClick={() => handleQuestionTypeToggle(type.value)}
                  className={`p-6 rounded-xl text-left transition-all duration-300 ${
                    isQuestionTypeSelected(type.value)
                      ? 'bg-purple-50 border-2 border-purple-500 shadow-lg scale-[1.02]'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{type.label}</span>
                    {isQuestionTypeSelected(type.value) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </motion.button>
              ))}
            </div>

            {preferences.questionTypes.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  Please select at least one question type for your competition.
                </p>
              </div>
            )}
          </div>

          {/* Competition Settings Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Competition Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Questions:</span>
                <span className="ml-2 font-medium">{preferences.questionCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Time/Question:</span>
                <span className="ml-2 font-medium">{preferences.timeLimit}s</span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className="ml-2 font-medium capitalize">{preferences.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-600">Question Types:</span>
                <span className="ml-2 font-medium">{preferences.questionTypes.length} selected</span>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Selected Types:</span>
              <span className="ml-2 font-medium">
                {preferences.questionTypes.map(type => 
                  competitionQuestionTypes.find(t => t.value === type)?.label
                ).join(', ') || 'None selected'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-6"
              >
                Back
              </Button>
              <Button
                onClick={onJoinCompetition}
                variant="outline"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Existing Competition
              </Button>
            </div>
            
            <Button
              onClick={handleStartCompetition}
              disabled={!canStartCompetition}
              className={`gradient-bg px-8 py-3 ${
                !canStartCompetition ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Competition
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPreferences;