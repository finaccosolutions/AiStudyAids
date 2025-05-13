import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
  Brain, ArrowRight, Sparkles, GraduationCap, 
  FileQuestion, PenTool, BookOpen, Calendar, 
  LineChart, MessageSquare 
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStartLearning = () => {
    if (isLoggedIn) {
      navigate('/quiz');
    } else {
      navigate('/auth', { state: { from: location } });
    }
  };

  const studyAids = [
    {
      title: 'AI Quiz Generator',
      description: 'Create personalized quizzes with instant feedback and explanations.',
      icon: Brain,
      path: '/quiz',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs.',
      icon: FileQuestion,
      path: '/question-bank',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers using AI.',
      icon: PenTool,
      path: '/answer-evaluation',
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries, mind maps, and study materials.',
      icon: BookOpen,
      path: '/notes',
      color: 'text-amber-600 bg-amber-100'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules based on your syllabus.',
      icon: Calendar,
      path: '/study-plan',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your learning progress and identify areas for improvement.',
      icon: LineChart,
      path: '/progress',
      color: 'text-rose-600 bg-rose-100'
    }
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-4xl mx-auto relative mb-16">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -top-10 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20" />
        
        <div className="flex justify-center mb-6 relative">
          <GraduationCap className="h-20 w-20 text-purple-600 animate-pulse" />
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl" />
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
          Your Personal <br />
          <span className="gradient-text">Study Assistant</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your learning experience with AI-powered study tools. 
          Get personalized quizzes, smart feedback, and organized study plans.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleStartLearning}
            className="group"
          >
            Start Learning Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {studyAids.map((aid) => (
          <button
            key={aid.path}
            onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
            className="feature-card text-left group cursor-pointer"
          >
            <div className={`${aid.color} p-3 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <aid.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors">
              {aid.title}
            </h3>
            <p className="text-gray-600">
              {aid.description}
            </p>
          </button>
        ))}
      </div>
      
      <div className="w-full max-w-6xl mx-auto mb-16">
        <div className="gradient-bg rounded-2xl shadow-xl p-8 sm:p-12 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Need help with your studies?</h2>
            <p className="text-purple-100 mb-6 max-w-xl">
              Chat with our AI tutor to get instant answers to your questions and personalized learning support.
            </p>
            <Button
              onClick={() => navigate(isLoggedIn ? '/chat' : '/auth')}
              className="bg-white text-purple-700 hover:bg-purple-50 group"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chatting
            </Button>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-3xl group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10  rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;