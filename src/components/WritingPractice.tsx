import React, { useState } from 'react';
import { Clock, FileText, Send, BookOpen } from 'lucide-react';
import { testService } from '../lib/testService';
import { progressService } from '../lib/progressService';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface WritingPracticeProps {
  onNavigate: (page: Page) => void;
}

export default function WritingPractice({ onNavigate }: WritingPracticeProps) {
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);
  const [response, setResponse] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const tasks = {
    1: {
      title: "Task 1 - Academic Report",
      duration: "20 minutes",
      wordCount: 150,
      prompt: "The chart below shows the percentage of households in different income brackets in a European country from 1990 to 2020.",
      instructions: "Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words."
    },
    2: {
      title: "Task 2 - Essay",
      duration: "40 minutes",
      wordCount: 250,
      prompt: "Some people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion.",
      instructions: "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words."
    }
  };

  const handleSubmit = async () => {
    if (response.trim().length < tasks[currentTask].wordCount) {
      alert(`Please write at least ${tasks[currentTask].wordCount} words.`);
      return;
    }

    setLoading(true);
    try {
      const session = await testService.createTestSession('writing');

      const submission = await testService.submitWritingResponse({
        session_id: session.id,
        task_number: currentTask,
        prompt: tasks[currentTask].prompt,
        response: response,
        word_count: response.split(/\s+/).length,
        time_taken: currentTask === 1 ? 1200 - timeLeft : 2400 - timeLeft,
      });

      setResults(submission);
      setShowResults(true);

      await progressService.incrementTestCompletion();
      await progressService.addStudyTime(currentTask === 1 ? 20 : 40);
    } catch (error) {
      console.error('Error submitting writing:', error);
      alert('Error submitting writing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = response.split(/\s+/).filter(word => word.length > 0).length;

  if (showResults) {
    if (!results) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Writing Analysis Results</h1>
          <button
            onClick={() => {setShowResults(false); setResponse(''); setTimeLeft(currentTask === 1 ? 1200 : 2400);}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Practice Again
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Writing Band Score</h2>
          <div className="text-6xl font-bold mb-4">{results.band_score}</div>
          <p className="text-blue-100">Keep practicing to improve your score!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Scores</h3>
            <div className="space-y-4">
              {[
                { criteria: 'Task Achievement', score: results.task_achievement },
                { criteria: 'Coherence & Cohesion', score: results.coherence_cohesion },
                { criteria: 'Lexical Resource', score: results.lexical_resource },
                { criteria: 'Grammatical Range', score: results.grammatical_range }
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Feedback</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <h4 className="font-semibold text-green-800 mb-1">Strengths</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {results.ai_feedback.strengths?.map((strength: string, index: number) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <h4 className="font-semibold text-blue-800 mb-1">Areas to Improve</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {results.ai_feedback.improvements?.map((improvement: string, index: number) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Response</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Writing Practice</h1>
          <p className="text-gray-600 mt-2">IELTS Academic Writing Test</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow border">
            <Clock className="text-blue-600" size={20} />
            <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => onNavigate('exam-selector')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Exams
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Task</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((task) => (
            <button
              key={task}
              onClick={() => {
                setCurrentTask(task as 1 | 2);
                setResponse('');
                setTimeLeft(task === 1 ? 1200 : 2400);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentTask === task
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="text-blue-600" size={20} />
                <h3 className="font-semibold">{tasks[task as 1 | 2].title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Duration: {tasks[task as 1 | 2].duration}
              </p>
              <p className="text-sm text-gray-600">
                Min. {tasks[task as 1 | 2].wordCount} words
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">{tasks[currentTask].title}</h2>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p className="text-gray-800 font-medium mb-3">{tasks[currentTask].prompt}</p>
          <p className="text-sm text-gray-700">{tasks[currentTask].instructions}</p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Your Response
          </label>
          <span className={`text-sm font-medium ${
            wordCount >= tasks[currentTask].wordCount ? 'text-green-600' : 'text-orange-600'
          }`}>
            {wordCount} / {tasks[currentTask].wordCount} words
          </span>
        </div>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Start writing your response here..."
          className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || wordCount < tasks[currentTask].wordCount}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[48px]"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send size={16} />
              <span>Submit for AI Analysis</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Writing Tips</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Task 1 Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Describe main trends and patterns</li>
              <li>• Use appropriate data comparison language</li>
              <li>• Include an overview paragraph</li>
              <li>• Don't give personal opinions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Task 2 Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Plan your essay structure first</li>
              <li>• Include clear introduction and conclusion</li>
              <li>• Support ideas with examples</li>
              <li>• Use linking words effectively</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
