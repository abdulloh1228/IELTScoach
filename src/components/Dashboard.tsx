import React from 'react';
import { PenTool, BookOpen, Mic, Headphones, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const userName = user?.profile?.full_name?.split(' ')[0] || 'Student';
  const targetScore = user?.profile?.target_score || 8.0;
  const currentScore = user?.profile?.current_score || 7.2;
  const testsCompleted = user?.profile?.tests_completed || 24;

  const recentScores = [
    { section: 'Writing', score: 7.5, date: '2 days ago' },
    { section: 'Reading', score: 8.0, date: '5 days ago' },
    { section: 'Speaking', score: 6.5, date: '1 week ago' },
    { section: 'Listening', score: 7.0, date: '1 week ago' },
  ];

  const dailyTips = [
    "Practice using complex sentences with subordinating conjunctions",
    "Expand your vocabulary with academic word lists",
    "Record yourself speaking to improve fluency and pronunciation"
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100 mb-6">Ready to boost your IELTS score today?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Target className="text-white" size={20} />
              <span className="font-semibold">Target: {targetScore}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Award className="text-white" size={20} />
              <span className="font-semibold">Current: {currentScore}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-white" size={20} />
              <span className="font-semibold">Progress: +{(currentScore - 6.5).toFixed(1)}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-white" size={20} />
              <span className="font-semibold">{user?.profile?.exam_date ? 
                Math.ceil((new Date(user.profile.exam_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) + ' days left' : 
                'Set exam date'
              }</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <button
          onClick={() => onNavigate('writing')}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <PenTool className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Writing Practice</h3>
          <p className="text-sm text-gray-600">Task 1 & Task 2 with AI feedback</p>
        </button>

        <button
          onClick={() => onNavigate('reading')}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Reading Practice</h3>
          <p className="text-sm text-gray-600">Passages with instant scoring</p>
        </button>

        <button
          onClick={() => onNavigate('speaking')}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <Mic className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Speaking Practice</h3>
          <p className="text-sm text-gray-600">Record & get AI analysis</p>
        </button>

        <button
          onClick={() => onNavigate('listening')}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <Headphones className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Listening Practice</h3>
          <p className="text-sm text-gray-600">Audio tests with transcripts</p>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Scores */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Scores</h2>
          <div className="space-y-4">
            {recentScores.map((score, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{score.section}</span>
                  <p className="text-sm text-gray-600">{score.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  score.score >= 8 ? 'bg-green-100 text-green-800' :
                  score.score >= 7 ? 'bg-blue-100 text-blue-800' :
                  score.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {score.score}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate('progress')}
            className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Full Progress →
          </button>
        </div>

        {/* Daily Tips */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Tips</h2>
          <div className="space-y-4">
            {dailyTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready for a Full Mock Exam?</h2>
        <p className="text-blue-100 mb-6">Take a complete IELTS practice test and get detailed AI feedback on all four sections.</p>
        <button 
          onClick={() => onNavigate('exam-selector')}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Start Mock Exam
        </button>
      </div>
    </div>
  );
}