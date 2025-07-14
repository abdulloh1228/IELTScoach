import React from 'react';
import { GraduationCap, Menu, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  onAuthClick: () => void;
}

export default function Header({ onNavigate, onAuthClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                AI IELTS Instructor
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">Your AI-Powered IELTS Preparation Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('exam-selector')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Mock Exams
            </button>
            <button 
              onClick={() => onNavigate('progress')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Progress
            </button>
            <button 
              onClick={() => onNavigate('profile')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Profile
            </button>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bell size={20} />
                </button>
                <button 
                  onClick={() => onNavigate('profile')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User size={20} />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={onAuthClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
            <button className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}