import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Upload, BookOpen, FileText, Plus, Search } from 'lucide-react';

const QuestionBankPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createQuestionBank, questionBanks, loadQuestionBanks, isLoading } = useStudyAidsStore();
  const [source, setSource] = useState<'manual' | 'pdf'>('manual');
  const [file, setFile] = useState<File | null>(null);
  
  const [preferences, setPreferences] = useState({
    course: '',
    topic: '',
    subtopic: '',
    difficulty: 'medium',
    language: 'English',
    questionTypes: ['multiple-choice']
  });

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'true-false', label: 'True/False' }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    await createQuestionBank(user.id, {
      ...preferences,
      source,
      file: source === 'pdf' ? formData : null
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Question Bank Generator</h1>
        <Button onClick={() => {}} className="gradient-bg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Bank Generator Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Generate Questions</h2>
            <p className="text-gray-600">Create a new question bank from text or PDF</p>
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

              <div className="space-y-4">
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
                    Topic
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-bg"
                >
                  {isLoading ? 'Generating...' : 'Generate Question Bank'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Question Banks List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Question Banks</h2>
            <div className="mt-4 relative">
              <Input
                type="text"
                placeholder="Search question banks..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              {questionBanks.map((bank: any) => (
                <div
                  key={bank.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-purple-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{bank.course}</h3>
                      <p className="text-sm text-gray-600">{bank.topic}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          {bank.difficulty}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {bank.language}
                        </span>
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default QuestionBankPage;