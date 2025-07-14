import React, { useState } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Star } from 'lucide-react';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface SpeakingPracticeProps {
  onNavigate: (page: Page) => void;
}

export default function SpeakingPractice({ onNavigate }: SpeakingPracticeProps) {
  const [currentPart, setCurrentPart] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const speakingParts = {
    1: {
      title: "Part 1 - Introduction & Interview",
      duration: "4-5 minutes",
      description: "The examiner will ask you general questions about yourself and familiar topics.",
      questions: [
        "Could you tell me your full name?",
        "What work do you do?",
        "Do you enjoy your job? Why?",
        "How do you usually spend your weekends?",
        "What kind of music do you like?"
      ]
    },
    2: {
      title: "Part 2 - Long Turn",
      duration: "3-4 minutes",
      description: "You will speak for 1-2 minutes on a given topic after 1 minute of preparation.",
      topic: "Describe a place you have visited that you particularly enjoyed.",
      points: [
        "Where it was",
        "When you went there",
        "What you did there",
        "And explain why you enjoyed it"
      ]
    },
    3: {
      title: "Part 3 - Discussion",
      duration: "4-5 minutes",
      description: "The examiner will ask you questions related to the Part 2 topic.",
      questions: [
        "How important is travel in people's lives?",
        "What are the benefits of visiting different places?",
        "Do you think tourism has any negative effects?",
        "How has tourism changed in your country over the years?"
      ]
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
    } else {
      setIsRecording(true);
      setHasRecording(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const mockResults = {
    overallScore: 6.5,
    fluency: 7.0,
    pronunciation: 6.0,
    lexical: 6.5,
    grammar: 6.5,
    feedback: [
      "Good fluency with natural rhythm in most responses",
      "Work on pronunciation of specific sounds (/th/, /r/)",
      "Use more varied vocabulary and idiomatic expressions",
      "Practice complex grammatical structures",
      "Extend your answers with more detailed examples"
    ]
  };

  if (showResults) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Speaking Analysis Results</h1>
          <button 
            onClick={() => setShowResults(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Practice Again
          </button>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Speaking Band Score</h2>
          <div className="text-6xl font-bold mb-4">{mockResults.overallScore}</div>
          <p className="text-purple-100">Great progress! Keep practicing to reach your target.</p>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Scores</h3>
            <div className="space-y-4">
              {[
                { criteria: 'Fluency & Coherence', score: mockResults.fluency },
                { criteria: 'Pronunciation', score: mockResults.pronunciation },
                { criteria: 'Lexical Resource', score: mockResults.lexical },
                { criteria: 'Grammatical Range', score: mockResults.grammar }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{item.criteria}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.score / 9) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-purple-600 w-8">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Feedback</h3>
            <div className="space-y-3">
              {mockResults.feedback.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Answers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            <Star className="inline mr-2" size={20} />
            Sample High-Band Answers
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h4 className="font-medium text-green-800 mb-2">Part 1 Example Response</h4>
              <p className="text-gray-700 text-sm italic">
                "I work as a software developer for a tech startup in the city center. I absolutely love my job because 
                it allows me to be creative and solve complex problems every day. What I find particularly rewarding is..."
              </p>
            </div>
            <button className="text-green-600 hover:text-green-700 font-medium">
              Listen to Full Sample Answer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaking Practice</h1>
          <p className="text-gray-600 mt-2">IELTS Speaking Test Simulation</p>
        </div>
        <button 
          onClick={() => onNavigate('exam-selector')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Exams
        </button>
      </div>

      {/* Part Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Speaking Part</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((part) => (
            <button
              key={part}
              onClick={() => setCurrentPart(part)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentPart === part
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-1">{speakingParts[part as keyof typeof speakingParts].title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {speakingParts[part as keyof typeof speakingParts].duration}
              </p>
              <p className="text-xs text-gray-500">
                {speakingParts[part as keyof typeof speakingParts].description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Part Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {speakingParts[currentPart as keyof typeof speakingParts].title}
        </h2>
        
        {currentPart === 2 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Cue Card</h3>
            <p className="text-gray-800 font-medium mb-4">
              {speakingParts[2].topic}
            </p>
            <p className="text-gray-700 mb-2">You should say:</p>
            <ul className="text-gray-700 space-y-1">
              {speakingParts[2].points.map((point, index) => (
                <li key={index}>• {point}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              You have 1 minute to prepare. You can make notes if you wish.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-800">Practice Questions:</h3>
            {speakingParts[currentPart as keyof typeof speakingParts].questions?.map((question, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{index + 1}. {question}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recording Interface */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
          <div className="text-center">
            <div className="mb-6">
              <button
                onClick={handleRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isRecording ? <Square size={32} /> : <Mic size={32} />}
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isRecording ? 'Recording in progress...' : 'Ready to record your answer'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {isRecording 
                ? 'Speak clearly and at a natural pace' 
                : 'Click the microphone to start recording'
              }
            </p>

            {hasRecording && (
              <div className="flex justify-center space-x-4 mb-4">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Play size={16} />
                  <span>Play Recording</span>
                </button>
                <button 
                  onClick={() => {setHasRecording(false); setIsRecording(false);}}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Re-record</span>
                </button>
              </div>
            )}

            {hasRecording && (
              <button
                onClick={handleSubmit}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Get AI Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Speaking Tips</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Before Recording:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure you're in a quiet environment</li>
              <li>• Test your microphone</li>
              <li>• Take time to think about your answer</li>
              <li>• Practice speaking clearly</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">While Speaking:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Speak at a natural pace</li>
              <li>• Use varied vocabulary</li>
              <li>• Give detailed examples</li>
              <li>• Don't worry about perfect grammar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}