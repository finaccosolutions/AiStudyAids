import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Upload, BookOpen, FileText, Plus, Search, 
  CheckCircle2, AlertTriangle, Download, Eye,
  Clock, Calendar, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionBank {
  id: string;
  course: string;
  topic?: string;
  subtopic?: string;
  difficulty: string;
  language: string;
  questionTypes: string[];
  source: 'manual' | 'pdf';
  pdfUrl?: string;
  questions: any[];
  createdAt: string;
}

const QuestionBankPage: React.FC = () => {
  const { user } = useAuthStore();
  const { apiKey } = useQuizStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState<'manual' | 'pdf'>('manual');
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  
  const [preferences, setPreferences] = useState({
    course: '',
    topic: '',
    subtopic: '',
    difficulty: 'medium',
    language: 'English',
    questionTypes: ['multiple-choice'],
    questionCount: 10
  });

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in the Blank' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'matching', label: 'Matching' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' }
  ];

  useEffect(() => {
    if (user) {
      loadQuestionBanks();
    }
  }, [user]);

  const loadQuestionBanks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/question_banks?user_id=eq.${user?.id}`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      console.error('Error loading question banks:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !apiKey) return;

    setIsLoading(true);
    setError(null);

    try {
      let content = '';
      if (source === 'pdf' && file) {
        // First extract text from PDF using Vision API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('apiKey', apiKey);
        
        const visionResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vision`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: formData
        });

        if (!visionResponse.ok) {
          throw new Error('Failed to process PDF');
        }

        const visionData = await visionResponse.json();
        content = visionData.text;
      }

      // Generate questions using Gemini
      const prompt = `Generate ${preferences.questionCount} ${preferences.difficulty} difficulty questions about ${preferences.course}${preferences.topic ? ` - ${preferences.topic}` : ''}${preferences.subtopic ? ` (${preferences.subtopic})` : ''} in ${preferences.language}.

Question types to include: ${preferences.questionTypes.join(', ')}

${source === 'pdf' ? `Use this content as reference:\n${content}` : ''}

Format each question as a JSON object with:
- text: question text
- type: question type
- options: array of possible answers (for multiple choice)
- correctAnswer: the correct answer
- explanation: detailed explanation of the answer

Return the questions as a JSON array.`;

      const geminiResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ prompt, apiKey })
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to generate questions');
      }

      const questions = await geminiResponse.json();

      // Save to database
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/question_banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          course: preferences.course,
          topic: preferences.topic,
          subtopic: preferences.subtopic,
          difficulty: preferences.difficulty,
          language: preferences.language,
          question_types: preferences.questionTypes,
          source,
          pdf_url: source === 'pdf' && file ? URL.createObjectURL(file) : null,
          questions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save question bank');
      }

      await loadQuestionBanks();
      setShowForm(false);
      setFile(null);
      setPreferences({
        course: '',
        topic: '',
        subtopic: '',
        difficulty: 'medium',
        language: 'English',
        questionTypes: ['multiple-choice'],
        questionCount: 10
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBanks = questionBanks.filter(bank => 
    bank.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.subtopic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank Generator</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your question banks powered by AI
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="gradient-bg hover:opacity-90 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Bank
        </Button>
      </div>

      {showForm ? (
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-semibold">Generate Questions</h2>
            <p className="text-gray-600">
              Create a new question bank from text or PDF
            </p>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSource('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    source === 'manual' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Manual Input</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSource('pdf')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    source === 'pdf' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Upload PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={preferences.course}
                    onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={preferences.topic}
                    onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-topic (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Binary Trees"
                    value={preferences.subtopic}
                    onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={preferences.questionCount}
                    onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <Select
                    options={difficultyOptions}
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <Select
                    options={languageOptions}
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {questionTypeOptions.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        preferences.questionTypes.includes(type.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preferences.questionTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...preferences.questionTypes, type.value]
                            : preferences.questionTypes.filter(t => t !== type.value);
                          setPreferences({ ...preferences, questionTypes: newTypes });
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {source === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload PDF
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !preferences.course || preferences.questionTypes.length === 0}
                  className="gradient-bg"
                >
                  {isLoading ? 'Generating...' : 'Generate Questions'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search question banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanks.map((bank) => (
              <motion.div
                key={bank.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">{bank.course}</h3>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      bank.difficulty === 'easy' 
                        ? 'bg-green-100 text-green-800'
                        : bank.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bank.difficulty}
                    </span>
                  </div>

                  {bank.topic && (
                    <p className="text-sm text-gray-600 mb-2">{bank.topic}</p>
                  )}
                  {bank.subtopic && (
                    <p className="text-sm text-gray-500 mb-2">{bank.subtopic}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {bank.questionTypes.map((type) => (
                      <span
                        key={type}
                        className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(bank.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {bank.questions.length} questions
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBank(bank)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Download logic
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredBanks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No question banks found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first question bank to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedBank.course}
                  </h2>
                  {selectedBank.topic && (
                    <p className="text-gray-600">{selectedBank.topic}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBank(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {selectedBank.questions.map((question, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="font-medium text-gray-900 mb-4">
                      {index + 1}. {question.text}
                    </p>

                    {question.options && (
                      <div className="space-y-2 mb-4">
                        {question.options.map((option: string, i: number) => (
                          <div
                            key={i}
                            className={`p-2 rounded ${
                              option === question.correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {option}
                            {option === question.correctAnswer && (
                              <CheckCircle2 className="inline-block w-4 h-4 ml-2 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-900">
                        <span className="font-medium">Explanation: </span>
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;