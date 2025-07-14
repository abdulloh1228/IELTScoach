import React, { useState } from 'react';
import { BookOpen, User, BarChart3, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExamSelector from './components/ExamSelector';
import WritingPractice from './components/WritingPractice';
import ReadingPractice from './components/ReadingPractice';
import SpeakingPractice from './components/SpeakingPractice';
import ListeningPractice from './components/ListeningPractice';
import Progress from './components/Progress';
import Profile from './components/Profile';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onNavigate={setCurrentPage} onAuthClick={() => setShowAuthModal(true)} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Master IELTS with AI-Powered Preparation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get instant feedback, personalized study plans, and expert guidance to achieve your target IELTS score.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Start Free Practice
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'exam-selector':
        return <ExamSelector onNavigate={setCurrentPage} />;
      case 'writing':
        return <WritingPractice onNavigate={setCurrentPage} />;
      case 'reading':
        return <ReadingPractice onNavigate={setCurrentPage} />;
      case 'speaking':
        return <SpeakingPractice onNavigate={setCurrentPage} />;
      case 'listening':
        return <ListeningPractice onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onNavigate={setCurrentPage} onAuthClick={() => setShowAuthModal(true)} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex flex-col items-center p-2 ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('exam-selector')}
            className={`flex flex-col items-center p-2 ${currentPage === 'exam-selector' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Exams</span>
          </button>
          <button
            onClick={() => setCurrentPage('progress')}
            className={`flex flex-col items-center p-2 ${currentPage === 'progress' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Progress</span>
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center p-2 ${currentPage === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;