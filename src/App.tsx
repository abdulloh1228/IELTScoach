import React, { useState } from 'react';
import { BookOpen, User, BarChart3, Settings } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden transition-colors">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex flex-col items-center p-2 ${currentPage === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('exam-selector')}
            className={`flex flex-col items-center p-2 ${currentPage === 'exam-selector' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Exams</span>
          </button>
          <button
            onClick={() => setCurrentPage('progress')}
            className={`flex flex-col items-center p-2 ${currentPage === 'progress' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Progress</span>
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center p-2 ${currentPage === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
