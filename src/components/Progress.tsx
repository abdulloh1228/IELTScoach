import React from 'react';
import { TrendingUp, Calendar, Target, Award, BookOpen, Clock } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ProgressProps {
  onNavigate: (page: Page) => void;
}

export default function Progress({ onNavigate }: ProgressProps) {
  const progressData = [
    { date: '2024-01-15', writing: 6.5, reading: 7.0, speaking: 6.0, listening: 6.5 },
    { date: '2024-01-22', writing: 7.0, reading: 7.5, speaking: 6.5, listening: 7.0 },
    { date: '2024-01-29', writing: 7.5, reading: 8.0, speaking: 6.5, listening: 7.0 },
    { date: '2024-02-05', writing: 7.5, reading: 8.0, speaking: 7.0, listening: 7.5 },
  ];

  const currentScores = progressData[progressData.length - 1];
  const overallScore = ((currentScores.writing + currentScores.reading + currentScores.speaking + currentScores.listening) / 4).toFixed(1);

  const studyStats = [
    { label: 'Total Study Time', value: '36h 24m', icon: Clock, color: 'blue' },
    { label: 'Tests Completed', value: '24', icon: BookOpen, color: 'green' },
    { label: 'Current Streak', value: '7 days', icon: TrendingUp, color: 'purple' },
    { label: 'Target Score', value: '8.0', icon: Target, color: 'orange' }
  ];

  const achievements = [
    { title: 'First Perfect Reading Score', description: 'Scored 9.0 in Reading practice', date: '2 days ago', icon: '🎯' },
    { title: 'Writing Warrior', description: 'Completed 10 writing tasks', date: '1 week ago', icon: '✍️' },
    { title: 'Speaking Streak', description: '5 days of speaking practice', date: '1 week ago', icon: '🗣️' },
    { title: 'Early Bird', description: 'Studied for 7 consecutive days', date: '2 weeks ago', icon: '🌅' }
  ];

  const weeklyGoals = [
    { goal: 'Complete 3 Writing Tasks', progress: 2, total: 3, completed: false },
    { goal: 'Practice Speaking Daily', progress: 5, total: 7, completed: false },
    { goal: 'Finish 2 Reading Tests', progress: 2, total: 2, completed: true },
    { goal: 'Review Grammar Rules', progress: 1, total: 1, completed: true }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-2">Track your IELTS preparation journey and improvements</p>
      </div>

      {/* Current Score Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Current Overall Score</h2>
            <div className="text-5xl font-bold">{overallScore}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Award className="text-white mb-2" size={32} />
            <p className="text-blue-100 text-sm">+0.8 this month</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Writing', score: currentScores.writing, color: 'blue' },
            { label: 'Reading', score: currentScores.reading, color: 'green' },
            { label: 'Speaking', score: currentScores.speaking, color: 'purple' },
            { label: 'Listening', score: currentScores.listening, color: 'orange' }
          ].map((section, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-medium text-blue-100 text-sm">{section.label}</h3>
              <div className="text-2xl font-bold">{section.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {studyStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className={`bg-${stat.color}-100 p-3 rounded-lg w-fit mb-4`}>
              <stat.icon className={`text-${stat.color}-600`} size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Score Progress Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Score Progress</h2>
          <div className="space-y-6">
            {['Writing', 'Reading', 'Speaking', 'Listening'].map((section, index) => {
              const sectionKey = section.toLowerCase() as keyof typeof currentScores;
              const currentScore = currentScores[sectionKey] as number;
              const previousScore = progressData[0][sectionKey] as number;
              const improvement = currentScore - previousScore;
              
              return (
                <div key={section}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{section}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800">{currentScore}</span>
                      <span className={`text-sm ${
                        improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-green-600' :
                        index === 2 ? 'bg-purple-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${(currentScore / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Goals</h2>
          <div className="space-y-4">
            {weeklyGoals.map((goal, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{goal.goal}</span>
                  {goal.completed && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Completed
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        goal.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{goal.progress}/{goal.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Focus Areas</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Practice speaking fluency and pronunciation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Work on complex grammatical structures in writing</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Maintain excellent reading performance</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Next Steps</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Take a full mock exam this week</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Schedule speaking practice with human tutor</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Review common writing task 2 topics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}