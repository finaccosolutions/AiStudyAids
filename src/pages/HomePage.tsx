// src/pages/HomePage.tsx
import { supabase } from '../services/supabase';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizModeSelector from '../components/quiz/QuizModeSelector';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import JoinCompetitionForm from '../components/quiz/JoinCompetitionForm';
import RandomMatchmaking from '../components/competition/RandomMatchmaking'; // CORRECTED IMPORT PATH
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import CompetitionLobby from '../components/competition/CompetitionLobby';
import CompetitionQuiz from '../components/competition/CompetitionQuiz';
import CompetitionResults from '../components/competition/CompetitionResults';
import CompetitionManagement from '../components/competition/CompetitionManagement';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { ArrowLeft, Trophy, Users, Clock, Brain, GraduationCap, FileQuestion, PenTool, BookOpen, Calendar, LineChart, Rocket, Target, Award, Zap, CheckCircle, Star, TrendingUp, Shield, Globe, Sparkles, ArrowRight, Play, Crown, Hash, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const {
    apiKey, loadApiKey,
    preferences, loadPreferences,
    questions, generateQuiz,
    currentQuestionIndex, answers, answerQuestion,
    nextQuestion, prevQuestion,
    finishQuiz, resetQuiz, result,
    totalTimeElapsed, setTotalTimeElapsed,
    totalTimeRemaining, setTotalTimeRemaining,
  } = useQuizStore();

  const {
    currentCompetition,
    loadCompetition,
    loadUserCompetitions,
    loadUserActiveCompetitions,
    userActiveCompetitions,
    participants,
    loadParticipants,
    clearCurrentCompetition,
    createCompetition,
    cleanupSubscriptions,
    setCleanupFlag
  } = useCompetitionStore();

  const navigate = useNavigate();
  const location = useLocation();

  const isInitializedRef = useRef(false);
  const competitionCompletedRef = useRef(false);
  const isOnResultsPageRef = useRef(false);
  const isComponentMountedRef = useRef(true);

  const [step, setStep] = useState<
    'api-key' | 'mode-selector' | 'solo-preferences' | 'create-competition' |
    'join-competition' | 'random-match' | 'quiz' | 'results' |
    'competition-lobby' | 'competition-quiz' | 'competition-results' |
    'competition-management' | 'active-competitions-selector'
  >('mode-selector'); // Default to mode-selector

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const quizStartTimeRef = useRef<number | null>(null);

  // Marketing content data
  const studyAids = [
    {
      title: 'Solo Quiz',
      description: 'Generate personalized quizzes with intelligent questions and get instant feedback.',
      icon: Brain,
      path: '/', // Navigate to homepage
      state: { mode: 'solo-preferences' }, // Pass state for specific mode
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      shadowColor: 'shadow-blue-500/25',
      hoverShadow: 'hover:shadow-blue-500/40',
      stats: 'Personalized learning',
      badge: 'Practice Mode',
      badgeColor: 'bg-blue-500',
      pattern: 'bg-gradient-to-br from-blue-100/50 to-indigo-100/30',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500'
    },
    {
      title: 'Create Competition',
      description: 'Design custom quizzes and invite friends for a competitive challenge.',
      icon: Crown,
      path: '/', // Navigate to homepage
      state: { mode: 'create-competition' }, // Pass state for specific mode
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
      shadowColor: 'shadow-purple-500/25',
      hoverShadow: 'hover:shadow-purple-500/40',
      stats: 'Host your own quiz',
      badge: 'Host Battle',
      badgeColor: 'bg-purple-500',
      pattern: 'bg-gradient-to-br from-purple-100/50 to-pink-100/30',
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500'
    },
    {
      title: 'Join Competition',
      description: 'Enter existing competitions using a unique code and test your knowledge against others.',
      icon: Hash,
      path: '/', // Navigate to homepage
      state: { mode: 'join-competition' }, // Pass state for specific mode
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-600',
      shadowColor: 'shadow-green-500/25',
      hoverShadow: 'hover:shadow-green-500/40',
      stats: 'Compete with friends',
      badge: 'Quick Join',
      badgeColor: 'bg-green-500',
      pattern: 'bg-gradient-to-br from-green-100/50 to-emerald-100/30',
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500'
    },
    {
      title: 'Random Match',
      description: 'Get instantly matched with players globally for quick, exciting quiz battles.',
      icon: Zap,
      path: '/', // Navigate to homepage
      state: { mode: 'random-match' }, // Pass state for specific mode
      gradient: 'from-orange-500 to-red-500',
      hoverGradient: 'hover:from-orange-600 hover:to-red-600',
      shadowColor: 'shadow-orange-500/25',
      hoverShadow: 'hover:shadow-orange-500/40',
      stats: 'Global matchmaking',
      badge: 'Instant Battle',
      badgeColor: 'bg-orange-500',
      pattern: 'bg-gradient-to-br from-orange-100/50 to-red-100/30',
      iconBg: 'bg-gradient-to-br from-orange-400 to-red-500'
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms create personalized study paths tailored to your learning style',
      gradient: 'from-blue-500 to-indigo-500',
      stats: '99.9% uptime'
    },
    {
      icon: Target,
      title: 'Smart Assessment',
      description: 'Detailed feedback and performance analysis with actionable insights',
      gradient: 'from-green-500 to-teal-500',
      stats: '95% accuracy'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Visual analytics and achievement milestones to keep you motivated',
      gradient: 'from-purple-500 to-pink-500',
      stats: '10M+ tracked'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with learners worldwide and compete in real-time challenges',
      gradient: 'from-orange-500 to-red-500',
      stats: '5M+ users'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'QuizGenius helped me ace my medical exams with personalized practice questions.',
      rating: 5,
      avatar: '👩‍⚕️',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Alex Kumar',
      role: 'Software Engineer',
      content: 'The AI-powered feedback is incredibly detailed and helped improve my coding skills.',
      rating: 5,
      avatar: '👨‍💻',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      name: 'Maria Rodriguez',
      role: 'High School Teacher',
      content: 'I use QuizGenius to create engaging quizzes for my students. They love it!',
      rating: 5,
      avatar: '👩‍🏫',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { icon: Users, value: '5M+', label: 'Active Learners', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Trophy, value: '1M+', label: 'Competitions', gradient: 'from-purple-500 to-pink-500' },
    { icon: Target, value: '50M+', label: 'Questions Solved', gradient: 'from-green-500 to-emerald-500' },
    { icon: Award, value: '95%', label: 'Success Rate', gradient: 'from-orange-500 to-red-500' }
  ];

  // Component lifecycle management
  useEffect(() => {
    isComponentMountedRef.current = true;

    return () => {
      console.log('HomePage component unmounting, cleaning up...');
      isComponentMountedRef.current = false;

      setCleanupFlag(true);
      cleanupSubscriptions();
    };
  }, [setCleanupFlag, cleanupSubscriptions]);

  // Initial data load and step determination
  useEffect(() => {
    if (!user || isInitializedRef.current || !isComponentMountedRef.current) return;

    const initializeQuizPage = async () => {
      try {
        await Promise.all([
          loadApiKey(user.id),
          loadPreferences(user.id),
          loadUserCompetitions(user.id)
        ]);

        if (isComponentMountedRef.current) {
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize quiz page:', error);
      }
    };

    initializeQuizPage();
  }, [user, loadApiKey, loadPreferences, loadUserCompetitions]);

  // Step determination logic (from QuizPage.tsx)
  useEffect(() => {
    if (!isComponentMountedRef.current) return; // Ensure component is mounted

    const determineStep = async () => {
      // 1. Prioritize location.state for direct navigation from marketing cards
      if (location.state?.mode) {
        const modeFromState = location.state.mode;
        if (modeFromState === 'solo-preferences' || modeFromState === 'create-competition' ||
            modeFromState === 'join-competition' || modeFromState === 'random-match') {
          setStep(modeFromState);
          setSelectedMode(modeFromState.split('-')[0]); // Set selectedMode for back navigation
          // Clear location state to prevent re-triggering on subsequent renders
          navigate(location.pathname, { replace: true, state: {} });
          return; // Exit early after handling direct navigation
        }
      }

      // If not navigating directly via location.state, proceed with normal initialization/step determination
      // This part runs only once after initial data load, or if user/currentCompetition changes
      if (!user || !isInitializedRef.current) {
        // If user is not loaded or not initialized, keep default step or wait for initialization
        return;
      }

      // 2. Handle competition completion flag (highest priority after direct navigation)
      if (competitionCompletedRef.current && step !== 'competition-results') {
        setStep('competition-results');
        isOnResultsPageRef.current = true;
        return;
      }

      // 3. Prevent auto-redirect if already on results page
      if (isOnResultsPageRef.current && step === 'competition-results') {
        return;
      }

      // 4. Check for active competitions (if user is logged in)
      if (user && isComponentMountedRef.current) {
        const activeCompetitions = await loadUserActiveCompetitions(user.id);

        if (activeCompetitions.length > 0 && isComponentMountedRef.current) {
          if (activeCompetitions.length === 1) {
            const competition = activeCompetitions[0];
            loadCompetition(competition.id);

            const { data: userParticipant } = await supabase
              .from('competition_participants')
              .select('status')
              .eq('competition_id', competition.id)
              .eq('user_id', user.id)
              .maybeSingle();

            if ((userParticipant?.status === 'completed' || competition.status === 'completed') && isComponentMountedRef.current) {
              if (step !== 'competition-results' && !competitionCompletedRef.current) {
                setStep('competition-results');
                competitionCompletedRef.current = true;
                isOnResultsPageRef.current = true;
              }
              return;
            }

            if (isComponentMountedRef.current) {
              const newStep = competition.status === 'waiting' ? 'competition-lobby' :
                            competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
              setStep(newStep);
            }
            return;
          } else {
            if (isComponentMountedRef.current) {
              setStep('active-competitions-selector');
            }
            return;
          }
        }
      }

      // 5. Handle current competition state (if one is loaded)
      if (currentCompetition && isComponentMountedRef.current) {
        const { data: competitionCheck } = await supabase
          .from('competitions')
          .select('status')
          .eq('id', currentCompetition.id)
          .maybeSingle();

        if (!competitionCheck) {
          clearCurrentCompetition();
          competitionCompletedRef.current = false;
          isOnResultsPageRef.current = false;
          if (isComponentMountedRef.current) {
            setStep('mode-selector');
          }
          return;
        }

        if (user && isComponentMountedRef.current) {
          const { data: userParticipant } = await supabase
            .from('competition_participants')
            .select('status')
            .eq('competition_id', currentCompetition.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if ((userParticipant?.status === 'completed' || competitionCheck.status === 'completed') &&
              step !== 'competition-results' && !competitionCompletedRef.current && isComponentMountedRef.current) {
            setStep('competition-results');
            competitionCompletedRef.current = true;
            isOnResultsPageRef.current = true;
            return;
          }
        }

        if (step !== 'competition-results' && !competitionCompletedRef.current && isComponentMountedRef.current) {
          const newStep = competitionCheck.status === 'waiting' ? 'competition-lobby' :
                        competitionCheck.status === 'active' ? 'competition-quiz' :
                        competitionCheck.status === 'completed' ? 'competition-results' : 'mode-selector';

          if (newStep === 'mode-selector') {
            clearCurrentCompetition();
            competitionCompletedRef.current = false;
            isOnResultsPageRef.current = false;
          } else if (newStep === 'competition-results') {
            competitionCompletedRef.current = true;
            isOnResultsPageRef.current = true;
          }

          setStep(newStep);
          return;
        }
      }

      // 6. Default to mode-selector or current quiz state if no other conditions met
      if (!currentCompetition && !competitionCompletedRef.current && isComponentMountedRef.current) {
        let newStep: string;

        if (isGeneratingQuiz) {
          return; // Stay on current step if quiz is generating
        }

        if (result && result.questions && result.questions.length > 0) {
          newStep = 'results';
        } else if (questions.length > 0 && !result) {
          newStep = 'quiz';
          if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit && totalTimeRemaining === null) {
            setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
          }
        } else {
          newStep = 'mode-selector';
        }

        setStep(newStep as any);
      }
    };

    // Execute determineStep directly without setTimeout
    determineStep();
  }, [user, isInitializedRef.current, location.state, // Add location.state as a dependency
      competitionCompletedRef, isOnResultsPageRef, currentCompetition,
      loadUserActiveCompetitions, loadCompetition, clearCurrentCompetition,
      isGeneratingQuiz, result, questions, preferences, totalTimeRemaining,
      navigate, step, selectedMode]);


  const handleFinishQuiz = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    finishQuiz();
    setStep('results');
    setTotalTimeRemaining(null);
  }, [finishQuiz, setTotalTimeRemaining]);


  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit && preferences?.timeLimit === null && step === 'quiz' && questions.length > 0 && isComponentMountedRef.current) {
      if (totalTimeRemaining === null) {
        setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
      }

      timer = setInterval(() => {
        setTotalTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer!);
            if (isComponentMountedRef.current) {
              setTimeout(() => {
                handleFinishQuiz();
              }, 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [step, questions.length, handleFinishQuiz, preferences, totalTimeRemaining, setTotalTimeRemaining]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (step === 'quiz' && questions.length > 0 && isComponentMountedRef.current) {
      if (quizStartTimeRef.current === null || totalTimeElapsed === 0) {
        quizStartTimeRef.current = Date.now() - (totalTimeElapsed * 1000);
      }

      timer = setInterval(() => {
        if (quizStartTimeRef.current !== null) {
          setTotalTimeElapsed(Math.floor((Date.now() - quizStartTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
      quizStartTimeRef.current = null;
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [step, questions.length, setTotalTimeElapsed, totalTimeElapsed]);


  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  const handleApiKeySaved = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    setStep('mode-selector');
  }, []);

  const handleModeSelect = useCallback((mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => {
    if (!isComponentMountedRef.current) return;
    setSelectedMode(mode);
    const newStep = mode === 'solo' ? 'solo-preferences' :
                   mode === 'create-competition' ? 'create-competition' :
                   mode === 'join-competition' ? 'join-competition' : 'random-match';
    setStep(newStep);
  }, []);

  const handleBackToModeSelector = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    resetQuiz();
    clearCurrentCompetition();
    setCleanupFlag(false);
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    setSelectedMode(null);
    setTotalTimeElapsed(0);
    setTotalTimeRemaining(null);
    setStep('mode-selector');
  }, [resetQuiz, clearCurrentCompetition, setCleanupFlag, setTotalTimeElapsed, setTotalTimeRemaining]);

  const handleShowCompetitionManagement = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    setStep('competition-management');
  }, []);

    const handleStartSoloQuiz = useCallback(async () => {
      if (!user || !isComponentMountedRef.current) return;

      if (!apiKey) {
        setStep('api-key');
        return;
      }

      setIsGeneratingQuiz(true);
      try {
        await generateQuiz(user.id);
        if (isComponentMountedRef.current) {
          setStep('quiz');
        }
      } catch (error) {
        console.error('Failed to generate quiz:', error);
      } finally {
        setIsGeneratingQuiz(false);
      }
    }, [user, generateQuiz, apiKey]);


  const handleNewQuiz = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    resetQuiz();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    setTotalTimeElapsed(0);
    setTotalTimeRemaining(null);
    setStep('mode-selector');
  }, [resetQuiz, setTotalTimeElapsed, setTotalTimeRemaining]);

  const handleChangePreferences = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    resetQuiz();
    setTotalTimeElapsed(0);
    setTotalTimeRemaining(null);
    const newStep = selectedMode === 'solo' ? 'solo-preferences' : 'mode-selector';
    setStep(newStep);
  }, [resetQuiz, selectedMode, setTotalTimeElapsed, setTotalTimeRemaining]);

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handlePrevious = useCallback(() => {
    prevQuestion();
  }, [prevQuestion]);

  const handleJoinSuccess = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    setStep('competition-lobby');
  }, []);

  const handleMatchFound = useCallback((competitionId: string) => {
    if (!isComponentMountedRef.current) return;
    setStep('competition-lobby');
  }, []);

const handleStartCompetitionQuiz = useCallback(async () => {
  if (!currentCompetition || !user || !apiKey || !isComponentMountedRef.current) return;

  try {
    setStep('competition-quiz');
  } catch (error) {
    console.error('Failed to start competition quiz:', error);
  }
}, [currentCompetition, user, apiKey]);

  const handleCompetitionComplete = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    competitionCompletedRef.current = true;
    isOnResultsPageRef.current = true;

    setStep('competition-results');
  }, []);

  const handleNewCompetition = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    clearCurrentCompetition();
    setCleanupFlag(false);
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    setStep('mode-selector');
  }, [clearCurrentCompetition, setCleanupFlag]);

  const handleBackToHome = useCallback(() => {
    setCleanupFlag(true);
    cleanupSubscriptions();
    clearCurrentCompetition();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    // This navigate is now to the marketing section of the homepage
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('mode-selector'); // Reset step to show quiz mode selector if user clicks "Start Learning Now" again
  }, [clearCurrentCompetition, setCleanupFlag, cleanupSubscriptions]);

const handleCreateCompetitionSuccess = useCallback(async (preferences, title, description) => {
  if (!user || !isComponentMountedRef.current) return;

  setIsGeneratingQuiz(true);
  try {
    await createCompetition({ preferences, userId: user.id, title, description, type: 'private' });
    if (isComponentMountedRef.current) {
      setStep('competition-lobby');
    }
  } catch (error) {
    console.error('Failed to create competition:', error);
  } finally {
    setIsGeneratingQuiz(false);
  }
}, [user, createCompetition]);

  const handleSelectActiveCompetition = useCallback((competition: any) => {
    if (!isComponentMountedRef.current) return;

    loadCompetition(competition.id);

    const newStep = competition.status === 'waiting' ? 'competition-lobby' :
                   competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
    setStep(newStep);
  }, [loadCompetition]);

  const handleLeaveCompetition = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    setCleanupFlag(true);
    cleanupSubscriptions();
    clearCurrentCompetition();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    setStep('mode-selector');
  }, [clearCurrentCompetition, setCleanupFlag, cleanupSubscriptions]);

  // Render content based on step
  const renderQuizContent = () => {
    if (!user) return null;

    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;

      case 'active-competitions-selector':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
            <div className="w-full px-4 py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">Active Competitions</h1>
                    <p className="text-gray-600 text-lg">You have multiple active competitions. Choose one to continue:</p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4 mb-8">
                {userActiveCompetitions.map((competition, index) => (
                  <motion.div
                    key={competition.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-purple-300"
                          onClick={() => handleSelectActiveCompetition(competition)}>
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{competition.title}</h3>
                              <p className="text-gray-600">{competition.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  competition.status === 'waiting'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {competition.status === 'waiting' ? 'Waiting for participants' : 'Active'}
                                </span>
                                <span className="flex items-center text-gray-500">
                                  <Users className="w-4 h-4 mr-1" />
                                  {competition.participant_count || 0} participants
                                </span>
                                <span className="flex items-center text-gray-500">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Created {new Date(competition.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">#{competition.competition_code}</div>
                            <div className="text-sm text-gray-500">Competition Code</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleBackToModeSelector}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Start New Quiz Instead
                </Button>
              </div>
            </div>
          </div>
        );

      case 'mode-selector':
        return (
          <QuizModeSelector
            onSelectMode={handleModeSelect}
            onShowCompetitionManagement={handleShowCompetitionManagement}
          />
        );

      case 'competition-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToModeSelector}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quiz Modes
              </Button>
            </div>
            <CompetitionManagement userId={user.id} />
          </div>
        );

        case 'solo-preferences':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={handleBackToModeSelector}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isGeneratingQuiz}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Quiz Modes
                </Button>
              </div>
               {isGeneratingQuiz ? (
                <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Generating your quiz...</p>
                  </div>
                </div>
              ) : (
                <QuizPreferencesForm
                  userId={user.id}
                  initialPreferences={preferences || defaultPreferences}
                  onSave={handleStartSoloQuiz}
                />
              )}
            </div>
          );

          case 'create-competition':
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    onClick={handleBackToModeSelector}
                    className="text-gray-600 hover:text-gray-800"
                    disabled={isGeneratingQuiz}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Quiz Modes
                  </Button>
                </div>
                {isGeneratingQuiz ? (
                  <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-lg text-gray-600">Creating your competition...</p>
                    </div>
                  </div>
                ) : (
                  <QuizPreferencesForm
                    userId={user.id}
                    initialPreferences={preferences || defaultPreferences}
                    onStartCompetition={handleCreateCompetitionSuccess}
                  />
                )}
              </div>
            );

      case 'join-competition':
        return (
          <JoinCompetitionForm
            onJoinSuccess={handleJoinSuccess}
            onCancel={handleBackToModeSelector}
          />
        );

      case 'random-match':
        return (
          <RandomMatchmaking
            onMatchFound={handleMatchFound}
            onCancel={handleBackToModeSelector}
          />
        );

      case 'competition-lobby':
        if (!currentCompetition) {
          return <div>Loading competition...</div>;
        }
        return (
          <CompetitionLobby
            competition={currentCompetition}
            onStartQuiz={handleStartCompetitionQuiz}
            onLeave={handleLeaveCompetition}
          />
        );

        case 'competition-quiz':
          if (!currentCompetition) {
            return <div>Loading competition...</div>;
          }
          return (
            <CompetitionQuiz
              competition={currentCompetition}
              onComplete={handleCompetitionComplete}
              onLeave={handleLeaveCompetition}
            />
          );

      case 'competition-results':
        if (!currentCompetition) {
          return <div>Loading results...</div>;
        }
        isOnResultsPageRef.current = true;
        return (
          <CompetitionResults
            competition={currentCompetition}
            onNewCompetition={handleNewCompetition}
            onBackToHome={handleBackToHome}
            onLeave={handleLeaveCompetition}
          />
        );

      case 'quiz':
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
          return null;
        }

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !preferences) {
          return null;
        }

        const handleSoloQuestionSubmit = (answer: string) => {
          answerQuestion(currentQuestion.id, answer);
          if (currentQuestionIndex === questions.length - 1) {
            handleFinishQuiz();
          } else {
            nextQuestion();
          }
        };

        return (
           <div className="w-full px-0 py-8">
              <QuizQuestion
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                userAnswer={answers[currentQuestion.id]}
                onAnswer={(answer) => answerQuestion(currentQuestion.id, answer)}
                onPrevious={handlePrevious}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
                onFinish={handleFinishQuiz}
                language={preferences.language || 'en'}
                timeLimitEnabled={preferences.timeLimitEnabled || false}
                timeLimit={preferences.timeLimit}
                totalTimeLimit={preferences.totalTimeLimit}
                totalTimeRemaining={totalTimeRemaining}
                mode={preferences.mode || 'practice'}
                answerMode={preferences.mode === 'practice' ? 'immediate' : 'end'}
                onQuitQuiz={handleBackToModeSelector}
                totalTimeElapsed={totalTimeElapsed}
                showQuitButton={true}
                displayHeader={true}
                showPreviousButton={!(preferences.timeLimitEnabled && preferences.timeLimit)}
                onQuestionSubmit={handleSoloQuestionSubmit}
              />

          </div>
        );

      case 'results':
        if (!result) return null;

        return (
          <div className="w-full px-4">
            <QuizResults
              result={result}
              onNewQuiz={handleNewQuiz}
              onChangePreferences={handleChangePreferences}
            />
          </div>
        );
    }
  };

  // Main render for HomePage
  return (
    <div className="flex flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8 relative"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-blue-400/50 rounded-3xl blur-xl animate-pulse" />

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8"
              >
                <div className="w-3 h-3 bg-purple-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
                <div className="w-2 h-2 bg-blue-400 rounded-full absolute bottom-0 right-0" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full absolute top-1/2 left-0 transform -translate-y-1/2" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
          >
            Your AI-Powered <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Companion
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your learning experience with intelligent study tools.
            Get personalized guidance, instant feedback, and comprehensive analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              onClick={() => {
                if (isLoggedIn) {
                  // Scroll to the quiz content section
                  const quizContentSection = document.getElementById('quiz-content-section');
                  if (quizContentSection) {
                    quizContentSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // Fallback if section not found, just set step to mode-selector
                    setStep('mode-selector');
                  }
                } else {
                  navigate('/auth', { state: { from: location } });
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center text-white group-hover:text-white transition-colors duration-300">
                <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quiz Content Section - This is where the QuizPage content will now live */}
      <div id="quiz-content-section" className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {renderQuizContent()}
      </div>

      {/* Study Aids Section (Marketing Cards) */}
      <div id="study-tools" className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Powerful Study Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to excel in your studies, powered by advanced AI technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {studyAids.map((aid, index) => (
            <motion.div
              key={aid.path + aid.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -10,
                rotateY: 5,
                rotateX: 5
              }}
              onClick={() => {
                if (isLoggedIn) {
                  setStep(aid.state.mode); // Directly set the step
                  setSelectedMode(aid.state.mode.split('-')[0]); // Set selectedMode for back navigation
                  // Optionally scroll to the quiz content section if not already there
                  const quizContentSection = document.getElementById('quiz-content-section');
                  if (quizContentSection) {
                    quizContentSection.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/auth'); // Redirect to auth if not logged in
                }
              }}
              className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform bg-white border border-gray-100 shadow-xl ${aid.shadowColor} ${aid.hoverShadow} hover:shadow-2xl cursor-pointer`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Enhanced Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${aid.badgeColor} shadow-lg z-20 transform group-hover:scale-110 transition-transform duration-300`}>
                {aid.badge}
              </div>

              {/* Background Pattern */}
              <div className={`absolute inset-0 ${aid.pattern} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

               {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [null, '-20px', null],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

              <div className="relative z-10">
                <div className={`${aid.iconBg} p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                  <aid.icon className="h-8 w-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                  {aid.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {aid.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-gray-700 transition-all duration-300">
                    {aid.stats}
                  </span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center text-gray-400 group-hover:text-purple-600 transition-colors duration-300"
                  >
                    <span className="mr-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
            </motion.div>
          ))}
        </div>

        {/* Stats Section - Moved here after study aids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center group"
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

       {/* Features Section */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-purple-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">Why Choose QuizGenius?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of learning with our comprehensive suite of AI-powered tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden rounded-2xl p-8 bg-white shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-2xl group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`bg-gray-100 p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="text-sm font-semibold text-gray-500">{feature.stats}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by Students Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join millions of learners who have transformed their education with QuizGenius
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="flex items-center mb-6 relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-2xl mr-4 shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed relative z-10">"{testimonial.content}"</p>
              <div className="flex relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 sm:p-16 text-white relative overflow-hidden text-center"
        >
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Join thousands of students who are already experiencing the power of AI-assisted learning.
              Start your journey today and unlock your full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
 