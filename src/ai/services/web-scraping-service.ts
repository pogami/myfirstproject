/**
 * Web Scraping Service for CourseConnect AI
 * 
 * This service allows the AI to read and analyze web content
 * from URLs provided by users.
 */

export interface WebPageContent {
  title: string;
  content: string;
  url: string;
  summary: string;
  timestamp: string;
  wordCount: number;
  publicationDate?: string;
  metadata?: {
    datePublished?: string;
    dateModified?: string;
    author?: string;
    description?: string;
  };
}

export interface WebScrapingResult {
  success: boolean;
  content?: WebPageContent;
  error?: string;
}

/**
 * Extract text content from HTML
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Extract metadata from HTML
 */
function extractMetadata(html: string) {
  const metadata: any = {};
  
  // Extract meta tags
  const metaTags = html.match(/<meta[^>]*>/gi) || [];
  
  for (const tag of metaTags) {
    // Extract property and content
    const propertyMatch = tag.match(/property=["']([^"']*)["']/i);
    const nameMatch = tag.match(/name=["']([^"']*)["']/i);
    const contentMatch = tag.match(/content=["']([^"']*)["']/i);
    
    if (contentMatch) {
      const content = contentMatch[1];
      const property = propertyMatch?.[1] || nameMatch?.[1];
      
      if (property) {
        switch (property.toLowerCase()) {
          case 'article:published_time':
          case 'datepublished':
          case 'pubdate':
            metadata.datePublished = content;
            break;
          case 'article:modified_time':
          case 'datemodified':
          case 'lastmod':
            metadata.dateModified = content;
            break;
          case 'author':
          case 'article:author':
            metadata.author = content;
            break;
          case 'description':
            metadata.description = content;
            break;
        }
      }
    }
  }
  
  // Extract from JSON-LD structured data
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd.datePublished) metadata.datePublished = jsonLd.datePublished;
      if (jsonLd.dateModified) metadata.dateModified = jsonLd.dateModified;
      if (jsonLd.author?.name) metadata.author = jsonLd.author.name;
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }
  
  return metadata;
}

/**
 * Generate a summary of the content
 */
function generateSummary(content: string, maxLength: number = 500): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Try to find a good breaking point (end of sentence)
  const truncated = content.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return content.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

/**
 * Scrape a web page and extract its content
 */
export async function scrapeWebPage(url: string): Promise<WebScrapingResult> {
  try {
    console.log('🔍 Scraping web page:', url);
    
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
      };
    }
    
    // Fetch the web page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CourseConnect-AI/1.0; +https://courseconnectai.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch the page. HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    // Extract main content (try different strategies)
    let content = '';
    
    // Strategy 1: Look for main content areas
    const mainContentSelectors = [
      'main', 'article', '[role="main"]', '.content', '.post-content', 
      '.entry-content', '.article-content', '.main-content', '#content'
    ];
    
    for (const selector of mainContentSelectors) {
      const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\/${selector}>`, 'i');
      const match = html.match(regex);
      if (match && match[1].length > content.length) {
        content = match[1];
      }
    }
    
    // Strategy 2: If no main content found, extract from body
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1];
      } else {
        content = html;
      }
    }
    
    // Extract text from HTML
    const textContent = extractTextFromHTML(content);
    
    if (!textContent || textContent.length < 50) {
      return {
        success: false,
        error: 'Could not extract meaningful content from the page. The page might be empty or use JavaScript to load content.'
      };
    }
    
    // Generate summary
    const summary = generateSummary(textContent);
    
    // Extract metadata
    const metadata = extractMetadata(html);
    
    const result: WebPageContent = {
      title: title,
      content: textContent,
      url: url,
      summary: summary,
      timestamp: new Date().toISOString(),
      wordCount: textContent.split(/\s+/).length,
      publicationDate: metadata.datePublished,
      metadata: metadata
    };
    
    console.log('✅ Successfully scraped page:', {
      title: result.title,
      wordCount: result.wordCount,
      url: result.url
    });
    
    return {
      success: true,
      content: result
    };
    
  } catch (error) {
    console.error('❌ Web scraping failed:', error);
    
    let errorMessage = 'Failed to scrape the web page.';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'The page took too long to load. Please try a different URL.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Could not access the URL. Please check if the link is correct and accessible.';
      } else {
        errorMessage = `Scraping error: ${error.message}`;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Check if a message contains URLs
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const urls = text.match(urlRegex) || [];
  
  // Filter out common non-content URLs
  const filteredUrls = urls.filter(url => {
    const lowerUrl = url.toLowerCase();
    return !lowerUrl.includes('youtube.com/watch') && 
           !lowerUrl.includes('youtu.be/') &&
           !lowerUrl.includes('instagram.com/') &&
           !lowerUrl.includes('twitter.com/') &&
           !lowerUrl.includes('facebook.com/') &&
           !lowerUrl.includes('tiktok.com/') &&
           !lowerUrl.includes('linkedin.com/') &&
           !lowerUrl.includes('reddit.com/') &&
           !lowerUrl.includes('discord.gg/') &&
           !lowerUrl.includes('zoom.us/') &&
           !lowerUrl.includes('meet.google.com/') &&
           !lowerUrl.includes('teams.microsoft.com/');
  });
  
  return filteredUrls;
}

/**
 * Scrape multiple URLs and combine their content
 */
export async function scrapeMultiplePages(urls: string[]): Promise<{
  successful: WebPageContent[];
  failed: { url: string; error: string }[];
}> {
  const results = await Promise.allSettled(
    urls.map(url => scrapeWebPage(url))
  );
  
  const successful: WebPageContent[] = [];
  const failed: { url: string; error: string }[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success && result.value.content) {
      successful.push(result.value.content);
    } else {
      const error = result.status === 'rejected' 
        ? result.reason?.message || 'Unknown error'
        : result.value.error || 'Failed to scrape';
      failed.push({ url: urls[index], error });
    }
  });
  
  return { successful, failed };
}

/**
 * Format scraped content for AI consumption
 */
export function formatScrapedContentForAI(scrapedContent: WebPageContent[]): string {
  if (scrapedContent.length === 0) {
    return '';
  }
  
  const formattedContent = scrapedContent.map((page, index) => {
    return `**Page ${index + 1}: ${page.title}**
URL: ${page.url}
Content: ${page.content}
Word Count: ${page.wordCount}
Scraped: ${new Date(page.timestamp).toLocaleString()}

---`;
  }).join('\n\n');
  
  return `\n\n**Web Content Analysis:**
${formattedContent}

**Instructions for AI:** Use this web content to answer the user's questions. Reference specific information from the pages when relevant. If the content doesn't contain the information needed, let the user know.`;
}
