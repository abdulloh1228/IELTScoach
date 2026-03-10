import React, { useState } from 'react';
import { Clock, FileText, Users, ArrowRight, Lock, X } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ExamSelectorProps {
  onNavigate: (page: Page) => void;
}

export default function ExamSelector({ onNavigate }: ExamSelectorProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const examTypes = [
    {
      title: 'Listening',
      duration: '30 minutes',
      sections: 4,
      difficulty: 'Academic',
      description: 'You will hear each recording only once and answer 40 questions based on them.',
      color: 'from-blue-500 to-purple-600',
      enabled: true
    },
    {
      title: 'Writing Section Only',
      duration: '60 minutes',
      sections: 2,
      difficulty: 'Academic',
      description: 'Task 1 and Task 2 with instant AI feedback and band score estimation',
      color: 'from-green-500 to-teal-600',
      enabled: true
    },
    {
      title: 'Reading Section Only',
      duration: '60 minutes',
      sections: 3,
      difficulty: 'Academic',
      description: 'Three reading passages with 40 questions and detailed explanations',
      color: 'from-purple-500 to-pink-600',
      enabled: false
    },
    {
      title: 'Speaking Practice',
      duration: '15 minutes',
      sections: 3,
      difficulty: 'Academic',
      description: 'Record your answers to speaking questions and get AI pronunciation feedback',
      color: 'from-orange-500 to-red-500',
      enabled: false
    }
  ];

  const handleExamStart = (examType: string, enabled: boolean) => {
    if (!enabled) {
      setShowComingSoonModal(true);
      return;
    }

    switch (examType) {
      case 'Listening':
        onNavigate('listening');
        break;
      case 'Writing':
        onNavigate('writing');
        break;
      case 'Reading':
        onNavigate('reading');
        break;
      case 'Speaking':
        onNavigate('speaking');
        break;
      case 'FullMockTest':
        onNavigate('listening');
        break;
      default:
        onNavigate('writing');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Full Mock Test</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          The IELTS test takes a total of 2 hours and 45 minutes. This includes the Listening, Reading, and Writing sections, which are completed in one sitting without breaks. Get <b>instant AI feedback</b> and detailed analysis
          to improve your performance in specific sections.
        </p>
        <button
          onClick={() => handleExamStart('FullMockTest', true)}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <span>Start Full Mock Test</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Exam Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {examTypes.map((exam, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 relative ${
              exam.enabled ? 'group hover:shadow-xl cursor-pointer' : 'opacity-60 blur-sm cursor-not-allowed'
            }`}
            onClick={() => !exam.enabled && setShowComingSoonModal(true)}
          >
            <div className={`h-2 bg-gradient-to-r ${exam.color}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900">{exam.title}</h3>
                  {!exam.enabled && <Lock size={20} className="text-gray-400" />}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exam.difficulty === 'Academic' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {exam.difficulty}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{exam.description}</p>

              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{exam.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>{exam.sections} sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>AI Feedback</span>
                </div>
              </div>

              {exam.enabled ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExamStart(exam.title.includes('Writing') ? 'Writing' : exam.title.split(' ')[0], true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Practice
                </button>
              ) : (
                <div className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium text-center">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
              <p className="text-gray-600 mb-4">
                Speaking and Reading AI mock tests are currently being prepared.
              </p>
              <p className="text-gray-600 mb-6">
                We are working on advanced AI evaluation features. Stay tuned! Leave your email and we will notify
                you when it launches.
              </p>
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - these will show real data once tests are completed */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Practice Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Tests Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">-</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">0h</div>
            <div className="text-sm text-gray-600">Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">-</div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preparation Tips</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Before You Start:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Find a quiet environment</li>
              <li>• Use headphones for listening sections</li>
              <li>• Have pen and paper ready</li>
              <li>• Set a timer for each section</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">After Completion:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Review AI feedback carefully</li>
              <li>• Note areas for improvement</li>
              <li>• Practice weak areas daily</li>
              <li>• Consider human tutor feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
