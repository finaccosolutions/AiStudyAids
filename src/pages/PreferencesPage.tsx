import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { 
  Brain, Users, Trophy, Zap, Target, Crown, 
  BookOpen, Clock, Settings, Plus, Hash,
  ArrowRight, Sparkles, Play, UserPlus,
  ChevronRight, Star, Award, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'selection' | 'solo' | 'competition' | 'join';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz, savePreferences } = useQuizStore();
  const { createCompetition, joinCompetition, isLoading: competitionLoading } = useCompetitionStore();

  const [mode, setMode] = useState<Mode>('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo practice form
  const [soloForm, setSoloForm] = useState({
    course: '',
    topic: '',
    subtopic: '',
    questionCount: 10,
    difficulty: 'medium',
    language: 'English',
    questionTypes: ['multiple-choice'],
    mode: 'practice',
    timeLimitEnabled: false,
    timeLimit: '30'
  });

  // Competition form
  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    description: '',
    course: '',
    topic: '',
    questionCount: 10,
    difficulty: 'medium',
    language: 'English',
    timeLimit: '30',
    maxParticipants: 4,
    emails: ['']
  });

  // Join competition form
  const [joinForm, setJoinForm] = useState({
    competitionCode: ''
  });

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'fill-blank', label: 'Fill in the Blank' }
  ];

  const handleSoloSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const prefs = {
        ...defaultPreferences,
        course: soloForm.course,
        topic: soloForm.topic,
        subtopic: soloForm.subtopic,
        questionCount: soloForm.questionCount,
        difficulty: soloForm.difficulty as 'easy' | 'medium' | 'hard',
        language: soloForm.language as any,
        questionTypes: soloForm.questionTypes as any[],
        mode: soloForm.mode as 'practice' | 'exam',
        timeLimitEnabled: soloForm.timeLimitEnabled,
        timeLimit: soloForm.timeLimitEnabled ? soloForm.timeLimit : null,
        answerMode: soloForm.mode === 'practice' ? 'immediate' : 'end'
      };

      await savePreferences(user.id, prefs);
      await generateQuiz(user.id);
      navigate('/quiz');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const validEmails = competitionForm.emails.filter(email => email.trim());
      
      const competition = await createCompetition({
        title: competitionForm.title,
        description: competitionForm.description,
        type: 'private',
        maxParticipants: competitionForm.maxParticipants,
        quizPreferences: {
          course: competitionForm.course,
          topic: competitionForm.topic,
          questionCount: competitionForm.questionCount,
          difficulty: competitionForm.difficulty,
          language: competitionForm.language,
          timeLimit: competitionForm.timeLimit,
          timeLimitEnabled: true,
          mode: 'exam',
          questionTypes: ['multiple-choice', 'true-false', 'short-answer']
        },
        emails: validEmails
      });

      navigate('/quiz', { 
        state: { 
          mode: 'competition-lobby',
          competitionId: competition.id
        } 
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await joinCompetition(joinForm.competitionCode.toUpperCase());
      navigate('/quiz', { 
        state: { 
          mode: 'competition-lobby',
          competitionId: joinForm.competitionCode
        } 
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmail = () => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index: number) => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  const toggleQuestionType = (type: string) => {
    setSoloForm(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <Brain className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Select how you want to learn today - practice solo or compete with others
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Solo Practice */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={() => setMode('solo')}
                >
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-purple-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardBody className="p-8 relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-8 h-8 text-purple-600" />
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Solo Practice</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Learn at your own pace with instant feedback and detailed explanations for every question.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span>Immediate feedback after each question</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span>Detailed explanations and learning tips</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <span>Customizable difficulty and question types</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <span>Self-paced learning experience</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                          Perfect for Learning
                        </span>
                        <Play className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>

                {/* Competition Mode */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={() => setMode('competition')}
                >
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-yellow-300 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-yellow-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardBody className="p-8 relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                          <Trophy className="w-8 h-8 text-yellow-600" />
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Competition</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Challenge friends or colleagues in real-time quiz battles with live rankings and rewards.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                          <span>Real-time multiplayer competitions</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <span>Live leaderboards and rankings</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span>Invite friends via email or code</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span>Competitive scoring and achievements</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                          Challenge Others
                        </span>
                        <Crown className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </div>

              {/* Join Competition Button */}
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setMode('join')}
                    variant="outline"
                    className="px-8 py-4 text-lg font-semibold border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300"
                  >
                    <Hash className="w-5 h-5 mr-2" />
                    Join Competition with Code
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {mode === 'solo' && (
            <motion.div
              key="solo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Solo Practice Setup</h2>
                        <p className="text-purple-100 mt-1">Configure your personalized learning session</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setMode('selection')}
                      className="text-white hover:bg-white/20"
                    >
                      ← Back
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="p-8">
                  <form onSubmit={handleSoloSubmit} className="space-y-8">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Course/Subject *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={soloForm.course}
                          onChange={(e) => setSoloForm({ ...soloForm, course: e.target.value })}
                          required
                          className="w-full py-3 text-lg border-2 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Topic (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Data Structures"
                          value={soloForm.topic}
                          onChange={(e) => setSoloForm({ ...soloForm, topic: e.target.value })}
                          className="w-full py-3 text-lg border-2 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Questions
                        </label>
                        <Select
                          options={[
                            { value: '5', label: '5 Questions (Quick)' },
                            { value: '10', label: '10 Questions (Standard)' },
                            { value: '15', label: '15 Questions (Extended)' },
                            { value: '20', label: '20 Questions (Comprehensive)' }
                          ]}
                          value={soloForm.questionCount.toString()}
                          onChange={(e) => setSoloForm({ ...soloForm, questionCount: parseInt(e.target.value) })}
                          className="w-full py-3 text-lg border-2 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <Select
                          options={[
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' }
                          ]}
                          value={soloForm.difficulty}
                          onChange={(e) => setSoloForm({ ...soloForm, difficulty: e.target.value })}
                          className="w-full py-3 text-lg border-2 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Question Types */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Question Types
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {questionTypeOptions.map((type) => (
                          <motion.button
                            key={type.value}
                            type="button"
                            onClick={() => toggleQuestionType(type.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              soloForm.questionTypes.includes(type.value)
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-center">
                              <div className="font-medium">{type.label}</div>
                              {soloForm.questionTypes.includes(type.value) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="mt-2"
                                >
                                  <Star className="w-4 h-4 text-purple-600 mx-auto" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Mode */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Learning Mode
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          onClick={() => setSoloForm({ ...soloForm, mode: 'practice' })}
                          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                            soloForm.mode === 'practice'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center mb-2">
                            <Sparkles className="w-6 h-6 mr-2 text-green-600" />
                            <span className="font-semibold text-lg">Practice Mode</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get immediate feedback after each question with detailed explanations
                          </p>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setSoloForm({ ...soloForm, mode: 'exam' })}
                          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                            soloForm.mode === 'exam'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center mb-2">
                            <Target className="w-6 h-6 mr-2 text-blue-600" />
                            <span className="font-semibold text-lg">Exam Mode</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            See results only at the end, simulating real exam conditions
                          </p>
                        </motion.button>
                      </div>
                    </div>

                    {/* Time Settings */}
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          checked={soloForm.timeLimitEnabled}
                          onChange={(e) => setSoloForm({ ...soloForm, timeLimitEnabled: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <label className="text-sm font-semibold text-gray-700">
                          Enable Time Limit
                        </label>
                      </div>
                      
                      {soloForm.timeLimitEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Time per Question (seconds)
                            </label>
                            <Select
                              options={[
                                { value: '15', label: '15 seconds' },
                                { value: '30', label: '30 seconds' },
                                { value: '45', label: '45 seconds' },
                                { value: '60', label: '60 seconds' }
                              ]}
                              value={soloForm.timeLimit}
                              onChange={(e) => setSoloForm({ ...soloForm, timeLimit: e.target.value })}
                              className="w-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading || !soloForm.course}
                        className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Generating Quiz...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Learning
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {mode === 'competition' && (
            <motion.div
              key="competition"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-yellow-50">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Create Competition</h2>
                        <p className="text-yellow-100 mt-1">Set up your quiz battle and invite participants</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setMode('selection')}
                      className="text-white hover:bg-white/20"
                    >
                      ← Back
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="p-8">
                  <form onSubmit={handleCompetitionSubmit} className="space-y-8">
                    {/* Competition Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Competition Title *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Computer Science Challenge"
                          value={competitionForm.title}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, title: e.target.value })}
                          required
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          placeholder="Describe your competition..."
                          value={competitionForm.description}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Quiz Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Course/Subject *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={competitionForm.course}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, course: e.target.value })}
                          required
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Topic (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Data Structures"
                          value={competitionForm.topic}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, topic: e.target.value })}
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Questions
                        </label>
                        <Select
                          options={[
                            { value: '5', label: '5 Questions (Quick)' },
                            { value: '10', label: '10 Questions (Standard)' },
                            { value: '15', label: '15 Questions (Extended)' }
                          ]}
                          value={competitionForm.questionCount.toString()}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, questionCount: parseInt(e.target.value) })}
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Time per Question
                        </label>
                        <Select
                          options={[
                            { value: '15', label: '15 seconds (Lightning)' },
                            { value: '30', label: '30 seconds (Standard)' },
                            { value: '45', label: '45 seconds (Relaxed)' }
                          ]}
                          value={competitionForm.timeLimit}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, timeLimit: e.target.value })}
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <Select
                          options={[
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' }
                          ]}
                          value={competitionForm.difficulty}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, difficulty: e.target.value })}
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Max Participants
                        </label>
                        <Select
                          options={[
                            { value: '2', label: '2 Players' },
                            { value: '4', label: '4 Players' },
                            { value: '6', label: '6 Players' },
                            { value: '8', label: '8 Players' },
                            { value: '10', label: '10 Players' }
                          ]}
                          value={competitionForm.maxParticipants.toString()}
                          onChange={(e) => setCompetitionForm({ ...competitionForm, maxParticipants: parseInt(e.target.value) })}
                          className="w-full py-3 text-lg border-2 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    {/* Invite Participants */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Invite Participants (Optional)
                      </label>
                      <div className="space-y-3">
                        {competitionForm.emails.map((email, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Input
                              type="email"
                              placeholder="participant@example.com"
                              value={email}
                              onChange={(e) => updateEmail(index, e.target.value)}
                              className="flex-1 py-3 border-2 focus:border-yellow-500"
                            />
                            {competitionForm.emails.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeEmail(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addEmail}
                          className="w-full border-dashed border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Email
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading || !competitionForm.title || !competitionForm.course}
                        className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Creating Competition...
                          </>
                        ) : (
                          <>
                            <Crown className="w-5 h-5 mr-2" />
                            Create Competition
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <UserPlus className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Join Competition</h2>
                        <p className="text-indigo-100 mt-1">Enter the competition code to join the battle</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setMode('selection')}
                      className="text-white hover:bg-white/20"
                    >
                      ← Back
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Hash className="w-10 h-10 text-indigo-600" />
                    </div>
                    <p className="text-gray-600 text-lg">
                      Ask the competition creator for the 6-digit competition code
                    </p>
                  </div>

                  <form onSubmit={handleJoinSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                        Competition Code
                      </label>
                      <Input
                        type="text"
                        placeholder="ABC123"
                        value={joinForm.competitionCode}
                        onChange={(e) => setJoinForm({ competitionCode: e.target.value.toUpperCase() })}
                        className="w-full py-4 text-center text-2xl font-mono tracking-wider border-2 focus:border-indigo-500"
                        maxLength={6}
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-center">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || joinForm.competitionCode.length !== 6}
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Joining Competition...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Join Competition
                        </>
                      )}
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreferencesPage;