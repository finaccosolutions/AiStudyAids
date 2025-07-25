// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import {
  ChevronDown, LogOut, User, BookOpen,
  Home, Settings, GraduationCap, FileQuestion,
  PenTool, NotebookText, Calendar, LineChart,
  Brain, Menu, Key, Trophy, Rocket, Lightbulb // Added Lightbulb icon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // New state for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    // Function to check if the screen is mobile
    const checkIsMobile = () => {
      // Tailwind's 'md' breakpoint is typically 768px
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial mobile state
    checkIsMobile();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', checkIsMobile); // Listen for resize events

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', checkIsMobile); // Clean up event listener
    };
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

  // Define all menu items. The conditional rendering will happen in the map.
  const allProfileMenuItems = [
    { path: '/profile', icon: User, label: 'My Profile' },
    { path: '/api-settings', icon: Key, label: 'API Settings' },
    { path: '/competitions', icon: Rocket, label: 'Quiz Dashboard' },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-purple-600 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl transition-all duration-300 group-hover:blur-2xl" />
            </div>
            <span className="text-xl font-bold text-purple-600">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ai
              </span>{' '}
              Study Aids
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6"> {/* This nav is hidden on mobile */}
            {isLoggedIn && (
              <>
                <Link
                  to="/"
                  className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 text-gray-700 hover:text-purple-700 hover:bg-purple-50 ${
                    isActive('/')
                      ? 'text-purple-700 bg-purple-50 font-semibold'
                      : ''
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                {/* Quiz Dashboard link for desktop view */}
                <Link
                  to="/competitions"
                  className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 text-gray-700 hover:text-purple-700 hover:bg-purple-50 ${
                    isActive('/competitions')
                      ? 'text-purple-700 bg-purple-50 font-semibold'
                      : ''
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>Quiz Dashboard</span>
                </Link>
              </>
            )}
          </nav>

          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-purple-100 group transition-all duration-300 text-gray-700"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {isLoggedIn && user?.profile && (
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {user.profile.fullName}
                </span>
              )}
              <User className="h-5 w-5 group-hover:scale-110 transition-transform text-gray-700" />
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} group-hover:text-purple-600 text-gray-700`} />
            </Button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border border-purple-100"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-purple-100">
                        <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      </div>

                      {allProfileMenuItems.map((item) => {
                        // Conditionally render Quiz Dashboard only on mobile
                        if (item.path === '/competitions' && !isMobile) {
                          return null;
                        }
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}

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
