import React, { useState, useCallback, useEffect } from 'react';
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
  ChevronDown, ChevronUp, Trash2, Edit2,
  FileQuestion, PenTool, RefreshCw, Plus,
  Sparkles, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

interface Question {
  id: number;
  text: string;
  marks: number;
  answer?: string;
  answerType: 'text' | 'file';
  file?: File;
}

const AnswerEvaluationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { apiKey } = useQuizStore();
  const [mode, setMode] = useState<'generate' | 'evaluate'>('generate');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerFiles, setAnswerFiles] = useState<Record<number, File>>({});
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call Gemini API to generate questions
      const prompt = `Generate 5 questions for evaluation with varying difficulty levels. For each question:
      1. Include clear question text
      2. Assign appropriate marks (1-10)
      3. Specify expected answer points
      4. Include evaluation criteria`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt, apiKey })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const generatedQuestions = data.questions.map((q: any, index: number) => ({
        id: index + 1,
        text: q.text,
        marks: q.marks,
        answerType: 'text'
      }));

      setQuestions(generatedQuestions);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFileUpload = (questionId: number, file: File) => {
    setAnswerFiles(prev => ({
      ...prev,
      [questionId]: file
    }));
  };

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Process each answered question
      const evaluations = await Promise.all(
        selectedQuestions.map(async (questionId) => {
          const question = questions.find(q => q.id === questionId);
          if (!question) return null;

          let answerText = answers[questionId] || '';

          // If it's a file answer, extract text
          if (answerFiles[questionId]) {
            // Extract text from file using appropriate method
            // This is a placeholder - implement actual file processing
            answerText = await extractTextFromFile(answerFiles[questionId]);
          }

          // Call Gemini API for evaluation
          const prompt = `Evaluate this answer based on the following criteria:

Question: ${question.text}
Maximum Marks: ${question.marks}

Student's Answer:
${answerText}

Provide a detailed evaluation including:
1. Score (out of ${question.marks})
2. Detailed feedback
3. Areas for improvement
4. Key points covered/missed
5. Specific suggestions for better answers`;

          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ prompt, apiKey })
          });

          if (!response.ok) {
            throw new Error('Failed to evaluate answer');
          }

          const data = await response.json();
          return {
            questionId,
            evaluation: data
          };
        })
      );

      setEvaluationResult(evaluations.filter(Boolean));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Answer Evaluation
          </h1>
          <p className="mt-2 text-gray-600">
            Generate questions or evaluate your answers with AI assistance
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          onClick={() => setMode('generate')}
          className={`p-8 rounded-xl border-2 transition-all duration-300 ${
            mode === 'generate' 
              ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          whileHover={{ scale: mode === 'generate' ? 1.02 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <FileQuestion className={`w-12 h-12 mx-auto mb-4 ${
            mode === 'generate' ? 'text-purple-600' : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-semibold text-center">Generate & Answer Questions</h3>
          <p className="text-sm text-gray-500 text-center mt-2">
            Get AI-generated questions and submit your answers for evaluation
          </p>
        </motion.button>

        <motion.button
          onClick={() => setMode('evaluate')}
          className={`p-8 rounded-xl border-2 transition-all duration-300 ${
            mode === 'evaluate' 
              ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          whileHover={{ scale: mode === 'evaluate' ? 1.02 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <PenTool className={`w-12 h-12 mx-auto mb-4 ${
            mode === 'evaluate' ? 'text-purple-600' : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-semibold text-center">Upload & Evaluate Answers</h3>
          <p className="text-sm text-gray-500 text-center mt-2">
            Upload your answers and get detailed evaluation and feedback
          </p>
        </motion.button>
      </div>

      {/* Generate & Answer Questions Mode */}
      {mode === 'generate' && (
        <div className="space-y-8">
          {questions.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Generate Questions?
                </h3>
                <Button
                  onClick={handleGenerateQuestions}
                  className="gradient-bg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardBody className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Question {question.id}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-900">{question.text}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedQuestions.includes(question.id)) {
                            setSelectedQuestions(prev => prev.filter(id => id !== question.id));
                          } else {
                            setSelectedQuestions(prev => [...prev, question.id]);
                          }
                        }}
                        className={selectedQuestions.includes(question.id) 
                          ? 'bg-purple-50 text-purple-700' 
                          : ''
                        }
                      >
                        {selectedQuestions.includes(question.id) ? 'Selected' : 'Select'}
                      </Button>
                    </div>

                    {selectedQuestions.includes(question.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant={question.answerType === 'text' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const updatedQuestions = questions.map(q =>
                                  q.id === question.id ? { ...q, answerType: 'text' } : q
                                );
                                setQuestions(updatedQuestions);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Text Answer
                            </Button>
                            <Button
                              variant={question.answerType === 'file' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const updatedQuestions = questions.map(q =>
                                  q.id === question.id ? { ...q, answerType: 'file' } : q
                                );
                                setQuestions(updatedQuestions);
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload File
                            </Button>
                          </div>

                          {question.answerType === 'text' ? (
                            <textarea
                              value={answers[question.id] || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                            />
                          ) : (
                            <div
                              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                dragActive
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                              }`}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragActive(true);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragActive(false);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragActive(false);
                                if (e.dataTransfer.files?.[0]) {
                                  handleFileUpload(question.id, e.dataTransfer.files[0]);
                                }
                              }}
                            >
                              <input
                                type="file"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(question.id, e.target.files[0]);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                              {answerFiles[question.id] ? (
                                <>
                                  <p className="text-sm font-medium text-gray-900">
                                    {answerFiles[question.id].name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Click or drag another file to replace
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-gray-900">
                                    Upload your answer file
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PDF, Word, or image files up to 10MB
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardBody>
                </Card>
              ))}

              {selectedQuestions.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleEvaluate}
                    className="gradient-bg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Evaluate Selected Answers
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload & Evaluate Mode */}
      {mode === 'evaluate' && (
        <Card>
          <CardBody className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  setFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              {file ? (
                <>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click or drag another file to replace
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    Upload your answer sheet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, or image files up to 10MB
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleEvaluate}
                className="gradient-bg"
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Evaluate Answers
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Evaluation Results */}
      {evaluationResult && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Evaluation Results</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {evaluationResult.map((result: any) => (
                <div key={result.questionId} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Question {result.questionId}</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      Score: {result.evaluation.score}/{questions.find(q => q.id === result.questionId)?.marks}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                      <p className="text-gray-600">{result.evaluation.feedback}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.evaluation.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-gray-600">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-1">Covered</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {result.evaluation.keyPoints.covered.map((point: string, index: number) => (
                              <li key={index} className="text-gray-600">{point}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-red-600 mb-1">Missed</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {result.evaluation.keyPoints.missed.map((point: string, index: number) => (
                              <li key={index} className="text-gray-600">{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AnswerEvaluationPage;