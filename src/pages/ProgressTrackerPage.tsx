import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressStats {
  course: string;
  quiz_scores: {
    [key: string]: number[];
  };
  topics_covered: {
    [key: string]: string[];
  };
  study_hours: number;
  last_updated: string;
}

const ProgressTrackerPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('progress_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching progress stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Progress Data Available</h2>
          <p className="text-gray-600">
            Start taking quizzes and studying to see your progress tracked here!
          </p>
        </Card>
      </div>
    );
  }

  // Prepare quiz scores data for the chart
  const quizScoresData = Object.entries(stats.quiz_scores).map(([topic, scores]) => ({
    topic,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
    highest: Math.max(...scores),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Progress Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Study Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Course</p>
              <p className="text-lg font-medium">{stats.course}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Study Hours</p>
              <p className="text-lg font-medium">{stats.study_hours} hours</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="text-lg font-medium">
                {new Date(stats.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Topics Covered</h2>
          <div className="space-y-2">
            {Object.entries(stats.topics_covered).map(([topic, subtopics]) => (
              <div key={topic} className="border-b pb-2">
                <p className="font-medium">{topic}</p>
                <p className="text-sm text-gray-600">
                  {subtopics.length} subtopics completed
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Quiz Performance</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={quizScoresData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#3B82F6"
                name="Average Score"
              />
              <Line
                type="monotone"
                dataKey="highest"
                stroke="#10B981"
                name="Highest Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default ProgressTrackerPage;