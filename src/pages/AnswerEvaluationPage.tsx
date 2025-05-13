import React, { useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, 
  BarChart, Download, Eye, Clock, Brain, 
  Loader2, BookOpen, GraduationCap, Target,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvaluationResult {
  id: string;
  score: number;
  feedback: string;
  improvements: string[];
  answerAnalysis: {
    questionNumber: number;
    score: number;
    feedback: string;
    mistakes: string[];
    suggestions: string[];
  }[];
}

const AnswerEvaluationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createEvaluation, evaluations, isLoading } = useStudyAidsStore();
  const [file, setFile] = useState<File | null>(null);
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [evaluationMode, setEvaluationMode] = useState<'upload' | 'generate'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResult | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'answer' | 'question') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'answer') {
        setFile(e.dataTransfer.files[0]);
      } else {
        setQuestionPaper(e.dataTransfer.files[0]);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || (evaluationMode === 'upload' && !questionPaper)) return;

    const formData = new FormData();
    formData.append('answerSheet', file);
    if (questionPaper) {
      formData.append('questionPaper', questionPaper);
    }
    formData.append('subject', subject);
    formData.append('topic', topic);

    await createEvaluation(user.id, formData);
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Answer Sheet Evaluation
          </h1>
          <p className="mt-2 text-gray-600">
            Get detailed feedback and analysis on your answers using AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Start Evaluation</h2>
              </div>
            </CardHeader>
            
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Data Structures"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setEvaluationMode('upload')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      evaluationMode === 'upload' 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                    whileHover={{ scale: evaluationMode === 'upload' ? 1.02 : 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                      evaluationMode === 'upload' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <span className="block text-sm font-medium">Upload Question Paper</span>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload an existing question paper
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setEvaluationMode('generate')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      evaluationMode === 'generate' 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                    whileHover={{ scale: evaluationMode === 'generate' ? 1.02 : 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                      evaluationMode === 'generate' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <span className="block text-sm font-medium">Generate Question Paper</span>
                    <p className="text-xs text-gray-500 mt-2">
                      Let AI generate a question paper
                    </p>
                  </motion.button>
                </div>

                {evaluationMode === 'upload' && (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
                    onDragEnter={(e) => handleDrag(e)}
                    onDragLeave={(e) => handleDrag(e)}
                    onDragOver={(e) => handleDrag(e)}
                    onDrop={(e) => handleDrop(e, 'question')}
                  >
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setQuestionPaper(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-4">
                      <Upload className={`w-12 h-12 mx-auto ${
                        questionPaper ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      {questionPaper ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">{questionPaper.name}</p>
                          <p className="text-xs text-gray-500">
                            Click or drag another file to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            Drop your question paper here or click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF or image files up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                  }`}
                  onDragEnter={(e) => handleDrag(e)}
                  onDragLeave={(e) => handleDrag(e)}
                  onDragOver={(e) => handleDrag(e)}
                  onDrop={(e) => handleDrop(e, 'answer')}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <Upload className={`w-12 h-12 mx-auto ${
                      file ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    {file ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          Click or drag another file to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          Drop your answer sheet here or click to upload
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF or image files up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !file || (evaluationMode === 'upload' && !questionPaper)}
                  className="w-full gradient-bg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Start Evaluation
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Evaluations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <BarChart className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Recent Evaluations</h2>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {evaluations.map((evaluation: any) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            evaluation.score >= 70
                              ? 'bg-green-100 text-green-600'
                              : evaluation.score >= 40
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {evaluation.subject} - {evaluation.topic}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(evaluation.evaluated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                            evaluation.score >= 70
                              ? 'bg-green-100 text-green-700'
                              : evaluation.score >= 40
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            Score: {evaluation.score}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {evaluation.improvements.slice(0, 3).map((improvement: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700"
                          >
                            {improvement}
                          </span>
                        ))}
                        {evaluation.improvements.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            +{evaluation.improvements.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDetails(evaluation.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          {showDetails[evaluation.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Details
                            </>
                          )}
                        </Button>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showDetails[evaluation.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Detailed Feedback</h4>
                                <p className="text-gray-700">{evaluation.feedback}</p>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                                <ul className="space-y-2">
                                  {evaluation.improvements.map((improvement: string, index: number) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <div className="mt-1">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                      </div>
                                      <span className="text-gray-700">{improvement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {evaluation.answerAnalysis && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Question-wise Analysis</h4>
                                  <div className="space-y-3">
                                    {evaluation.answerAnalysis.map((analysis: any, index: number) => (
                                      <div
                                        key={index}
                                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium">Question {analysis.questionNumber}</span>
                                          <span className={`text-sm px-2 py-1 rounded-full ${
                                            analysis.score >= 70
                                              ? 'bg-green-100 text-green-700'
                                              : analysis.score >= 40
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                            {analysis.score}%
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{analysis.feedback}</p>
                                        {analysis.suggestions.length > 0 && (
                                          <div className="text-sm">
                                            <span className="font-medium text-purple-600">Suggestions:</span>
                                            <ul className="mt-1 space-y-1">
                                              {analysis.suggestions.map((suggestion: string, i: number) => (
                                                <li key={i} className="flex items-center space-x-2">
                                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                  <span>{suggestion}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}

                {evaluations.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Evaluations Yet
                    </h3>
                    <p className="text-gray-600">
                      Upload an answer sheet to get detailed feedback and analysis
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnswerEvaluationPage;