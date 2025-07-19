import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import {
  Brain, GraduationCap,
  FileQuestion, PenTool, BookOpen, Calendar,
  LineChart, Rocket, Target,
  Award, Users, Zap, CheckCircle, Star,
  TrendingUp, Shield, Globe, Sparkles,
  ArrowRight, Play, Trophy, Clock,
  Lightbulb, BarChart3, Activity,
  Layers, Cpu, Database, Code,
  Palette, Briefcase, Heart,
  Crown, Hash, Gamepad2, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card'; // Import Card components

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      // If logged in, scroll to the "Choose Your Quest" section
      const quizModesSection = document.getElementById('quiz-modes');
      if (quizModesSection) {
        quizModesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback if section not found
        navigate('/quiz');
      }
    } else {
      navigate('/auth', { state: { from: location } });
    }
  };

  // Quiz Modes data (copied from QuizModeSelector.tsx)
  const modes = [
    {
      id: 'solo',
      title: 'Solo Quiz',
      subtitle: 'Master your skills',
      description: 'Practice with AI-generated questions and get instant feedback',
      icon: Brain,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      features: ['Instant feedback', 'Progress tracking', 'Multiple formats'],
      stats: '10M+ questions solved',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'create-competition',
      title: 'Create Competition',
      subtitle: 'Challenge friends',
      description: 'Create custom competitions and invite friends to compete',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      features: ['Invite friends', 'Real-time leaderboard', 'Custom settings'],
      stats: '500K+ competitions',
      badge: 'Team Play',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'join-competition',
      title: 'Join Competition',
      subtitle: 'Enter with code',
      description: 'Join existing competitions using a 6-digit code',
      icon: Hash,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      features: ['Quick join', 'Global competition', 'Earn achievements'],
      stats: '2M+ players joined',
      badge: 'Quick Join',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'random-match',
      title: 'Random Match',
      subtitle: 'Find opponents',
      description: 'Get matched with players globally based on your skill level',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      features: ['Global matchmaking', 'Skill-based pairing', 'Quick games'],
      stats: '1M+ matches daily',
      badge: 'Global Play',
      badgeColor: 'bg-orange-500'
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

  const [hoveredMode, setHoveredMode] = React.useState<string | null>(null);

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
              onClick={handleGetStarted}
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

      {/* Quiz Mode Selector Section (Moved from QuizModeSelector.tsx) */}
      <div id="quiz-modes" className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
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
              className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-2xl"
            >
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl sm:rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Choose Your Quest
              </h1>
              <p className="text-lg sm:text-xl text-slate-600">Select your learning adventure</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 sm:mb-8 flex justify-center w-full"
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate('/competitions')}
                  variant="outline"
                  className="w-full h-12 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 text-sm font-semibold shadow-lg px-4 py-2 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Quiz Dashboard</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              className="group cursor-pointer"
              onClick={() => navigate('/quiz', { state: { mode: mode.id } })} // Navigate to /quiz with state
            >
              <Card className={`h-full overflow-hidden border-2 transition-all duration-500 transform ${
                hoveredMode === mode.id
                  ? `${mode.borderColor} shadow-2xl scale-[1.02] ring-4 ring-opacity-20`
                  : 'border-slate-200 shadow-lg hover:shadow-xl hover:scale-[1.01]'
              } bg-white/80 backdrop-blur-sm`}>
                {/* Gradient Header */}
                <div className={`h-1 sm:h-2 bg-gradient-to-r ${mode.gradient}`} />

                {/* Badge */}
                <div className="relative">
                  <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white ${mode.badgeColor} shadow-lg z-10`}>
                    {mode.badge}
                  </div>
                </div>

                <CardBody className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <motion.div
                        animate={hoveredMode === mode.id ? {
                          scale: 1.1,
                          rotate: 5,
                          y: -5
                        } : {
                          scale: 1,
                          rotate: 0,
                          y: 0
                        }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${mode.gradient} flex items-center justify-center shadow-xl relative flex-shrink-0`}
                      >
                        <mode.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-50 rounded-xl sm:rounded-2xl blur-xl animate-pulse`} />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                          {mode.title}
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-blue-600 mb-2">{mode.subtitle}</p>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{mode.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${mode.bgGradient} border ${mode.borderColor} mb-4 sm:mb-6 backdrop-blur-sm`}>
                      <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500" />
                        Key Features
                      </h4>
                      <div className="space-y-1 sm:space-y-2">
                        {mode.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center space-x-2"
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${mode.gradient} rounded-full flex-shrink-0 shadow-sm`} />
                            <span className="text-xs sm:text-sm text-slate-700 font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Stats and Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-semibold">{mode.stats}</span>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto"
                      >
                        <Button
                          className={`bg-gradient-to-r ${mode.gradient} hover:opacity-90 transition-all duration-300 shadow-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold relative overflow-hidden group w-full sm:w-auto`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <div className="relative flex items-center justify-center">
                            <Rocket className="w-4 h-4 mr-2" />
                            Start Now
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-50 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-tr from-green-100/50 to-teal-100/50 rounded-full blur-3xl opacity-50 translate-y-12 sm:translate-y-18 lg:translate-y-24 -translate-x-12 sm:-translate-x-18 lg:-translate-x-24" />

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-slate-800 mb-6 sm:mb-8 lg:mb-12 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Join the Learning Revolution
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
              {[
                { icon: Users, value: '5M+', label: 'Active Learners', gradient: 'from-blue-500 to-indigo-500' },
                { icon: Trophy, value: '1M+', label: 'Competitions', gradient: 'from-purple-500 to-pink-500' },
                { icon: Target, value: '50M+', label: 'Questions Solved', gradient: 'from-green-500 to-emerald-500' },
                { icon: Award, value: '95%', label: 'Success Rate', gradient: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="group"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      y: -5
                    }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 relative`}
                  >
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-50 rounded-xl sm:rounded-2xl blur-xl animate-pulse`} />
                  </motion.div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-slate-600 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
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

