import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface WritingFeedback {
  band_score: number;
  task_response: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  ai_feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    detailed_analysis: string;
  };
}

export interface SpeakingFeedback {
  band_score: number;
  fluency_coherence: number;
  pronunciation: number;
  lexical_resource: number;
  grammatical_range: number;
  ai_feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    detailed_analysis: string;
  };
}

export const aiService = {
  // Analyze writing essay with Gemini AI
  async analyzeWriting(content: string, taskType: 'task1' | 'task2'): Promise<WritingFeedback> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = this.getWritingPrompt(content, taskType);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      if (!analysis) throw new Error('No analysis received');

      return this.parseWritingFeedback(analysis, content);
    } catch (error) {
      console.error('Gemini Writing Analysis Error:', error);
      // Fallback to mock data if AI fails
      return this.getMockWritingFeedback(content, taskType);
    }
  },

  // Analyze speaking with Gemini AI (text-based for now)
  async analyzeSpeaking(transcript: string, partNumber: number): Promise<SpeakingFeedback> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = this.getSpeakingPrompt(transcript, partNumber);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      if (!analysis) throw new Error('No analysis received');

      return this.parseSpeakingFeedback(analysis);
    } catch (error) {
      console.error('Gemini Speaking Analysis Error:', error);
      return this.getMockSpeakingFeedback(partNumber);
    }
  },

  // Generate personalized study tips
  async generateStudyTips(weakAreas: string[], currentLevel: number): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Based on these weak areas: ${weakAreas.join(', ')} and current IELTS level: ${currentLevel}, provide 5 specific, actionable study tips for improvement. Focus on practical exercises and strategies. Format as a numbered list.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tips = response.text();

      if (!tips) return this.getDefaultStudyTips();

      // Parse the numbered list into an array
      const tipsList = tips.split('\n')
        .filter(tip => tip.trim().length > 0)
        .map(tip => tip.replace(/^\d+\.\s*/, '').trim())
        .filter(tip => tip.length > 0)
        .slice(0, 5);

      return tipsList.length > 0 ? tipsList : this.getDefaultStudyTips();
    } catch (error) {
      console.error('Gemini Study Tips Error:', error);
      return this.getDefaultStudyTips();
    }
  },

  // Generate enhanced essay version
  async generateEnhancedEssay(originalEssay: string, taskType: 'task1' | 'task2'): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Enhance this IELTS ${taskType} essay to Band 8+ level while maintaining the original ideas. Focus on:
1. More sophisticated vocabulary
2. Complex sentence structures
3. Better coherence and cohesion
4. Stronger task response

Original essay:
${originalEssay}

Provide the enhanced version with clear improvements:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedEssay = response.text();

      return enhancedEssay || "Enhanced version temporarily unavailable. Please try again later.";
    } catch (error) {
      console.error('Gemini Essay Enhancement Error:', error);
      return "Enhanced version temporarily unavailable. Please try again later.";
    }
  },

  // Helper methods
  getWritingPrompt(content: string, taskType: 'task1' | 'task2'): string {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    return `You are an expert IELTS examiner with 15+ years of experience. Analyze this IELTS ${taskType} essay and provide detailed feedback according to official IELTS criteria.

Essay (${wordCount} words):
${content}

Please provide your analysis in the following JSON format:
{
  "band_score": 7.0,
  "task_response": 7.0,
  "coherence_cohesion": 6.5,
  "lexical_resource": 7.0,
  "grammatical_range": 6.5,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "detailed_analysis": "comprehensive analysis paragraph"
}

Provide:
1. Overall band score (1-9)
2. Individual scores for each criterion (1-9)
3. Three main strengths
4. Three key areas for improvement
5. Three specific suggestions for practice
6. Detailed analysis paragraph

Be constructive and specific in your feedback.`;
  },

  getSpeakingPrompt(transcript: string, partNumber: number): string {
    return `You are an expert IELTS speaking examiner. Analyze this IELTS Speaking Part ${partNumber} response based on official IELTS criteria.

Transcript:
${transcript}

Provide detailed feedback in JSON format:
{
  "band_score": 7.0,
  "fluency_coherence": 7.0,
  "pronunciation": 6.5,
  "lexical_resource": 7.0,
  "grammatical_range": 6.5,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "detailed_analysis": "comprehensive analysis paragraph"
}

Evaluate:
1. Overall band score (1-9)
2. Individual scores for:
   - Fluency and Coherence (1-9)
   - Pronunciation (estimated from text patterns) (1-9)
   - Lexical Resource (1-9)
   - Grammatical Range and Accuracy (1-9)
3. Three main strengths
4. Three areas for improvement
5. Three practice suggestions
6. Detailed analysis

Be specific and constructive in your feedback.`;
  },

  parseWritingFeedback(analysis: string, content: string): WritingFeedback {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          band_score: parsed.band_score || 6.0,
          task_response: parsed.task_response || 6.0,
          coherence_cohesion: parsed.coherence_cohesion || 6.0,
          lexical_resource: parsed.lexical_resource || 6.0,
          grammatical_range: parsed.grammatical_range || 6.0,
          ai_feedback: {
            strengths: parsed.strengths || ["Good attempt at the task"],
            improvements: parsed.improvements || ["Work on sentence variety"],
            suggestions: parsed.suggestions || ["Practice more complex structures"],
            detailed_analysis: parsed.detailed_analysis || "Keep practicing to improve your writing skills."
          }
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }
    
    // Fallback to mock data if parsing fails
    return this.getMockWritingFeedback(content, 'task1');
  },

  parseSpeakingFeedback(analysis: string): SpeakingFeedback {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          band_score: parsed.band_score || 6.0,
          fluency_coherence: parsed.fluency_coherence || 6.0,
          pronunciation: parsed.pronunciation || 6.0,
          lexical_resource: parsed.lexical_resource || 6.0,
          grammatical_range: parsed.grammatical_range || 6.0,
          ai_feedback: {
            strengths: parsed.strengths || ["Good attempt"],
            improvements: parsed.improvements || ["Work on fluency"],
            suggestions: parsed.suggestions || ["Practice daily"],
            detailed_analysis: parsed.detailed_analysis || "Keep practicing speaking."
          }
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }
    
    // Fallback to mock data if parsing fails
    return this.getMockSpeakingFeedback(1);
  },

  // Fallback mock data
  getMockWritingFeedback(content: string, taskType: 'task1' | 'task2'): WritingFeedback {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const baseScore = Math.min(9, Math.max(4, 5 + (wordCount / 50)));

    return {
      band_score: Number((baseScore + Math.random() * 1.5).toFixed(1)),
      task_response: Number((baseScore + Math.random() * 1).toFixed(1)),
      coherence_cohesion: Number((baseScore + Math.random() * 1).toFixed(1)),
      lexical_resource: Number((baseScore + Math.random() * 1).toFixed(1)),
      grammatical_range: Number((baseScore + Math.random() * 1).toFixed(1)),
      ai_feedback: {
        strengths: [
          "Good task achievement with clear position",
          "Appropriate use of examples and explanations",
          "Generally well-organized structure"
        ],
        improvements: [
          "Consider using more varied cohesive devices",
          "Expand vocabulary with more sophisticated synonyms",
          "Work on complex sentence structures"
        ],
        suggestions: [
          "Practice using conditional sentences",
          "Learn more academic vocabulary",
          "Focus on paragraph transitions"
        ],
        detailed_analysis: "Your essay demonstrates a good understanding of the task requirements. The main ideas are clearly presented with relevant examples. To improve your score, focus on using more sophisticated vocabulary and complex grammatical structures. Pay attention to coherence and cohesion by using a wider range of linking words and phrases."
      }
    };
  },

  getMockSpeakingFeedback(partNumber: number): SpeakingFeedback {
    const baseScore = 6 + Math.random() * 2;

    return {
      band_score: Number(baseScore.toFixed(1)),
      fluency_coherence: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      pronunciation: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      lexical_resource: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      grammatical_range: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      ai_feedback: {
        strengths: [
          "Good fluency with natural rhythm",
          "Clear pronunciation of most sounds",
          "Appropriate use of vocabulary"
        ],
        improvements: [
          "Work on specific sound pronunciation",
          "Use more varied vocabulary",
          "Practice complex grammatical structures"
        ],
        suggestions: [
          "Record yourself daily",
          "Practice tongue twisters",
          "Learn idiomatic expressions"
        ],
        detailed_analysis: "Your speaking shows good fluency and coherence. You communicate your ideas clearly with appropriate vocabulary. To improve, focus on pronunciation accuracy and using more complex grammatical structures. Regular practice with recording yourself will help identify areas for improvement."
      }
    };
  },

  getDefaultStudyTips(): string[] {
    return [
      "Practice writing essays daily with time limits",
      "Read academic articles to improve vocabulary",
      "Record yourself speaking and analyze fluency",
      "Take practice tests weekly to track progress",
      "Focus on your weakest section for 30 minutes daily"
    ];
  }
};