// AI Service for generating study tips and feedback
export const aiService = {
  async generateStudyTips(examType: string): Promise<string[]> {
    // Mock AI-generated study tips for demo mode
    const tipsByExam: Record<string, string[]> = {
      'ielts': [
        'Practice writing task 1 graphs daily to improve data interpretation skills',
        'Read academic articles to expand vocabulary and understand complex sentence structures',
        'Record yourself speaking and analyze pronunciation and fluency patterns',
        'Take practice listening tests with various accents to improve comprehension'
      ],
      'toefl': [
        'Focus on integrated writing tasks that combine reading and listening skills',
        'Practice note-taking during lectures to improve listening comprehension',
        'Work on speaking templates for independent and integrated tasks',
        'Read academic passages and summarize main points in your own words'
      ],
      'pte': [
        'Practice speaking into a microphone to get comfortable with the format',
        'Work on summarizing written text in exactly one sentence',
        'Focus on pronunciation and oral fluency for speaking tasks',
        'Practice typing quickly and accurately for writing tasks'
      ],
      'duolingo': [
        'Complete daily lessons consistently to build vocabulary gradually',
        'Practice speaking exercises to improve pronunciation confidence',
        'Focus on grammar patterns through repetitive exercises',
        'Use the stories feature to improve reading comprehension'
      ]
    };

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return tipsByExam[examType.toLowerCase()] || [
      'Practice regularly to build consistency in your study routine',
      'Focus on your weakest areas to see the most improvement',
      'Take practice tests to familiarize yourself with the format',
      'Review mistakes carefully to avoid repeating them'
    ];
  },

  async analyzeWriting(text: string): Promise<{
    score: number;
    feedback: string[];
    suggestions: string[];
  }> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock analysis based on text length and basic metrics
    const wordCount = text.trim().split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    let score = 6.0; // Base score
    
    // Adjust score based on length
    if (wordCount >= 250) score += 0.5;
    if (wordCount >= 300) score += 0.5;
    if (wordCount < 150) score -= 1.0;

    // Adjust based on sentence variety
    if (avgWordsPerSentence > 15 && avgWordsPerSentence < 25) score += 0.5;
    if (avgWordsPerSentence < 10 || avgWordsPerSentence > 30) score -= 0.5;

    // Cap the score
    score = Math.min(Math.max(score, 1.0), 9.0);

    const feedback = [
      `Your essay contains ${wordCount} words across ${sentenceCount} sentences.`,
      `Average sentence length: ${avgWordsPerSentence.toFixed(1)} words.`,
      wordCount >= 250 ? 'Good length for the task requirements.' : 'Consider expanding your ideas with more detail.',
      avgWordsPerSentence > 20 ? 'Good sentence variety and complexity.' : 'Try using more complex sentence structures.'
    ];

    const suggestions = [
      'Use more transitional phrases to connect your ideas smoothly',
      'Include specific examples to support your main points',
      'Vary your sentence beginnings to improve flow',
      'Check for repetitive vocabulary and use synonyms where appropriate'
    ];

    return { score, feedback, suggestions };
  }
};