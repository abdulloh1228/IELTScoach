import React from 'react';
import { PenTool, BookOpen, Mic, Headphones, TrendingUp, Clock, Target, Award } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const userName = 'Student';
  const targetScore = 8.0;
  const currentScore = 7.0;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
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
              <span className="font-semibold">Progress: +0.5</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-white" size={20} />
              <span className="font-semibold">Start practicing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <button
          onClick={() => onNavigate('writing')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <PenTool className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Writing Practice</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Task 1 & Task 2 with AI feedback</p>
        </button>

        <button
          onClick={() => onNavigate('reading')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Reading Practice</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Passages with instant scoring</p>
        </button>

        <button
          onClick={() => onNavigate('speaking')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <Mic className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Speaking Practice</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Record & get AI analysis</p>
        </button>

        <button
          onClick={() => onNavigate('listening')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
            <Headphones className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Listening Practice</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Audio tests with transcripts</p>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Get Started</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Select a practice module above to begin your IELTS preparation</p>
          <p className="text-sm mt-2">Your progress will be tracked automatically</p>
        </div>
        <button
          onClick={() => onNavigate('progress')}
          className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View Progress
        </button>
      </div>
    </div>
  );
}
