import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Upload, FileText, CheckCircle, AlertTriangle, 
  BarChart, Download, Eye, Clock 
} from 'lucide-react';

const AnswerEvaluationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createEvaluation, evaluations, isLoading } = useStudyAidsStore();
  const [file, setFile] = useState<File | null>(null);
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [evaluationMode, setEvaluationMode] = useState<'upload' | 'generate'>('upload');

  const handleAnswerSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleQuestionPaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionPaper(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !questionPaper) return;

    const formData = new FormData();
    formData.append('answerSheet', file);
    formData.append('questionPaper', questionPaper);

    await createEvaluation(user.id, formData);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Answer Sheet Evaluation</h1>
          <p className="mt-2 text-gray-600">
            Upload your handwritten answers and get detailed feedback
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Upload Answer Sheet</h2>
            <p className="text-gray-600">
              Upload your handwritten answer sheet (PDF or image) and question paper
            </p>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setEvaluationMode('upload')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    evaluationMode === 'upload' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Upload Question Paper</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluationMode('generate')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    evaluationMode === 'generate' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Generate Question Paper</span>
                </button>
              </div>

              {evaluationMode === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Paper
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                          <span>Upload question paper</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleQuestionPaperUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF or image up to 10MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject/Course
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
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
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                  >
                    Generate Question Paper
                  </Button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer Sheet
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                        <span>Upload answer sheet</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleAnswerSheetUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF or image up to 10MB</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !file || !questionPaper}
                className="w-full gradient-bg"
              >
                {isLoading ? 'Evaluating...' : 'Start Evaluation'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Evaluations List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Evaluations</h2>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              {evaluations.map((evaluation: any) => (
                <div
                  key={evaluation.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          Evaluation #{evaluation.id.slice(0, 8)}
                        </h3>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          evaluation.score >= 70
                            ? 'bg-green-100 text-green-700'
                            : evaluation.score >= 40
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          Score: {evaluation.score}%
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(evaluation.evaluated_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <BarChart className="w-4 h-4 mr-1" />
                          {evaluation.improvements.length} improvements
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {evaluation.improvements.map((improvement: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                          >
                            {improvement}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
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

export default AnswerEvaluationPage;