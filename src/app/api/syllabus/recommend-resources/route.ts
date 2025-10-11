import { NextRequest, NextResponse } from 'next/server';
// Web search temporarily disabled for deployment
// import { searchRealWeb } from '@/app/api/chat/working-web-search';

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

export async function POST(request: NextRequest) {
  try {
    const { tags, courseInfo } = await request.json();
    
    if (!tags || !tags.topics) {
      return NextResponse.json({ error: 'Course tags are required' }, { status: 400 });
    }

    console.log('🔍 Generating resource recommendations for:', tags.topics);

    const recommendations = await generateResourceRecommendations(tags, courseInfo);
    
    return NextResponse.json({
      success: true,
      recommendations,
      totalCount: recommendations.length
    });

  } catch (error: any) {
    console.error('Resource recommendation error:', error);
    return NextResponse.json({
      error: 'Failed to generate resource recommendations',
      details: error.message
    }, { status: 500 });
  }
}

async function generateResourceRecommendations(
  tags: any,
  courseInfo: any
): Promise<ResourceRecommendation[]> {
  const topics = tags.topics || [];
  const skills = tags.skills || [];
  const difficulty = tags.difficulty || 'intermediate';
  
  console.log('📚 Topics:', topics);
  console.log('🛠️ Skills:', skills);
  console.log('📊 Difficulty:', difficulty);

  const recommendations: ResourceRecommendation[] = [];

  // 1. Search for textbooks and books (web search temporarily disabled)
  // Will be re-enabled once proper web search is configured
  console.log('📚 Web search temporarily disabled, using curated resources');

  // 2. Online courses and tutorials (web search temporarily disabled)
  // 3. Practice platforms (web search temporarily disabled)

  // 4. Add curated tool recommendations based on skills
  const toolRecommendations = getToolRecommendations(skills, topics);
  recommendations.push(...toolRecommendations);

  // 5. Filter and rank recommendations
  const filteredRecommendations = recommendations
    .filter(rec => rec.relevance > 0.3) // Only relevant recommendations
    .sort((a, b) => b.relevance - a.relevance) // Sort by relevance
    .slice(0, 15); // Top 15 recommendations

  console.log('✅ Generated', filteredRecommendations.length, 'resource recommendations');
  
  return filteredRecommendations;
}

function calculateRelevance(
  source: any,
  topics: string[],
  skills: string[]
): number {
  let relevance = 0;
  const titleLower = source.title.toLowerCase();
  const snippetLower = (source.snippet || '').toLowerCase();
  
  // Check topic matches
  topics.forEach(topic => {
    if (titleLower.includes(topic.toLowerCase())) relevance += 0.3;
    if (snippetLower.includes(topic.toLowerCase())) relevance += 0.2;
  });
  
  // Check skill matches
  skills.forEach(skill => {
    if (titleLower.includes(skill.toLowerCase())) relevance += 0.2;
    if (snippetLower.includes(skill.toLowerCase())) relevance += 0.1;
  });
  
  // Bonus for educational domains
  const educationalDomains = ['coursera', 'edx', 'khan', 'udemy', 'youtube', 'github', 'stackoverflow'];
  if (source.url) {
    const urlLower = source.url.toLowerCase();
    educationalDomains.forEach(domain => {
      if (urlLower.includes(domain)) relevance += 0.1;
    });
  }
  
  return Math.min(relevance, 1);
}

function getToolRecommendations(skills: string[], topics: string[]): ResourceRecommendation[] {
  const tools: ResourceRecommendation[] = [];
  
  // Programming tools
  if (skills.some(skill => skill.toLowerCase().includes('programming') || skill.toLowerCase().includes('coding'))) {
    tools.push({
      id: 'tool-github',
      title: 'GitHub',
      type: 'tool',
      url: 'https://github.com',
      description: 'Version control and collaboration platform for developers',
      relevance: 0.9,
      difficulty: 'intermediate',
      topics: topics.filter(t => t.toLowerCase().includes('programming')),
      cost: 'free'
    });
    
    tools.push({
      id: 'tool-vscode',
      title: 'Visual Studio Code',
      type: 'tool',
      url: 'https://code.visualstudio.com',
      description: 'Free code editor with extensive extensions',
      relevance: 0.8,
      difficulty: 'beginner',
      topics: topics.filter(t => t.toLowerCase().includes('programming')),
      cost: 'free'
    });
  }
  
  // Data science tools
  if (topics.some(topic => topic.toLowerCase().includes('data') || topic.toLowerCase().includes('machine learning'))) {
    tools.push({
      id: 'tool-jupyter',
      title: 'Jupyter Notebook',
      type: 'tool',
      url: 'https://jupyter.org',
      description: 'Interactive computing environment for data science',
      relevance: 0.95,
      difficulty: 'intermediate',
      topics: topics.filter(t => t.toLowerCase().includes('data')),
      cost: 'free'
    });
  }
  
  // Practice platforms
  if (skills.some(skill => skill.toLowerCase().includes('algorithm') || skill.toLowerCase().includes('programming'))) {
    tools.push({
      id: 'tool-leetcode',
      title: 'LeetCode',
      type: 'practice',
      url: 'https://leetcode.com',
      description: 'Coding interview preparation and algorithm practice',
      relevance: 0.85,
      difficulty: 'intermediate',
      topics: topics.filter(t => t.toLowerCase().includes('algorithm')),
      cost: 'free'
    });
  }
  
  return tools.filter(tool => tool.relevance > 0.5);
}




