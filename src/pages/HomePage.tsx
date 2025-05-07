import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Brain, CheckCircle, LightbulbIcon, User } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  
  if (isLoggedIn) {
    return <Navigate to="/quiz" />;
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 text-purple-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Create AI-Powered Quizzes <br />
          <span className="text-purple-600">On Any Topic</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Generate personalized quizzes with Gemini AI. Learn, test your knowledge, and get detailed explanations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" onClick={() => window.location.href = '/auth'}>
            Get Started
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/auth'}>
            Learn More
          </Button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 text-purple-700 p-3 rounded-full w-fit mb-4">
            <LightbulbIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">AI-Generated Questions</h3>
          <p className="text-gray-600">
            Questions are created by Gemini AI, covering all aspects of your chosen topic from basic to advanced level.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-full w-fit mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Personalized Experience</h3>
          <p className="text-gray-600">
            Choose your topic, number of questions, question types, and language preferences for a customized quiz.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="bg-green-100 text-green-700 p-3 rounded-full w-fit mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Detailed Feedback</h3>
          <p className="text-gray-600">
            Get immediate scoring, see correct answers, and request detailed explanations for any question.
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-6xl mx-auto mb-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to test your knowledge?</h2>
            <p className="text-purple-100 mb-6 max-w-xl">
              Sign up now to create your first AI-powered quiz and start learning in a whole new way.
            </p>
            <Button
              onClick={() => window.location.href = '/auth'}
              className="bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800"
            >
              Create Your First Quiz
            </Button>
          </div>
          
          {/* Abstract shapes for background */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 rounded-l-full"></div>
          <div className="absolute left-20 bottom-0 h-24 w-24 bg-purple-400 opacity-20 rounded-full"></div>
          <div className="absolute right-40 top-10 h-16 w-16 bg-indigo-400 opacity-20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;