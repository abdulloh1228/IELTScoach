import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - use backend in production
});

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
  // Analyze writing essay with AI
  async analyzeWriting(content: string, taskType: 'task1' | 'task2'): Promise<WritingFeedback> {
    try {
      const prompt = this.getWritingPrompt(content, taskType);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert IELTS examiner with 15+ years of experience. Analyze writing tasks according to official IELTS criteria and provide detailed, constructive feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) throw new Error('No analysis received');

      return this.parseWritingFeedback(analysis, content);
    } catch (error) {
      console.error('AI Writing Analysis Error:', error);
      // Fallback to mock data if AI fails
      return this.getMockWritingFeedback(content, taskType);
    }
  },

  // Analyze speaking with AI (text-based for now)
  async analyzeSpeaking(transcript: string, partNumber: number): Promise<SpeakingFeedback> {
    try {
      const prompt = this.getSpeakingPrompt(transcript, partNumber);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert IELTS speaking examiner. Analyze speaking responses based on fluency, pronunciation patterns in text, lexical resource, and grammatical range."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) throw new Error('No analysis received');

      return this.parseSpeakingFeedback(analysis);
    } catch (error) {
      console.error('AI Speaking Analysis Error:', error);
      return this.getMockSpeakingFeedback(partNumber);
    }
  },

  // Generate personalized study tips
  async generateStudyTips(weakAreas: string[], currentLevel: number): Promise<string[]> {
    try {
      const prompt = `Based on these weak areas: ${weakAreas.join(', ')} and current IELTS level: ${currentLevel}, provide 5 specific, actionable study tips for improvement. Focus on practical exercises and strategies.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an IELTS preparation expert. Provide specific, actionable study tips."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const tips = response.choices[0]?.message?.content;
      if (!tips) return this.getDefaultStudyTips();

      return tips.split('\n').filter(tip => tip.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('AI Study Tips Error:', error);
      return this.getDefaultStudyTips();
    }
  },

  // Generate enhanced essay version
  async generateEnhancedEssay(originalEssay: string, taskType: 'task1' | 'task2'): Promise<string> {
    try {
      const prompt = `Enhance this IELTS ${taskType} essay to Band 8+ level while maintaining the original ideas. Focus on:
1. More sophisticated vocabulary
2. Complex sentence structures
3. Better coherence and cohesion
4. Stronger task response

Original essay:
${originalEssay}

Provide the enhanced version:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert IELTS writing instructor. Enhance essays to Band 8+ level while preserving the student's original ideas and voice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return response.choices[0]?.message?.content || "Enhanced version temporarily unavailable.";
    } catch (error) {
      console.error('AI Essay Enhancement Error:', error);
      return "Enhanced version temporarily unavailable. Please try again later.";
    }
  },

  // Helper methods
  getWritingPrompt(content: string, taskType: 'task1' | 'task2'): string {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    return `Analyze this IELTS ${taskType} essay and provide detailed feedback:

Essay (${wordCount} words):
${content}

Please provide:
1. Overall band score (1-9)
2. Individual scores for:
   - Task Response/Achievement (1-9)
   - Coherence and Cohesion (1-9)
   - Lexical Resource (1-9)
   - Grammatical Range and Accuracy (1-9)
3. Three main strengths
4. Three key areas for improvement
5. Three specific suggestions for practice
6. Detailed analysis paragraph

Format your response as JSON with this structure:
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
}`;
  },

  getSpeakingPrompt(transcript: string, partNumber: number): string {
    return `Analyze this IELTS Speaking Part ${partNumber} response:

Transcript:
${transcript}

Provide detailed feedback on:
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

Format as JSON similar to writing feedback.`;
  },

  parseWritingFeedback(analysis: string, content: string): WritingFeedback {
    try {
      const parsed = JSON.parse(analysis);
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
    } catch (error) {
      return this.getMockWritingFeedback(content, 'task1');
    }
  },

  parseSpeakingFeedback(analysis: string): SpeakingFeedback {
    try {
      const parsed = JSON.parse(analysis);
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
    } catch (error) {
      return this.getMockSpeakingFeedback(1);
    }
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