// Enhanced syllabus parser with auto-tagging
export interface EnhancedParsedSyllabus extends ParsedSyllabus {
  tags: {
    topics: string[];           // e.g., ["machine learning", "algorithms", "data structures"]
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skills: string[];           // e.g., ["programming", "mathematics", "statistics"]
    prerequisites: string[];   // e.g., ["CS101", "MATH201"]
    learningOutcomes: string[]; // e.g., ["design algorithms", "analyze complexity"]
  };
  resourceSuggestions: {
    textbooks: Array<{
      title: string;
      author: string;
      relevance: number; // 0-1
      reason: string;
    }>;
    onlineResources: Array<{
      title: string;
      url: string;
      type: 'video' | 'article' | 'tutorial' | 'practice';
      relevance: number;
    }>;
    tools: Array<{
      name: string;
      category: 'software' | 'platform' | 'library';
      relevance: number;
    }>;
  };
}

// Enhanced AI prompt for auto-tagging
const enhancedPrompt = `
Extract syllabus information AND analyze for:

1. COURSE TOPICS (auto-tag):
   - Identify main subject areas (e.g., "machine learning", "database design")
   - Extract 3-5 primary topics

2. DIFFICULTY LEVEL:
   - Analyze prerequisites, course level, assignment complexity
   - Classify as: beginner, intermediate, or advanced

3. SKILLS REQUIRED:
   - Identify technical skills needed (e.g., "programming", "statistics")
   - Extract 3-5 key skills

4. RESOURCE SUGGESTIONS:
   - Recommend relevant textbooks, online resources, tools
   - Based on course content and topics

Return enhanced JSON with tags and suggestions.
`;
















