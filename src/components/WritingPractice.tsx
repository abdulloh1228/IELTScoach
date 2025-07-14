import React, { useState } from 'react';
import { Upload, Camera, Send, Clock, FileText, User, Lightbulb } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface WritingPracticeProps {
  onNavigate: (page: Page) => void;
}

export default function WritingPractice({ onNavigate }: WritingPracticeProps) {
  const [selectedTask, setSelectedTask] = useState<'task1' | 'task2'>('task1');
  const [essay, setEssay] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'type' | 'upload'>('type');

  const task1Prompt = "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
  
  const task2Prompt = "Some people believe that studying at university or college is the best route to a successful career, while others believe that it is better to get a job straight after school. Discuss both views and give your opinion.";

  const handleSubmit = () => {
    if (essay.trim()) {
      setShowResults(true);
    }
  };

  const mockResults = {
    overallScore: 7.5,
    taskResponse: 8.0,
    coherenceCohesion: 7.0,
    lexicalResource: 7.5,
    grammaticalRange: 7.0,
    feedback: [
      "Excellent task achievement with clear position and well-developed arguments",
      "Consider using more varied cohesive devices to improve flow",
      "Expand your vocabulary with more sophisticated synonyms",
      "Work on complex sentence structures to show grammatical range",
      "Strong conclusion that effectively summarizes your position"
    ],
    improvedVersion: "Here's how your essay could be enhanced to reach Band 8+..."
  };

  if (showResults) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Writing Analysis Results</h1>
          <button 
            onClick={() => setShowResults(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Another Essay
          </button>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Estimated Band Score</h2>
          <div className="text-6xl font-bold mb-4">{mockResults.overallScore}</div>
          <p className="text-blue-100">Great progress! You're on track to reach your target score.</p>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Band Scores</h3>
            <div className="space-y-4">
              {[
                { criteria: 'Task Response', score: mockResults.taskResponse },
                { criteria: 'Coherence & Cohesion', score: mockResults.coherenceCohesion },
                { criteria: 'Lexical Resource', score: mockResults.lexicalResource },
                { criteria: 'Grammatical Range', score: mockResults.grammaticalRange }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{item.criteria}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.score / 9) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-600 w-8">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <Lightbulb className="inline mr-2" size={20} />
              Improvement Tips
            </h3>
            <div className="space-y-3">
              {mockResults.feedback.map((tip, index) => (
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

        {/* Enhanced Version */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Enhanced Version (Band 8+)</h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-700 italic">{mockResults.improvedVersion}</p>
            <button className="mt-4 text-green-600 hover:text-green-700 font-medium">
              View Complete Enhanced Essay →
            </button>
          </div>
        </div>

        {/* Human Feedback Option */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center space-x-3 mb-4">
            <User className="text-purple-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">Want Human Expert Feedback?</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Get detailed feedback from certified IELTS instructors within 24-48 hours. 
            Perfect for personalized guidance and advanced improvement strategies.
          </p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Request Human Feedback ($15)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Writing Practice</h1>
          <p className="text-gray-600 mt-2">Practice IELTS Writing Tasks with instant AI feedback</p>
        </div>
        <button 
          onClick={() => onNavigate('exam-selector')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Exams
        </button>
      </div>

      {/* Task Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Writing Task</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedTask('task1')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTask === 'task1'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedTask === 'task1' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Task 1 - Academic</h3>
                <p className="text-sm text-gray-600">Describe graphs, charts, or diagrams</p>
                <p className="text-xs text-gray-500 mt-1">20 minutes • 150 words minimum</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedTask('task2')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTask === 'task2'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedTask === 'task2' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Task 2 - Essay</h3>
                <p className="text-sm text-gray-600">Write an argumentative essay</p>
                <p className="text-xs text-gray-500 mt-1">40 minutes • 250 words minimum</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Task Prompt */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedTask === 'task1' ? 'Task 1 Prompt' : 'Task 2 Prompt'}
          </h2>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-gray-800 leading-relaxed">
            {selectedTask === 'task1' ? task1Prompt : task2Prompt}
          </p>
        </div>
      </div>

      {/* Input Method Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How would you like to submit your essay?</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setUploadMethod('type')}
            className={`p-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'type'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className={uploadMethod === 'type' ? 'text-blue-500' : 'text-gray-400'} size={24} />
              <div className="text-left">
                <h3 className="font-semibold">Type Your Essay</h3>
                <p className="text-sm text-gray-600">Write directly in the text area below</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setUploadMethod('upload')}
            className={`p-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'upload'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Upload className={uploadMethod === 'upload' ? 'text-blue-500' : 'text-gray-400'} size={24} />
              <div className="text-left">
                <h3 className="font-semibold">Upload Photo/PDF</h3>
                <p className="text-sm text-gray-600">Upload handwritten essay image</p>
              </div>
            </div>
          </button>
        </div>

        {/* Essay Input */}
        {uploadMethod === 'type' ? (
          <div>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={`Start writing your ${selectedTask === 'task1' ? 'Task 1 response' : 'essay'} here...`}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Word count: {essay.split(' ').filter(word => word.length > 0).length} words
              </span>
              <button
                onClick={handleSubmit}
                disabled={!essay.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Get AI Feedback</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Your Handwritten Essay</h3>
            <p className="text-gray-600 mb-4">Take a photo or upload a PDF of your handwritten essay</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Take Photo
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Upload File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}