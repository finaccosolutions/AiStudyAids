import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { BookOpen, Crown, Hash, Users, Zap, Target, Brain, Trophy, Sparkles, ArrowRight, Star, Clock, Award, TrendingUp, Play, Gamepad2, Rocket, Shield, Globe, Bolt, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuizModeSelectorProps {
  onSelectMode: (mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => void;
  // Removed onShowCompetitionManagement prop as it's no longer needed here
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({ onSelectMode }) => { // Removed onShowCompetitionManagement from destructuring
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
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
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-2xl">
                <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-2xl sm:rounded-3xl blur-xl animate-pulse" />
              </div>
            </motion.div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Choose Your Quest
              </h1>
              <p className="text-lg sm:text-xl text-slate-600">Select your learning adventure</p>
            </div>
          </div>

          {/* Removed Competition Management & Competitions Buttons */}
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
                onClick={() => onSelectMode(mode.id as any)}
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
                          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${mode.gradient} flex items-center justify-center shadow-lg relative flex-shrink-0`}
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

        {/* Removed "Join the Learning Revolution" section */}
      </div>
    </div>
  );
};

export default QuizModeSelector; 