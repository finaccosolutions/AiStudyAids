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
  ChevronDown, ChevronUp, Sparkles, Plus,
  FileQuestion, PenTool, RefreshCw, X, Image as ImageIcon, Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';



interface Question {
  id: string;
  text: string;
  type: string;
  marks: number;
  answer?: string;
  imageAnswer?: File | null;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

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
  const [mode, setMode] = useState<'generate' | 'evaluate'>('generate');
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResult | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [evaluationMode, setEvaluationMode] = useState<'text' | 'upload'>('text');
  const [evaluationQuestions, setEvaluationQuestions] = useState<Question[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Quill modules for rich text editor
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['clean']
    ],
  };

  useEffect(() => {
    const loadApiKey = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('gemini_api_key')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setApiKey(data.gemini_api_key);
      } catch (error) {
        console.error('Error loading API key:', error);
        setError('Failed to load API key. Please check your API settings.');
      }
    };

    loadApiKey();
  }, [user]);

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject,
          topic,
          questionCount,
          difficulty,
          questionType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format');
      }

      const questionsWithMarks = data.questions.map((q: any, index: number) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
        marks: questionType === 'multiple-choice' ? 1 : 
               questionType === 'true-false' ? 1 : 
               questionType === 'short-answer' ? 3 : 2,
        answer: '',
        imageAnswer: null
      }));

      setGeneratedQuestions(questionsWithMarks);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setGeneratedQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, answer } : q
      )
    );
  };

  const handleImageAnswerChange = (questionId: string, file: File | null) => {
    setGeneratedQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, imageAnswer: file } : q
      )
    );
  };

  const handleEvaluateAnswers = async () => {
    if (!user) return;
    setError(null);

    try {
      const evaluationData = {
        questions: generatedQuestions.map(q => ({
          question: q.text,
          answer: q.answer,
          type: q.type,
          marks: q.marks
        })),
        subject,
        topic
      };

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setEvaluationResults([result, ...evaluationResults]);
      setGeneratedQuestions([]);
    } catch (error) {
      console.error('Error evaluating answers:', error);
      setError('Failed to evaluate answers. Please try again.');
    }
  };

  const handleUploadEvaluate = async (file: File) => {
    if (!user) return;
    setError(null);

    try {
      const answerSheetPath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('evaluations')
        .upload(`answer-sheets/${answerSheetPath}`, file);

      if (uploadError) throw uploadError;

      const formData = new FormData();
      formData.append('answerSheetPath', answerSheetPath);
      await createEvaluation(user.id, formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addManualQuestion = () => {
    setEvaluationQuestions(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        text: '',
        type: 'short-answer',
        marks: 1,
        answer: ''
      }
    ]);
  };

  const updateManualQuestion = (id: string, field: string, value: string | number) => {
    setEvaluationQuestions(prev => 
      prev.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const removeManualQuestion = (id: string) => {
    setEvaluationQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadEvaluate(e.dataTransfer.files[0]);
    }
  };

  if (!apiKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              Please set up your Gemini API key in the API Settings page before generating questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Answer Sheet Evaluation
          </h1>
          <p className="mt-2 text-gray-600">
            Generate questions or evaluate answers with detailed AI feedback
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            mode === 'generate' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          onClick={() => setMode('generate')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <FileQuestion className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Questions</h3>
            <p className="text-sm text-gray-600">
              Create custom questions for your students with AI
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            mode === 'evaluate' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          onClick={() => setMode('evaluate')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <PenTool className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluate Answers</h3>
            <p className="text-sm text-gray-600">
              Get detailed feedback on student answers with AI analysis
            </p>
          </div>
        </motion.div>
      </div>

      {mode === 'generate' ? (
        <div className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <FileQuestion className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Generate Questions</h2>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleGenerateQuestions} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Mathematics"
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
                      placeholder="e.g., Algebra"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <Select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <Select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    options={[
                      { value: 'multiple-choice', label: 'Multiple Choice' },
                      { value: 'true-false', label: 'True/False' },
                      { value: 'short-answer', label: 'Short Answer' },
                      { value: 'fill-blank', label: 'Fill in the Blank' }
                    ]}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-bg"
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
              </form>
            </CardBody>
          </Card>

          {generatedQuestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Generated Questions</h2>
                <Button
                  onClick={() => setGeneratedQuestions([])}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-5 h-5 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">
                          Question {index + 1} <span className="text-sm text-gray-500">({question.marks} marks)</span>
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.text }} />
                        
                        {question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, i) => (
                              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                {option}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Your Answer
                            </label>
                            <ReactQuill
                              value={question.answer || ''}
                              onChange={(value) => handleAnswerChange(question.id, value)}
                              modules={quillModules}
                              theme="snow"
                              placeholder="Type your answer here..."
                              className="bg-white rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Or Upload Image/PDF Answer
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                                <Upload className="w-5 h-5" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleImageAnswerChange(question.id, e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>
                              {question.imageAnswer && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FileText className="w-4 h-4" />
                                  <span>{question.imageAnswer.name}</span>
                                  <button 
                                    onClick={() => handleImageAnswerChange(question.id, null)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleEvaluateAnswers}
                disabled={isLoading}
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
                    Evaluate Answers
                  </>
                )}
              </Button>
            </div>
          )}

          {(evaluationResults.length > 0 || evaluations.length > 0) && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
              
              {[...evaluationResults, ...evaluations].map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <BarChart className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-semibold">
                          Evaluation Results - {new Date(evaluation.evaluated_at || Date.now()).toLocaleDateString()}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        evaluation.score >= 70
                          ? 'bg-green-100 text-green-700'
                          : evaluation.score >= 40
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Score: {evaluation.score}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Overall Feedback</h4>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: evaluation.feedback }} />
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                        <ul className="space-y-2">
                          {evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="mt-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              </div>
                              <span className="text-gray-700">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Detailed Question Analysis</h4>
                        <div className="space-y-4">
                          {evaluation.answerAnalysis.map((analysis, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">Question {analysis.questionNumber}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  analysis.score >= 70
                                    ? 'bg-green-100 text-green-700'
                                    : analysis.score >= 40
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {analysis.score}% marks
                                </span>
                              </div>
                              <div className="prose max-w-none text-sm mb-3" dangerouslySetInnerHTML={{ __html: analysis.feedback }} />
                              
                              {analysis.mistakes.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="text-sm font-medium text-red-600 mb-1">Mistakes:</h6>
                                  <ul className="space-y-1 text-sm text-gray-700">
                                    {analysis.mistakes.map((mistake, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                                        <span>{mistake}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {analysis.suggestions.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-green-600 mb-1">Suggestions:</h6>
                                  <ul className="space-y-1 text-sm text-gray-700">
                                    {analysis.suggestions.map((suggestion, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
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
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <PenTool className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Evaluate Answers</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer ${
                      evaluationMode === 'text' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={() => setEvaluationMode('text')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <TypeIcon className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className="font-medium">Text Input</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Enter questions and answers manually
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer ${
                      evaluationMode === 'upload' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={() => setEvaluationMode('upload')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Upload className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className="font-medium">File Upload</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload PDF or image of answer sheets
                      </p>
                    </div>
                  </motion.div>
                </div>

                {evaluationMode === 'text' ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {evaluationQuestions.map((question, index) => (
                        <Card key={question.id}>
                          <CardHeader className="bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Question {index + 1}</h3>
                              <button 
                                onClick={() => removeManualQuestion(question.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </CardHeader>
                          <CardBody>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Text
                                </label>
                                <ReactQuill
                                  value={question.text}
                                  onChange={(value) => updateManualQuestion(question.id, 'text', value)}
                                  modules={quillModules}
                                  theme="snow"
                                  placeholder="Enter the question..."
                                  className="bg-white rounded-lg"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Type
                                  </label>
                                  <Select
                                    value={question.type}
                                    onChange={(e) => updateManualQuestion(question.id, 'type', e.target.value)}
                                    options={[
                                      { value: 'short-answer', label: 'Short Answer' },
                                      { value: 'long-answer', label: 'Long Answer' },
                                      { value: 'multiple-choice', label: 'Multiple Choice' },
                                      { value: 'true-false', label: 'True/False' }
                                    ]}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marks
                                  </label>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={question.marks}
                                    onChange={(e) => updateManualQuestion(question.id, 'marks', parseInt(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Student Answer
                                </label>
                                <ReactQuill
                                  value={question.answer || ''}
                                  onChange={(value) => updateManualQuestion(question.id, 'answer', value)}
                                  modules={quillModules}
                                  theme="snow"
                                  placeholder="Enter student's answer..."
                                  className="bg-white rounded-lg"
                                />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}

                      <Button
                        onClick={addManualQuestion}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Another Question
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        setGeneratedQuestions(evaluationQuestions);
                        setMode('generate');
                      }}
                      className="w-full gradient-bg"
                      disabled={evaluationQuestions.length === 0}
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Evaluate Answers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUploadEvaluate(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          Upload Answer Sheet (PDF or Image)
                        </p>
                        <p className="text-xs text-gray-500">
                          Drag and drop your file here, or click to browse
                        </p>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      <p>OR</p>
                    </div>

                    <Button
                      onClick={() => setEvaluationMode('text')}
                      variant="outline"
                      className="w-full"
                    >
                      <TypeIcon className="w-5 h-5 mr-2" />
                      Enter Questions & Answers Manually
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {evaluations.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Previous Evaluations</h2>
              
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <BarChart className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-semibold">
                          Evaluation - {new Date(evaluation.evaluated_at).toLocaleDateString()}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        evaluation.score >= 70
                          ? 'bg-green-100 text-green-700'
                          : evaluation.score >= 40
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Score: {evaluation.score}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Overall Feedback</h4>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: evaluation.feedback }} />
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                        <ul className="space-y-2">
                          {evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="mt-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              </div>
                              <span className="text-gray-700">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Detailed Question Analysis</h4>
                        <div className="space-y-4">
                          {evaluation.answerAnalysis.map((analysis, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">Question {analysis.questionNumber}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  analysis.score >= 70
                                    ? 'bg-green-100 text-green-700'
                                    : analysis.score >= 40
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {analysis.score}% marks
                                </span>
                              </div>
                              <div className="prose max-w-none text-sm mb-3" dangerouslySetInnerHTML={{ __html: analysis.feedback }} />
                              
                              {analysis.mistakes.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="text-sm font-medium text-red-600 mb-1">Mistakes:</h6>
                                  <ul className="space-y-1 text-sm text-gray-700">
                                    {analysis.mistakes.map((mistake, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                                        <span>{mistake}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {analysis.suggestions.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-green-600 mb-1">Suggestions:</h6>
                                  <ul className="space-y-1 text-sm text-gray-700">
                                    {analysis.suggestions.map((suggestion, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
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
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerEvaluationPage;