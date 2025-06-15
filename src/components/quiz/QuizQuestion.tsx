import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle, Volume2, VolumeX, BookOpen, Clock, Sparkles, Target, Zap, Star } from 'lucide-react';
import { speechService } from '../../services/speech';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluateTextAnswer } from '../../services/gemini';
import { useQuizStore } from '../../store/useQuizStore';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  onFinish: () => void;
  language: string;
  timeLimitEnabled: boolean;
  timeLimit?: string | null;
  totalTimeLimit?: string | null;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswer,
  onPrevious,
  onNext,
  isLastQuestion,
  onFinish,
  language,
  timeLimitEnabled,
  timeLimit,
  totalTimeLimit,
  mode,
  answerMode,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!timeLimitEnabled) return null;
    
    if (timeLimit) {
      return parseInt(timeLimit);
    }
    if (totalTimeLimit) {
      return parseInt(totalTimeLimit);
    }
    return null;
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerEvaluation, setAnswerEvaluation] = useState<{
    isCorrect: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { apiKey } = useQuizStore();

  useEffect(() => {
    setSelectedAnswer(userAnswer || '');
    setHasAnswered(!!userAnswer);
    
    if (question.type === 'multi-select') {
      setSelectedOptions(userAnswer ? userAnswer.split(',') : []);
    } else if (question.type === 'sequence') {
      setSequenceOrder(userAnswer ? userAnswer.split(',') : [...(question.sequence || [])]);
    }
    
    if (timeLimitEnabled && timeLimit && !totalTimeLimit) {
      setTimeLeft(parseInt(timeLimit));
    }
  }, [userAnswer, question.id, timeLimit, totalTimeLimit]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      if (timeLimit && !totalTimeLimit) {
        handleAnswerSubmit();
        handleNext();
      } else if (totalTimeLimit && !timeLimit) {
        handleFinish();
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const handleNext = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setHasAnswered(false);
    setAnswerEvaluation(null);
    onNext();
  };
  
  const handlePrevious = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setHasAnswered(false);
    setAnswerEvaluation(null);
    onPrevious();
  };
  
  const handleFinish = () => {
    onAnswer(selectedAnswer);
    onFinish();
  };
  
  const handleAnswerSubmit = async () => {
    setHasAnswered(true);
    
    if ((question.type === 'short-answer' || question.type === 'fill-blank') && 
        apiKey && selectedAnswer.trim()) {
      try {
        const evaluation = await evaluateTextAnswer(
          apiKey,
          question.text,
          selectedAnswer,
          question.correctAnswer || '',
          question.keywords || [],
          language
        );
        setAnswerEvaluation(evaluation);
      } catch (error) {
        console.error('Failed to evaluate answer:', error);
      }
    }
    
    if (mode === 'practice' || answerMode === 'immediate') {
      setShowExplanation(true);
    }
  };
  
  const playQuestionAudio = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(question.text, language);
      setIsSpeaking(true);
      
      const checkSpeakingInterval = setInterval(() => {
        if (!speechService.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingInterval);
        }
      }, 100);
    }
  };
  
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'basic': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  const isAnswerCorrect = () => {
    if (answerEvaluation) {
      return answerEvaluation.isCorrect;
    }
    
    if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
      return false;
    }
    return selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMultiSelectToggle = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(opt => opt !== option)
      : [...selectedOptions, option];
    
    setSelectedOptions(newSelection);
    setSelectedAnswer(newSelection.join(','));
  };

  const handleSequenceReorder = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...sequenceOrder];
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedItem);
    setSequenceOrder(newOrder);
    setSelectedAnswer(newOrder.join(','));
  };

  const moveSequenceItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < sequenceOrder.length) {
      handleSequenceReorder(index, newIndex);
    }
  };

  // Enhanced explanation formatting function
  const formatExplanation = (text: string) => {
    if (!text) return text;
    
    return text
      // Bold text: **text** or *text*
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Code blocks: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Numbered lists
      .replace(/^\d+\.\s/gm, '<span class="font-semibold text-purple-600">$&</span>')
      // Bullet points
      .replace(/^[-•]\s/gm, '<span class="text-purple-600">• </span>');
  };
  
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <motion.div 
            className="space-y-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                      : selectedAnswer === option
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                        : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === option
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                }`}
                onClick={() => !hasAnswered && setSelectedAnswer(option)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative p-6 flex items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                    selectedAnswer === option
                      ? 'border-purple-600 bg-purple-600 shadow-lg'
                      : 'border-gray-400 group-hover:border-purple-400'
                  }`}>
                    {selectedAnswer === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium text-lg group-hover:text-purple-700 transition-colors">
                    {option}
                  </span>
                  {hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer && (
                    <div className="ml-auto">
                      {option.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : selectedAnswer === option ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white font-bold">✕</span>
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      
      case 'true-false':
        return (
          <motion.div 
            className="flex space-x-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {['True', 'False'].map((option) => (
              <motion.button
                key={option}
                type="button"
                disabled={hasAnswered}
                className={`group relative flex-1 py-8 px-8 rounded-2xl font-bold text-xl transition-all duration-300 overflow-hidden ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-2xl scale-105'
                      : selectedAnswer === option
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl'
                        : 'bg-gray-100 text-gray-500'
                    : selectedAnswer === option
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl scale-105 ring-4 ring-purple-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 hover:shadow-xl hover:scale-102'
                }`}
                onClick={() => setSelectedAnswer(option)}
                whileHover={{ scale: selectedAnswer === option ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center">
                  {option}
                  {selectedAnswer === option && (
                    <motion.div
                      initial={{ scale: 0, x: 20 }}
                      animate={{ scale: 1, x: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="ml-3"
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        );

      case 'multi-select':
        return (
          <motion.div 
            className="space-y-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <p className="text-blue-800 font-medium flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Select all that apply:
              </p>
            </div>
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctOptions
                    ? question.correctOptions.includes(option)
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg'
                      : selectedOptions.includes(option)
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                        : 'border-gray-200 bg-gray-50'
                    : selectedOptions.includes(option)
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                }`}
                onClick={() => !hasAnswered && handleMultiSelectToggle(option)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative p-6 flex items-center">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                    selectedOptions.includes(option)
                      ? 'border-purple-600 bg-purple-600 shadow-lg'
                      : 'border-gray-400 group-hover:border-purple-400'
                  }`}>
                    {selectedOptions.includes(option) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium text-lg group-hover:text-purple-700 transition-colors">
                    {option}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'sequence':
        return (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Arrange the following items in the correct order:
              </p>
            </div>
            <div className="space-y-3">
              {sequenceOrder.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctSequence
                      ? question.correctSequence[index] === item
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg'
                        : 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                      : 'border-gray-200 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  <div className="relative p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span className="text-gray-800 font-medium text-lg">{item}</span>
                    </div>
                    {!hasAnswered && (
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => moveSequenceItem(index, 'up')}
                          disabled={index === 0}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ↑
                        </motion.button>
                        <motion.button
                          onClick={() => moveSequenceItem(index, 'down')}
                          disabled={index === sequenceOrder.length - 1}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ↓
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'case-study':
        return (
          <motion.div 
            className="mt-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-blue-900">Case Study</h4>
              </div>
              <div className="prose prose-blue max-w-none">
                <p className="text-blue-800 leading-relaxed text-lg">{question.caseStudy}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                {question.question}
              </h4>
              <div className="space-y-4">
                {question.options?.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                        ? option === question.correctAnswer
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                          : selectedAnswer === option
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        : selectedAnswer === option
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                    onClick={() => !hasAnswered && setSelectedAnswer(option)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="relative p-6 flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                        selectedAnswer === option
                          ? 'border-purple-600 bg-purple-600 shadow-lg'
                          : 'border-gray-400 group-hover:border-purple-400'
                      }`}>
                        {selectedAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium text-lg group-hover:text-purple-700 transition-colors">
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'situation':
        return (
          <motion.div 
            className="mt-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-amber-900">Situation</h4>
              </div>
              <div className="prose prose-amber max-w-none">
                <p className="text-amber-800 leading-relaxed text-lg">{question.situation}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 text-purple-500 mr-2" />
                {question.question}
              </h4>
              <div className="space-y-4">
                {question.options?.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                        ? option === question.correctAnswer
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                          : selectedAnswer === option
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        : selectedAnswer === option
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                    onClick={() => !hasAnswered && setSelectedAnswer(option)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="relative p-6 flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                        selectedAnswer === option
                          ? 'border-purple-600 bg-purple-600 shadow-lg'
                          : 'border-gray-400 group-hover:border-purple-400'
                      }`}>
                        {selectedAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium text-lg group-hover:text-purple-700 transition-colors">
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 'fill-blank':
      case 'short-answer':
        return (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={hasAnswered}
                isFullWidth
                className={`py-6 text-xl rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate'
                    ? answerEvaluation?.isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 bg-white'
                }`}
              />
              {!hasAnswered && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </motion.div>
              )}
            </div>
            {hasAnswered && answerEvaluation && mode === 'practice' && answerMode === 'immediate' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`mt-6 p-6 rounded-2xl border-2 shadow-lg ${
                  answerEvaluation.isCorrect 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}
              >
                <div className="flex items-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      answerEvaluation.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  >
                    {answerEvaluation.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold text-lg">✕</span>
                    )}
                  </motion.div>
                  <div>
                    <span className={`text-xl font-bold ${
                      answerEvaluation.isCorrect ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      Score: {answerEvaluation.score}%
                    </span>
                    <p className={`text-sm ${
                      answerEvaluation.isCorrect ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {answerEvaluation.isCorrect ? 'Excellent work!' : 'Keep practicing!'}
                    </p>
                  </div>
                </div>
                <div 
                  className={`text-lg leading-relaxed ${
                    answerEvaluation.isCorrect ? 'text-emerald-700' : 'text-red-700'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatExplanation(answerEvaluation.feedback) }}
                />
              </motion.div>
            )}
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full transform transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
        
        <CardBody className="space-y-6 p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <motion.div 
                className="text-lg font-bold text-gray-600 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                Question {questionNumber} of {totalQuestions}
              </motion.div>
              <motion.span 
                className={`text-sm font-bold capitalize px-4 py-2 rounded-full border-2 ${getDifficultyColor()}`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {question.difficulty}
              </motion.span>
              {timeLimitEnabled && timeLeft !== null && (
                <motion.div 
                  className={`flex items-center space-x-2 text-lg font-bold px-4 py-2 rounded-full ${
                    timeLeft <= 10 ? 'bg-red-100 text-red-600 border-2 border-red-300' : 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                  }`}
                  animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: timeLeft <= 10 ? Infinity : 0 }}
                >
                  <Clock className="w-5 h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  showExplanation 
                    ? 'bg-purple-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:scale-105'
                }`}
                aria-label="Show explanation"
                disabled={!hasAnswered || (mode === 'exam' && answerMode === 'end')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-6 h-6" />
              </motion.button>
              <motion.button
                type="button"
                onClick={playQuestionAudio}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isSpeaking 
                    ? 'bg-purple-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:scale-105'
                }`}
                aria-label={isSpeaking ? 'Stop speaking' : 'Speak question'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpeaking ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="py-6">
            <motion.h3 
              className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {question.text}
            </motion.h3>
            {renderQuestionContent()}
            
            <AnimatePresence>
              {showExplanation && question.explanation && hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mt-8 overflow-hidden"
                >
                  <div className={`p-8 rounded-2xl border-2 shadow-xl ${
                    answerEvaluation ? 
                      (answerEvaluation.isCorrect ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200') :
                      (isAnswerCorrect() ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200')
                  }`}>
                    <div className="flex items-center mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                          answerEvaluation ? 
                            (answerEvaluation.isCorrect ? 'bg-emerald-500' : 'bg-red-500') :
                            (isAnswerCorrect() ? 'bg-emerald-500' : 'bg-red-500')
                        }`}
                      >
                        {(answerEvaluation ? answerEvaluation.isCorrect : isAnswerCorrect()) ? (
                          <CheckCircle className="w-7 h-7 text-white" />
                        ) : (
                          <span className="text-white font-bold text-xl">✕</span>
                        )}
                      </motion.div>
                      <div>
                        <h4 className={`text-2xl font-bold ${
                          answerEvaluation ? 
                            (answerEvaluation.isCorrect ? 'text-emerald-800' : 'text-red-800') :
                            (isAnswerCorrect() ? 'text-emerald-800' : 'text-red-800')
                        }`}>
                          {answerEvaluation ? 
                            (answerEvaluation.isCorrect ? 'Correct!' : 'Needs Improvement') :
                            (isAnswerCorrect() ? 'Correct!' : 'Incorrect')
                          }
                        </h4>
                        <p className={`text-lg ${
                          answerEvaluation ? 
                            (answerEvaluation.isCorrect ? 'text-emerald-600' : 'text-red-600') :
                            (isAnswerCorrect() ? 'text-emerald-600' : 'text-red-600')
                        }`}>
                          {answerEvaluation ? 
                            (answerEvaluation.isCorrect ? 'Excellent work!' : 'Keep practicing!') :
                            (isAnswerCorrect() ? 'Well done!' : 'Review the explanation below')
                          }
                        </p>
                      </div>
                    </div>
                    <div 
                      className="text-gray-700 text-lg leading-relaxed prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatExplanation(question.explanation) }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </CardBody>
        
        <CardFooter className="flex justify-between bg-gradient-to-r from-gray-50 to-purple-50 border-t border-purple-100 p-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={questionNumber === 1}
              className="hover:bg-purple-50 transition-all duration-300 border-2 border-purple-200 text-purple-600 font-semibold px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
          </motion.div>
          
          {!hasAnswered ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer && question.type !== 'multi-select' && question.type !== 'sequence'}
                className="gradient-bg hover:opacity-90 transition-all duration-300 font-bold px-8 py-3 text-lg shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Submit Answer
              </Button>
            </motion.div>
          ) : (
            isLastQuestion ? (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="gradient-bg hover:opacity-90 transition-all duration-300 transform font-bold px-8 py-3 text-lg shadow-xl"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-2"
                  >
                    🎉
                  </motion.div>
                  Finish Quiz
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gradient-bg hover:opacity-90 transition-all duration-300 transform font-bold px-8 py-3 text-lg shadow-lg"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuizQuestion;