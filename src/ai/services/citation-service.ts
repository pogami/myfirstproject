/**
 * Citation Service for CourseConnect AI
 * 
 * This service generates MLA citations and checks for plagiarism
 * using the existing AI and web scraping infrastructure.
 */

import { searchCurrentInformation } from './web-search-service';
import { scrapeWebPage, extractUrlsFromText } from './web-scraping-service';
import { provideStudyAssistanceWithFallback } from './dual-ai-service';
import * as crypto from 'crypto-js';

export interface CitationData {
  title: string;
  author: string;
  publisher: string;
  publicationDate: string;
  url: string;
  siteName: string;
  description?: string;
  lastModified?: string;
}

export interface MLACitation {
  inText: string;
  worksCited: string;
  sourceType: string;
  confidence: number;
}

export interface PlagiarismResult {
  isPlagiarized: boolean;
  similarityScore: number;
  matchedSources: Array<{
    url: string;
    title: string;
    similarity: number;
    matchedText: string;
    snippet: string;
  }>;
  suggestions: string[];
  aiDetection?: {
    isLikelyAI: boolean;
    confidence: number;
    reasoning: string[];
  };
  detailedAnalysis?: {
    writingStyle: string;
    vocabularyComplexity: number;
    coherenceScore: number;
    patterns: string[];
  };
}

export interface CitationRequest {
  text: string;
  url?: string;
  sourceType?: 'website' | 'book' | 'journal' | 'newspaper' | 'video' | 'image' | 'auto';
  manualData?: Partial<CitationData>;
}

/**
 * Generate MLA citation from URL or manual data
 */
export async function generateMLACitation(request: CitationRequest): Promise<MLACitation> {
  console.log('Citation generation started with request:', request);
  
  try {
    let citationData: CitationData;

    if (request.url) {
      console.log('Processing URL:', request.url);
      // Scrape citation data from URL
      citationData = await scrapeCitationData(request.url);
    } else if (request.manualData) {
      console.log('Processing manual data:', request.manualData);
      // Use manual data
      citationData = {
        title: request.manualData.title || 'Untitled',
        author: request.manualData.author || 'Unknown Author',
        publisher: request.manualData.publisher || 'Unknown Publisher',
        publicationDate: request.manualData.publicationDate || new Date().toISOString().split('T')[0],
        url: request.manualData.url || '',
        siteName: request.manualData.siteName || 'Unknown Site',
        description: request.manualData.description,
        lastModified: request.manualData.lastModified
      };
    } else {
      console.log('Processing text data:', request.text);
      // Create minimal citation data from text
      citationData = {
        title: request.text || 'Untitled',
        author: 'Unknown Author',
        publisher: 'Unknown Publisher',
        publicationDate: new Date().toISOString().split('T')[0],
        url: '',
        siteName: 'Unknown Site',
        description: request.text,
        lastModified: new Date().toISOString()
      };
    }

    console.log('Citation data prepared:', citationData);

    // Determine source type
    const sourceType = request.sourceType || detectSourceType(citationData);
    console.log('Source type determined:', sourceType);

    // Generate MLA citation using AI
    console.log('Generating citation with AI...');
    const citation = await generateCitationWithAI(citationData, sourceType);
    console.log('Citation generated successfully:', citation);

    return citation;
  } catch (error) {
    console.error('Citation generation error:', error);
    // Return a fallback citation instead of throwing
    const fallbackCitation = {
      inText: `("${request.text || 'Source'}")`,
      worksCited: `"${request.text || 'Source'}." Unknown Publisher, ${new Date().toLocaleDateString()}.`,
      sourceType: request.sourceType || 'website',
      confidence: 30
    };
    console.log('Returning fallback citation:', fallbackCitation);
    return fallbackCitation;
  }
}

/**
 * Scrape citation data from URL
 */
async function scrapeCitationData(url: string): Promise<CitationData> {
  try {
    const result = await scrapeWebPage(url);
    
    if (!result.success || !result.content) {
      console.warn('Web scraping failed, using fallback data extraction');
      // Fallback: extract basic info from URL
      const urlObj = new URL(url);
      const siteName = urlObj.hostname.replace('www.', '');
      
      return {
        title: `Article from ${siteName}`,
        author: 'Unknown Author',
        publisher: siteName,
        publicationDate: new Date().toISOString().split('T')[0],
        url: url,
        siteName: siteName,
        description: `Content from ${siteName}`,
        lastModified: new Date().toISOString()
      };
    }

    const content = result.content;
    
    // Extract domain name
    const urlObj = new URL(url);
    const siteName = urlObj.hostname.replace('www.', '');

    return {
      title: content.title || 'Untitled',
      author: 'Unknown Author', // Will be enhanced with AI
      publisher: siteName,
      publicationDate: content.timestamp.split('T')[0],
      url: url,
      siteName: siteName,
      description: content.summary,
      lastModified: content.timestamp
    };
  } catch (error) {
    console.error('Error scraping citation data:', error);
    // Return minimal data instead of throwing
    const urlObj = new URL(url);
    const siteName = urlObj.hostname.replace('www.', '');
    
    return {
      title: `Article from ${siteName}`,
      author: 'Unknown Author',
      publisher: siteName,
      publicationDate: new Date().toISOString().split('T')[0],
      url: url,
      siteName: siteName,
      description: `Content from ${siteName}`,
      lastModified: new Date().toISOString()
    };
  }
}

/**
 * Detect source type from citation data
 */
function detectSourceType(data: CitationData): string {
  const url = data.url.toLowerCase();
  const title = data.title.toLowerCase();
  const siteName = data.siteName.toLowerCase();

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'video';
  } else if (url.includes('news') || siteName.includes('news') || title.includes('news')) {
    return 'newspaper';
  } else if (url.includes('jstor') || url.includes('scholar') || url.includes('academic')) {
    return 'journal';
  } else if (url.includes('amazon') || url.includes('books') || title.includes('book')) {
    return 'book';
  } else {
    return 'website';
  }
}

/**
 * Generate MLA citation using AI
 */
async function generateCitationWithAI(data: CitationData, sourceType: string): Promise<MLACitation> {
  console.log('Starting AI citation generation for:', data.title);
  
  const prompt = `Generate an accurate MLA citation for the following source:

Source Type: ${sourceType}
Title: ${data.title}
Author: ${data.author}
Publisher/Site: ${data.publisher}
Publication Date: ${data.publicationDate}
URL: ${data.url}
Site Name: ${data.siteName}
${data.description ? `Description: ${data.description}` : ''}
${data.lastModified ? `Last Modified: ${data.lastModified}` : ''}

Please provide:
1. In-text citation (parenthetical format)
2. Works Cited entry (full citation)
3. Confidence level (0-100) based on available data

Follow the latest MLA 9th edition guidelines. If author is "Unknown Author", use the title for in-text citation.
If publication date is missing, use "n.d." for "no date".
For websites, include the access date if the publication date is unclear.

Format your response as JSON:
{
  "inText": "in-text citation here",
  "worksCited": "full works cited entry here", 
  "sourceType": "${sourceType}",
  "confidence": 85
}`;

  try {
    console.log('Calling AI service with prompt...');
    const response = await provideStudyAssistanceWithFallback({
      question: prompt,
      context: 'MLA Citation Generation',
      conversationHistory: []
    });
    
    console.log('AI response received:', response.answer);

    // Parse AI response to extract JSON
    const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        console.log('Parsing JSON from AI response...');
        const citation = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed citation:', citation);
        return {
          inText: citation.inText || `("${data.title}")`,
          worksCited: citation.worksCited || generateFallbackCitation(data, sourceType),
          sourceType: citation.sourceType || sourceType,
          confidence: citation.confidence || 70
        };
      } catch (parseError) {
        console.warn('Failed to parse AI JSON response:', parseError);
        // Fallback to manual parsing
        return generateFallbackCitationFromAI(response.answer, data, sourceType);
      }
    } else {
      console.log('No JSON found in AI response, using fallback parsing');
      // Fallback if AI doesn't return JSON
      return generateFallbackCitationFromAI(response.answer, data, sourceType);
    }
  } catch (error) {
    console.error('AI citation generation failed:', error);
    // Return a proper fallback citation
    const fallback = {
      inText: `("${data.title}")`,
      worksCited: generateFallbackCitation(data, sourceType),
      sourceType: sourceType,
      confidence: 50
    };
    console.log('Returning fallback citation:', fallback);
    return fallback;
  }
}

/**
 * Generate fallback citation from AI response text
 */
function generateFallbackCitationFromAI(aiResponse: string, data: CitationData, sourceType: string): MLACitation {
  // Try to extract citation information from AI response
  const inTextMatch = aiResponse.match(/in-text[:\s]*["']([^"']+)["']/i) || 
                     aiResponse.match(/\([^)]+\)/g);
  const worksCitedMatch = aiResponse.match(/works cited[:\s]*["']([^"']+)["']/i) ||
                         aiResponse.match(/"[^"]+"/g);

  return {
    inText: inTextMatch ? inTextMatch[0] : `("${data.title}")`,
    worksCited: worksCitedMatch ? worksCitedMatch[0] : generateFallbackCitation(data, sourceType),
    sourceType: sourceType,
    confidence: 60
  };
}

/**
 * Generate fallback MLA citation
 */
function generateFallbackCitation(data: CitationData, sourceType: string): string {
  const author = data.author !== 'Unknown Author' ? data.author : '';
  const title = data.title;
  const siteName = data.siteName;
  const url = data.url;
  const date = data.publicationDate || 'n.d.';
  const accessDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  switch (sourceType) {
    case 'website':
      if (author) {
        return `${author}. "${title}." ${siteName}, ${date}, ${url}. Accessed ${accessDate}.`;
      } else {
        return `"${title}." ${siteName}, ${date}, ${url}. Accessed ${accessDate}.`;
      }
    
    case 'journal':
      return `${author}. "${title}." ${siteName}, ${date}, ${url}.`;
    
    case 'newspaper':
      return `${author}. "${title}." ${siteName}, ${date}, ${url}.`;
    
    case 'book':
      return `${author}. ${title}. ${siteName}, ${date}.`;
    
    case 'video':
      return `"${title}." ${siteName}, ${date}, ${url}.`;
    
    default:
      return `${author}. "${title}." ${siteName}, ${date}, ${url}.`;
  }
}

/**
 * Check text for plagiarism by searching for similar content and AI detection
 */
export async function checkPlagiarism(text: string, minLength: number = 50): Promise<PlagiarismResult> {
  try {
    if (text.length < minLength) {
      return {
        isPlagiarized: false,
        similarityScore: 0,
        matchedSources: [],
        suggestions: ['Text is too short for reliable plagiarism detection.']
      };
    }

    // Run plagiarism and AI detection in parallel
    const [plagiarismResult, aiDetectionResult, detailedAnalysis] = await Promise.all([
      checkForPlagiarism(text, minLength),
      detectAIContent(text),
      analyzeWritingStyle(text)
    ]);

    // Combine results
    const suggestions = generateComprehensiveSuggestions(
      plagiarismResult.isPlagiarized, 
      plagiarismResult.similarityScore, 
      plagiarismResult.matchedSources.length,
      aiDetectionResult?.isLikelyAI || false,
      aiDetectionResult?.confidence || 0
    );

    return {
      ...plagiarismResult,
      suggestions,
      aiDetection: aiDetectionResult,
      detailedAnalysis
    };

  } catch (error) {
    console.error('Plagiarism check error:', error);
    return {
      isPlagiarized: false,
      similarityScore: 0,
      matchedSources: [],
      suggestions: ['Unable to complete plagiarism check due to technical error.']
    };
  }
}

/**
 * Check for plagiarism using web search
 */
async function checkForPlagiarism(text: string, minLength: number): Promise<Omit<PlagiarismResult, 'aiDetection' | 'detailedAnalysis'>> {
    // Extract key phrases for searching
    const keyPhrases = extractKeyPhrases(text);
    
    // Search for each key phrase
    const searchResults = await Promise.all(
      keyPhrases.slice(0, 5).map(phrase => 
        searchCurrentInformation(`"${phrase}"`)
      )
    );

    // Analyze results for similarity
    const matchedSources = [];
    let totalSimilarity = 0;
    let matchCount = 0;

    for (const searchResult of searchResults) {
      for (const result of searchResult.results) {
        const similarity = calculateTextSimilarity(text, result.snippet);
        
        if (similarity > 30) { // 30% similarity threshold
          matchedSources.push({
            url: result.url,
            title: result.title,
            similarity: similarity,
            matchedText: result.snippet,
            snippet: result.snippet.substring(0, 200) + '...'
          });
          
          totalSimilarity += similarity;
          matchCount++;
        }
      }
    }

    const averageSimilarity = matchCount > 0 ? totalSimilarity / matchCount : 0;
    const isPlagiarized = averageSimilarity > 50 || matchedSources.length > 2;

    return {
      isPlagiarized,
      similarityScore: Math.round(averageSimilarity),
      matchedSources: matchedSources.slice(0, 10), // Limit to top 10 matches
    suggestions: [] // Will be filled by main function
  };
}

/**
 * Detect AI-generated content
 */
async function detectAIContent(text: string): Promise<PlagiarismResult['aiDetection']> {
  try {
    // AI detection prompts and patterns
    const aiDetectionPrompt = `Analyze this text for AI generation patterns. Rate on scale 0-100%. 
    Look for: repetitive structures, overly formal tone, lack of personal voice, 
    perfect grammar without natural errors, thematic coherence without deviation.
    
    Text: "${text.substring(0, 1000)}"
    
    Respond with: CONFIDENCE_SCORE: [0-100], REASONING: [brief explanation]`;

    const response = await provideStudyAssistanceWithFallback({
      userInput: aiDetectionPrompt,
      context: 'ai-detection'
    });

    // Parse AI response
    const confidenceMatch = response.match(/CONFIDENCE_SCORE:\s*(\d+)/i);
    const reasoningMatch = response.match(/REASONING:\s*(.+)/i);
    
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
    const reasoning = reasoningMatch ? reasoningMatch[1] : 'Unable to determine';

    // Additional pattern analysis
    const patterns = analyzeAIPatterns(text);
    const aiScore = patterns.reduce((acc, pattern) => acc + pattern.score, 0) / patterns.length;

    const finalConfidence = Math.max(confidence, aiScore);
    const isLikelyAI = finalConfidence > 60;

    return {
      isLikelyAI,
      confidence: finalConfidence,
      reasoning: [reasoning, ...patterns.filter(p => p.score > 40).map(p => p.description)]
    };

  } catch (error) {
    console.error('AI detection error:', error);
    // Fallback to pattern analysis
    const patterns = analyzeAIPatterns(text);
    const avgScore = patterns.reduce((acc, pattern) => acc + pattern.score, 0) / patterns.length;
    
    return {
      isLikelyAI: avgScore > 60,
      confidence: avgScore,
      reasoning: ['AI detection via pattern analysis']
    };
  }
}

/**
 * Analyze patterns that might indicate AI generation
 */
function analyzeAIPatterns(text: string): Array<{score: number, description: string}> {
  const patterns = [];
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/);

  // Check for repetitive sentence starters
  const starters = sentences.slice(0, 10).map(s => s.trim().split(' ')[0].toLowerCase());
  const commonStarters = ['furthermore', 'moreover', 'additionally', 'consequently', 'therefore'];
  const repetitiveStarters = commonStarters.filter(start => 
    starters.filter(s => s.includes(start)).length > 1
  );
  
  if (repetitiveStarters.length > 2) {
    patterns.push({
      score: 25,
      description: `Repetitive sentence starters: ${repetitiveStarters.join(', ')}`
    });
  }

  // Check for overly formal tone
  const formalWords = ['utilize', 'commence', 'facilitate', 'subsequent', 'aforementioned', 'whereby', 'thus', 'hence'];
  const formalCount = words.filter(word => formalWords.includes(word)).length;
  
  if (formalCount > words.length * 0.05) {
    patterns.push({
      score: 30,
      description: `Overly formal vocabulary (${formalCount} instances)`
    });
  }

  // Check sentence length variance (AI tends to have consistent lengths)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const lengthVariance = calculateVariance(sentenceLengths);
  
  if (lengthVariance < 10) {
    patterns.push({
      score: 20,
      description: 'Unusually consistent sentence lengths'
    });
  }

  // Check for transitional phrases
  const transitions = ['however', 'moreover', 'furthermore', 'nevertheless', 'consequently'];
  const transitionCount = words.filter(word => transitions.includes(word)).length;
  
  if (transitionCount > words.length * 0.03) {
    patterns.push({
      score: 15,
      description: `Excessive transitional phrases (${transitionCount} instances)`
    });
  }

  // Check for hedging language (AI often uses hedging)
  const hedgingPhrases = ['it is important to note', 'it should be noted', 'it is worth mentioning', 'generally speaking'];
  const hedgingCount = hedgingPhrases.filter(phrase => text.toLowerCase().includes(phrase)).length;
  
  if (hedgingCount > 1) {
    patterns.push({
      score: 25,
      description: `Excessive hedging language (${hedgingCount} instances)`
    });
  }

  return patterns;
}

/**
 * Calculate variance in array of numbers
 */
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
}

/**
 * Analyze writing style and coherence
 */
async function analyzeWritingStyle(text: string): Promise<PlagiarismResult['detailedAnalysis']> {
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Vocabulary complexity analysis
  const uniqueWords = new Set(words);
  const vocabularyComplexity = (uniqueWords.size / words.length) * 100;
  
  // Sentence structure analysis
  const avgSentenceLength = words.length / sentences.length;
  const writingStyle = avgSentenceLength > 20 ? 'Complex' : avgSentenceLength > 15 ? 'Moderate' : 'Simple';
  
  // Coherence analysis (check for topic consistency)
  const coherenceScore = await calculateCoherence(text);
  
  // Pattern detection
  const patterns = [
    vocabularyComplexity > 60 ? 'High vocabulary diversity' : 'Moderate vocabulary',
    avgSentenceLength > 15 ? 'Complex sentence structure' : 'Simple sentence structure',
    coherenceScore > 70 ? 'Coherent flow' : 'Some coherence issues'
  ];

  return {
    writingStyle,
    vocabularyComplexity: Math.round(vocabularyComplexity),
    coherenceScore: Math.round(coherenceScore),
    patterns
  };
}

/**
 * Calculate text coherence score
 */
async function calculateCoherence(text: string): Promise<number> {
  try {
    // Use AI to analyze coherence
    const coherencePrompt = `Rate the coherence and flow of this text from 0-100. 
    Consider: logical progression, topic consistency, sentence transitions, 
    and overall readability.
    
    Text: "${text.substring(0, 800)}"`;
    
    const response = await provideStudyAssistanceWithFallback({
      userInput: coherencePrompt,
      context: 'coherence-analysis'
    });
    
    const scoreMatch = response.match(/(\d+)/);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75; // Default moderate score
    
  } catch (error) {
    return 75; // Default moderate score if analysis<｜tool▁sep｜> fails
  }
}

/**
 * Extract key phrases from text for searching
 */
function extractKeyPhrases(text: string): string[] {
  // Remove common words and extract meaningful phrases
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'shall', 'from', 'into', 'onto', 'upon'
  ]);

  const meaningfulWords = words.filter(word => !stopWords.has(word));
  
  // Create phrases of 3-5 words
  const phrases = [];
  for (let i = 0; i < meaningfulWords.length - 2; i++) {
    const phrase = meaningfulWords.slice(i, i + 3).join(' ');
    if (phrase.length > 10) {
      phrases.push(phrase);
    }
  }

  return phrases.slice(0, 10); // Return top 10 phrases
}

/**
 * Calculate text similarity using simple word overlap
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Generate comprehensive suggestions for plagiarism and AI detection
 */
function generateComprehensiveSuggestions(
  isPlagiarized: boolean, 
  similarity: number, 
  matchCount: number,
  isLikelyAI: boolean,
  aiConfidence: number
): string[] {
  const suggestions = [];

  // Plagiarism suggestions
  if (isPlagiarized) {
    suggestions.push('⚠️ High similarity detected. Consider rewriting these sections.');
    suggestions.push('📝 Use proper citations for any borrowed ideas or quotes.');
    suggestions.push('🔄 Paraphrase content in your own words while maintaining the original meaning.');
  } else if (similarity > 30) {
    suggestions.push('✅ Low similarity detected. Your work appears original.');
    suggestions.push('📚 Remember to cite any sources you reference.');
  } else {
    suggestions.push('✅ No significant similarity found. Your work appears original.');
  }

  if (matchCount > 0) {
    suggestions.push(`🔍 Found ${matchCount} potential source(s) with similar content.`);
  }

  // AI detection suggestions
  if (isLikelyAI && aiConfidence > 60) {
    suggestions.push('🤖 AI-generated content detected with high confidence.');
    suggestions.push('🧠 Consider adding personal insights and human perspective.');
    suggestions.push('✍️ Rewrite in your own voice to make it more authentically human.');
    suggestions.push('💡 Include personal experiences or examples to distinguish from AI patterns.');
  } else if (aiConfidence > 40) {
    suggestions.push('🤖 Some AI generation markers detected.');
    suggestions.push('✍️ Consider making the writing more conversational and personal.');
  }

  suggestions.push('💡 Always use proper MLA citations for any sources you reference.');
  suggestions.push('✍️ When in doubt, cite your sources to maintain academic integrity.');

  return suggestions;
}

/**
 * Generate citation for multiple sources
 */
export async function generateMultipleCitations(requests: CitationRequest[]): Promise<MLACitation[]> {
  const citations = await Promise.all(
    requests.map(request => generateMLACitation(request))
  );
  
  return citations;
}

/**
 * Format citations for export
 */
export function formatCitationsForExport(citations: MLACitation[]): string {
  const worksCited = citations.map((citation, index) => 
    `${index + 1}. ${citation.worksCited}`
  ).join('\n\n');

  const inTextCitations = citations.map((citation, index) => 
    `${index + 1}. ${citation.inText}`
  ).join('\n');

  return `WORKS CITED\n\n${worksCited}\n\nIN-TEXT CITATIONS\n\n${inTextCitations}`;
}
