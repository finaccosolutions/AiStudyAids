import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, BookOpen } from 'lucide-react';

const StudyPlannerPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState(null);

  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        setLoading(true);
        // TODO: Implement study plan fetching logic
        setLoading(false);
      } catch (error) {
        console.error('Error fetching study plan:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchStudyPlan();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : studyPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Daily Schedule</h2>
            </div>
            <div className="space-y-4">
              {/* TODO: Add daily schedule content */}
              <p className="text-gray-600">No schedule items yet</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold">Topics Progress</h2>
            </div>
            <div className="space-y-4">
              {/* TODO: Add topics progress content */}
              <p className="text-gray-600">No progress data yet</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold">Upcoming Milestones</h2>
            </div>
            <div className="space-y-4">
              {/* TODO: Add milestones content */}
              <p className="text-gray-600">No milestones set</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Study Plan Created Yet</h2>
          <p className="text-gray-600 mb-8">Create your first study plan to get started with organized learning.</p>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudyPlannerPage;