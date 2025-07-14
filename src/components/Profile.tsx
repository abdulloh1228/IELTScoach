import React, { useState } from 'react';
import { User, Edit3, Calendar, Target, Globe, BookOpen, Settings, Bell } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ProfileProps {
  onNavigate: (page: Page) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    targetScore: 8.0,
    currentScore: 7.2,
    examDate: '2024-03-15',
    studyGoal: 'University Application',
    country: 'Canada',
    joinDate: '2024-01-01',
    totalTests: 24,
    studyHours: 36
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{userProfile.name}</h1>
            <p className="text-blue-100">{userProfile.email}</p>
            <p className="text-blue-100 text-sm mt-1">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
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

      {/* Profile Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Full Name</span>
              <span className="font-medium">{userProfile.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{userProfile.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Country</span>
              <span className="font-medium">{userProfile.country}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Study Goal</span>
              <span className="font-medium">{userProfile.studyGoal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">IELTS Goals</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Target Score</span>
              <div className="flex items-center space-x-2">
                <Target size={16} className="text-blue-600" />
                <span className="font-bold text-blue-600">{userProfile.targetScore}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Score</span>
              <span className="font-bold text-green-600">{userProfile.currentScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exam Date</span>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-orange-600" />
                <span className="font-medium">{new Date(userProfile.examDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Days Remaining</span>
              <span className="font-bold text-orange-600">
                {Math.ceil((new Date(userProfile.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Study Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{userProfile.totalTests}</div>
            <div className="text-sm text-gray-600">Tests Completed</div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Target className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{userProfile.studyHours}h</div>
            <div className="text-sm text-gray-600">Study Hours</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">7</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Globe className="text-orange-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">89%</div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          {[
            { label: 'Daily study reminders', enabled: true },
            { label: 'Practice test notifications', enabled: true },
            { label: 'Progress milestone alerts', enabled: false },
            { label: 'Human tutor feedback available', enabled: true },
            { label: 'Weekly progress reports', enabled: true }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{setting.label}</span>
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

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Time</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Morning (6-12 PM)</option>
              <option>Afternoon (12-6 PM)</option>
              <option>Evening (6-10 PM)</option>
              <option>Night (10 PM-12 AM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Study Goal</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>3+ hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Management</h2>
        <div className="space-y-3">
          <button className="w-full text-left p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Change Password
          </button>
          <button className="w-full text-left p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Export Progress Data
          </button>
          <button className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and study preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="inline mr-2" size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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