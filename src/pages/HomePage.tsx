// src/pages/HomePage.tsx
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
  Palette, Briefcase, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
      if (isLoggedIn) {
        // Directly navigate to the quiz page
        navigate('/quiz');
      } else {
        navigate('/auth', { state: { from: location } });
      }
    };

  const studyAids = [
    {
      title: 'AI Quiz',
      description: 'Generate personalized quizzes with intelligent question generation and adaptive difficulty. Dive deep into any subject, get instant feedback, and track your progress to master new concepts efficiently.',
      icon: Brain,
      path: '/quiz',
      // START MODIFICATION
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      hoverGradient: 'hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700',
      shadowColor: 'shadow-violet-500/25',
      hoverShadow: 'hover:shadow-violet-500/40',
      pattern: 'bg-gradient-to-br from-violet-100/50 to-purple-100/30',
      iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
      detailedDescription: 'Our AI Quiz adapts to your learning style, providing questions tailored to your strengths and weaknesses. Experience dynamic difficulty adjustments, comprehensive explanations for every answer, and detailed performance analytics to guide your study journey. Perfect for exam preparation, quick knowledge checks, or deep dives into complex topics.',
      keyBenefits: [
        'Personalized quizzes on any topic',
        'Adaptive difficulty for optimal challenge',
        'Instant, detailed feedback and explanations',
        'Multiple question formats (MCQ, True/False, Fill-in-blank, etc.)',
        'Track progress and identify areas for improvement',
        'Supports various languages for diverse learners'
      ]
      // END MODIFICATION
    },
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

  // Removed the 'stats' array as it's no longer needed

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

      {/* Study Aids Section */}
      <div id="study-tools" className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered Study Tool
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The ultimate tool to excel in your studies, powered by advanced AI technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto"> {/* Adjusted max-w to 5xl for a wider tile */}
          {studyAids.map((aid, index) => (
            <motion.div
              key={aid.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.01, // Slightly reduced scale on hover for a larger tile
                y: -3, // Slightly reduced y-axis movement
                rotateY: 1, // Reduced rotation
                rotateX: 1
              }}
              onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
              className={`group relative overflow-hidden rounded-3xl p-8 sm:p-10 lg:p-12 transition-all duration-500 transform bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg hover:shadow-2xl cursor-pointer shadow-inner`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Background Watermark Shapes */}
              <motion.div
                className="absolute -top-10 -left-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply blur-3xl opacity-25 group-hover:opacity-0 transition-opacity duration-500"
                initial={{ x: -20, y: -20 }}
                animate={{ x: 0, y: 0, rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
              />
              <motion.div
                className="absolute top-20 -right-20 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 group-hover:opacity-0 transition-opacity duration-500"
                initial={{ x: 20, y: 20 }}
                animate={{ x: 0, y: 0, rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 0.5, repeatType: "loop" }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-20 group-hover:opacity-0 transition-opacity duration-500"
                initial={{ x: -10, y: 10 }}
                animate={{ x: 0, y: 0, rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1, repeatType: "loop" }}
              />
              <motion.div
                className="absolute -bottom-10 -right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply blur-3xl opacity-15 group-hover:opacity-0 transition-opacity duration-500"
                initial={{ x: 10, y: -10 }}
                animate={{ x: 0, y: 0, rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 1.5, repeatType: "loop" }}
              />

              {/* Background Pattern */}
              <div className={`absolute inset-0 ${aid.pattern} opacity-20 group-hover:opacity-50 transition-opacity duration-500`} />

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

              {/* NEW: Content Arrangement */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-1"> {/* This div will push the action button to the bottom */}
                  {/* Icon and Title Section */}
                  <div className="mb-6">
                    <div className={`${aid.iconBg} p-4 rounded-2xl w-fit mb-4 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-lg relative overflow-hidden`}>
                      <aid.icon className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                      {aid.title}
                    </h3>
                  </div>

                  {/* Description Hierarchy */}
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg sm:text-xl">
                    {aid.description}
                  </p>

                  <p className="text-gray-600 pt-4 mt-4 border-t border-gray-200 leading-relaxed text-base sm:text-lg">
                    {aid.detailedDescription}
                  </p>

                  {/* Enhanced Key Benefits Section */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-6">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                      Key Benefits
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aid.keyBenefits?.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-2"
                        >
                          <span className="text-purple-500 flex-shrink-0 mt-1">
                            <Zap className="w-5 h-5" />
                          </span>
                          <span className="text-gray-700 text-base flex-1">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button at the bottom */}
                <div className="relative z-10 mt-8 flex justify-end">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors duration-300"
                  >
                    <span className="mr-2 text-lg font-medium">
                      Start Your AI Quiz
                    </span>
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
            </motion.div>
          ))}
        </div>

        {/* Removed the general stats section */}
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