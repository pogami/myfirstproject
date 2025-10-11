// AI-powered resource recommendation system
export interface ResourceRecommendation {
  id: string;
  title: string;
  type: 'textbook' | 'video' | 'article' | 'tutorial' | 'practice' | 'tool';
  url?: string;
  description: string;
  relevance: number; // 0-1 score
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  cost: 'free' | 'paid' | 'subscription';
  rating?: number;
  reviews?: number;
}

export class SyllabusResourceRecommender {
  static async recommendResources(
    parsedSyllabus: EnhancedParsedSyllabus
  ): Promise<ResourceRecommendation[]> {
    
    // 1. Extract topics and skills from syllabus
    const topics = parsedSyllabus.tags.topics;
    const skills = parsedSyllabus.tags.skills;
    const difficulty = parsedSyllabus.tags.difficulty;
    
    // 2. Query multiple sources for recommendations
    const recommendations = await Promise.all([
      this.recommendFromTextbooks(topics, difficulty),
      this.recommendFromOnlineCourses(topics, skills),
      this.recommendFromTools(topics, skills),
      this.recommendFromPractice(topics, difficulty)
    ]);
    
    // 3. Merge and rank recommendations
    const allRecommendations = recommendations.flat();
    return this.rankRecommendations(allRecommendations, parsedSyllabus);
  }
  
  private static async recommendFromTextbooks(
    topics: string[],
    difficulty: string
  ): Promise<ResourceRecommendation[]> {
    // Use AI to find relevant textbooks based on topics
    const prompt = `
    Recommend textbooks for topics: ${topics.join(', ')}
    Difficulty level: ${difficulty}
    
    Return JSON array of textbooks with:
    - title, author, description
    - relevance score (0-1)
    - cost (free/paid)
    - topics covered
    `;
    
    // Call AI API to get textbook recommendations
    const response = await fetch('/api/ai/recommend-textbooks', {
      method: 'POST',
      body: JSON.stringify({ topics, difficulty })
    });
    
    return response.json();
  }
  
  private static async recommendFromOnlineCourses(
    topics: string[],
    skills: string[]
  ): Promise<ResourceRecommendation[]> {
    // Search for online courses matching topics
    const query = `${topics.join(' ')} ${skills.join(' ')} online course`;
    
    // Use web search to find courses
    const searchResults = await searchRealWeb(query);
    
    return searchResults.sources.map(source => ({
      id: `course-${Date.now()}`,
      title: source.title,
      type: 'video' as const,
      url: source.url,
      description: source.snippet,
      relevance: this.calculateRelevance(source, topics),
      difficulty: 'intermediate' as const,
      topics: topics.filter(topic => 
        source.title.toLowerCase().includes(topic.toLowerCase())
      ),
      cost: 'free' as const
    }));
  }
  
  private static async recommendFromTools(
    topics: string[],
    skills: string[]
  ): Promise<ResourceRecommendation[]> {
    // Recommend software tools and platforms
    const toolRecommendations = [
      {
        title: "GitHub",
        type: "tool" as const,
        description: "Version control and collaboration platform",
        relevance: skills.includes('programming') ? 0.9 : 0.3,
        topics: ["programming", "collaboration"],
        cost: "free" as const
      },
      {
        title: "Jupyter Notebook",
        type: "tool" as const,
        description: "Interactive computing environment",
        relevance: topics.includes('data science') ? 0.95 : 0.4,
        topics: ["data science", "programming"],
        cost: "free" as const
      }
    ];
    
    return toolRecommendations.filter(tool => tool.relevance > 0.5);
  }
  
  private static async recommendFromPractice(
    topics: string[],
    difficulty: string
  ): Promise<ResourceRecommendation[]> {
    // Recommend practice platforms
    const practiceSites = [
      {
        title: "LeetCode",
        description: "Coding interview preparation",
        relevance: topics.includes('algorithms') ? 0.9 : 0.2,
        topics: ["algorithms", "programming"],
        cost: "free" as const
      },
      {
        title: "Khan Academy",
        description: "Free online learning platform",
        relevance: difficulty === 'beginner' ? 0.8 : 0.3,
        topics: topics,
        cost: "free" as const
      }
    ];
    
    return practiceSites.filter(site => site.relevance > 0.5);
  }
  
  private static calculateRelevance(
    source: any,
    topics: string[]
  ): number {
    let relevance = 0;
    const titleLower = source.title.toLowerCase();
    const snippetLower = source.snippet.toLowerCase();
    
    topics.forEach(topic => {
      if (titleLower.includes(topic.toLowerCase())) relevance += 0.3;
      if (snippetLower.includes(topic.toLowerCase())) relevance += 0.2;
    });
    
    return Math.min(relevance, 1);
  }
  
  private static rankRecommendations(
    recommendations: ResourceRecommendation[],
    syllabus: EnhancedParsedSyllabus
  ): ResourceRecommendation[] {
    return recommendations
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20); // Top 20 recommendations
  }
}




