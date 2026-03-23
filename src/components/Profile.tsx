import React, { useState } from 'react';
import { User, CreditCard as Edit3, Calendar, Target, Globe, BookOpen, Settings } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ProfileProps {
  onNavigate: (page: Page) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: 'Student',
    email: 'student@example.com',
    target_score: 8.0,
    exam_date: '',
    study_goal: 'General Improvement',
    country: '',
  });

  const handleSave = async () => {
    setIsEditing(false);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{formData.full_name}</h1>
            <p className="text-blue-100">{formData.email}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Goal</label>
                <input
                  type="text"
                  value={formData.study_goal}
                  onChange={(e) => setFormData({...formData, study_goal: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Full Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Country</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.country || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Study Goal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.study_goal}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">IELTS Goals</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Score</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  step="0.5"
                  value={formData.target_score}
                  onChange={(e) => setFormData({...formData, target_score: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target Score</span>
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="font-bold text-blue-600">{formData.target_score}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Score</span>
                <span className="font-bold text-green-600">7.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Exam Date</span>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-orange-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.exam_date ? new Date(formData.exam_date).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Study Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tests Completed</div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Target className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">0h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Study Hours</div>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Globe className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">0%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Improvement</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <div className="space-y-4">
          {[
            { label: 'Daily study reminders', enabled: true },
            { label: 'Practice test notifications', enabled: true },
            { label: 'Progress milestone alerts', enabled: false },
            { label: 'Weekly progress reports', enabled: true }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Study Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Study Time</label>
            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Morning (6-12 PM)</option>
              <option>Afternoon (12-6 PM)</option>
              <option>Evening (6-10 PM)</option>
              <option>Night (10 PM-12 AM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Daily Study Goal</label>
            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>3+ hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and study preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <User className="inline mr-2" size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="inline mr-2" size={16} />
              Settings
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}
