import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { 
  Brain, ChevronDown, LogOut, User, BookOpen, 
  Home, Settings, GraduationCap, FileQuestion, 
  PenTool, NotebookText, Calendar, LineChart, 
  MessageSquare 
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleSignUp = () => {
    setShowDropdown(false);
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    setShowDropdown(false);
    navigate('/auth?mode=signin');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/question-bank', icon: FileQuestion, label: 'Question Bank' },
    { path: '/answer-evaluation', icon: PenTool, label: 'Answer Evaluation' },
    { path: '/notes', icon: NotebookText, label: 'Smart Notes' },
    { path: '/study-plan', icon: Calendar, label: 'Study Planner' },
    { path: '/progress', icon: LineChart, label: 'Progress' },
    { path: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  ];
  
  return (
    <header className="bg-gradient-to-r from-purple-100 to-indigo-100 sticky top-0 z-50 border-b border-purple-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-purple-600 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl transition-all duration-300 group-hover:blur-2xl" />
            </div>
            <span className="text-xl font-bold gradient-text">
              QuizGenius
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {isLoggedIn && navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 ${
                  isActive(item.path) 
                    ? 'text-purple-700 bg-purple-50' 
                    : 'hover:text-purple-700 hover:bg-purple-50/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-purple-100 group transition-all duration-300"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} group-hover:text-purple-600`} />
            </Button>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-purple-100"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-purple-100">
                        <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      </div>
                      <Link
                        to="/api-settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Settings className="inline-block w-4 h-4 mr-2" />
                        API Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 transition-all duration-300"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={handleSignUp}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;