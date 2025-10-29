import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialContext: string;
  testType: 'writing' | 'reading' | 'speaking' | 'listening';
  userResponse?: string;
  results: any;
}

export default function ChatInterface({ initialContext, testType, userResponse, results }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialContext,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input.trim(), messages, testType, userResponse, results);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
        <div className="flex items-center space-x-3 text-white">
          <MessageCircle size={24} />
          <div>
            <h3 className="font-semibold text-lg">Ask Questions About Your Results</h3>
            <p className="text-sm text-blue-100">Get personalized guidance from AI</p>
          </div>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your results..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

async function generateAIResponse(
  userQuestion: string,
  conversationHistory: Message[],
  testType: string,
  userResponse?: string,
  results?: any
): Promise<string> {
  const contextPrompt = buildContextPrompt(testType, userResponse, results);

  const conversationContext = conversationHistory
    .slice(-5)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const fullPrompt = `${contextPrompt}

Previous conversation:
${conversationContext}

User's new question: ${userQuestion}

Please provide a helpful, specific answer focusing on IELTS ${testType} improvement. Be encouraging and constructive.`;

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return generateMockResponse(userQuestion, testType);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateMockResponse(userQuestion, testType);
  }
}

function buildContextPrompt(testType: string, userResponse?: string, results?: any): string {
  let context = `You are an expert IELTS ${testType} instructor providing personalized feedback.\n\n`;

  if (results) {
    context += `Student's Results:\n`;
    context += `- Band Score: ${results.band_score}\n`;

    if (testType === 'writing') {
      context += `- Task Achievement: ${results.task_achievement}\n`;
      context += `- Coherence & Cohesion: ${results.coherence_cohesion}\n`;
      context += `- Lexical Resource: ${results.lexical_resource}\n`;
      context += `- Grammatical Range: ${results.grammatical_range}\n`;
    } else if (testType === 'speaking') {
      context += `- Fluency & Coherence: ${results.fluency_coherence}\n`;
      context += `- Pronunciation: ${results.pronunciation}\n`;
      context += `- Lexical Resource: ${results.lexical_resource}\n`;
      context += `- Grammatical Range: ${results.grammatical_range}\n`;
    } else if (testType === 'reading') {
      context += `- Score: ${results.score}/${results.total_questions}\n`;
    } else if (testType === 'listening') {
      context += `- Score: ${results.score}/${results.total_questions}\n`;
    }
  }

  if (userResponse) {
    context += `\nStudent's Response:\n${userResponse.substring(0, 500)}${userResponse.length > 500 ? '...' : ''}\n`;
  }

  return context;
}

function generateMockResponse(question: string, testType: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
    return `Great question! To improve your ${testType} score, I recommend:\n\n1. Practice regularly with authentic materials\n2. Focus on your weaker areas identified in the feedback\n3. Study high-scoring sample answers\n4. Time yourself during practice sessions\n5. Get feedback on your practice attempts\n\nWould you like specific advice on any particular aspect?`;
  }

  if (lowerQuestion.includes('vocabulary') || lowerQuestion.includes('words')) {
    return `Vocabulary is crucial for IELTS ${testType}! Here are some tips:\n\n1. Learn topic-specific vocabulary for common IELTS themes\n2. Use a variety of synonyms to avoid repetition\n3. Practice collocations (words that commonly go together)\n4. Read extensively from academic sources\n5. Keep a vocabulary journal with example sentences\n\nFocus on understanding context rather than memorizing isolated words.`;
  }

  if (lowerQuestion.includes('grammar') || lowerQuestion.includes('tense')) {
    return `Grammar accuracy is important for achieving higher bands. Here's what to focus on:\n\n1. Use a variety of complex sentence structures\n2. Ensure subject-verb agreement throughout\n3. Use appropriate tenses for different contexts\n4. Practice conditional sentences (if-clauses)\n5. Review common error patterns in your writing\n\nRemember, accuracy is more important than complexity!`;
  }

  if (lowerQuestion.includes('time') || lowerQuestion.includes('minutes')) {
    return `Time management is essential in IELTS! Here's a strategy:\n\n1. Allocate specific time for each section\n2. Practice with a timer to build speed\n3. Don't spend too long on difficult questions\n4. Leave time for review at the end\n5. Work on your weakest areas to gain efficiency\n\nRegular timed practice will help you develop a natural sense of pacing.`;
  }

  if (lowerQuestion.includes('score') || lowerQuestion.includes('band')) {
    return `Your current performance shows good potential! To reach your target band:\n\n1. Understand the specific criteria for each band level\n2. Analyze high-scoring examples in your ${testType} section\n3. Get regular feedback to track progress\n4. Focus on consistency across all assessment criteria\n5. Practice under test conditions regularly\n\nConsistent effort will lead to steady improvement!`;
  }

  return `That's an interesting question about ${testType}! Based on your results, I suggest:\n\n1. Review the specific feedback provided in your assessment\n2. Practice similar questions to reinforce your learning\n3. Study model answers to understand what examiners look for\n4. Focus on the areas where you lost points\n5. Take regular practice tests to monitor progress\n\nFeel free to ask more specific questions about any aspect of your performance!`;
}
