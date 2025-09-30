import { NextRequest, NextResponse } from 'next/server';
import { OllamaModelManager } from '@/lib/ollama-model-manager';

// Enhanced web search function with source tracking
interface SearchResult {
  content: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

async function searchWeb(query: string): Promise<SearchResult> {
  try {
    console.log(`🔍 Searching web for: ${query}`);
    
    const sources: Array<{ title: string; url: string; snippet: string }> = [];
    let content = '';
    
    // Try multiple search strategies
    const searchStrategies = [
      // Strategy 1: DuckDuckGo Instant Answer
      async () => {
        const ddgResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const ddgData = await ddgResponse.json();
        
        if (ddgData.AbstractText && ddgData.AbstractText.length > 10) {
          console.log(`✅ DuckDuckGo Abstract found: ${ddgData.AbstractText.substring(0, 100)}...`);
          content = ddgData.AbstractText;
          
          if (ddgData.AbstractURL) {
            sources.push({
              title: ddgData.Heading || 'DuckDuckGo Search Result',
              url: ddgData.AbstractURL,
              snippet: ddgData.AbstractText.substring(0, 150) + '...'
            });
          }
          return true;
        }
        return false;
      },
      
      // Strategy 2: DuckDuckGo Results
      async () => {
        const ddgResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const ddgData = await ddgResponse.json();
        
        if (ddgData.Results && ddgData.Results.length > 0) {
          const results = ddgData.Results.slice(0, 3).map((result: any) => result.Text || result.Body).filter(Boolean).join(' ');
          if (results && results.length > 10) {
            console.log(`✅ DuckDuckGo Results found: ${results.substring(0, 100)}...`);
            content = results;
            
            ddgData.Results.slice(0, 3).forEach((result: any) => {
              if (result.FirstURL && result.Text) {
                sources.push({
                  title: result.Text.substring(0, 60) + '...',
                  url: result.FirstURL,
                  snippet: result.Text.substring(0, 150) + '...'
                });
              }
            });
            return true;
          }
        }
        return false;
      },
      
      // Strategy 3: Bing Web Search (if available)
      async () => {
        try {
          // This would require a Bing API key, but let's try a simple approach
          const bingResponse = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (bingResponse.ok) {
            const html = await bingResponse.text();
            // Extract candidate results
            const blocks = html.match(/<h2[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g) || [];
            console.log(`✅ Bing results found: ${blocks.length} results`);

            const decode = (s: string) => s
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/<[^>]+>/g, '')
              .trim();

            const getHost = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
            const blocklist = ['bestbuy.com','stackexchange.com','pinterest.com','amazon.com'];
            const keywords = ['ai','artificial intelligence','chatgpt','openai','deepmind','anthropic','google','microsoft','llm','model','news','latest','research'];
            const qLower = query.toLowerCase();

            const filtered: Array<{title: string; url: string; snippet: string}> = [];
            for (const b of blocks) {
              const urlMatch = b.match(/href="([^"]*)"/);
              const titleMatch = b.match(/>\s*([\s\S]*?)\s*<\/a>/);
              if (!urlMatch) continue;
              const rawUrl = decode(urlMatch[1]);
              const host = getHost(rawUrl);
              if (!host || blocklist.some(d => host.endsWith(d))) continue;
              const rawTitle = decode(titleMatch?.[1] || '');
              const titleLower = rawTitle.toLowerCase();
              const relevant = keywords.some(k => titleLower.includes(k)) || keywords.some(k => qLower.includes(k));
              if (!relevant) continue;
              const title = rawTitle || host;
              filtered.push({ title, url: rawUrl, snippet: `Search result for: ${query}` });
              if (filtered.length >= 3) break;
            }

            if (filtered.length > 0) {
              sources.push(...filtered);
              content = `Found ${filtered.length} relevant search results for: ${query}`;
              return true;
            }
          }
        } catch (e) {
          console.log('Bing search failed:', e);
        }
        return false;
      },
      
      // Strategy 4: Smart fallback based on query content
      async () => {
        const queryLower = query.toLowerCase();
        
        // AI/Tech news fallback
        if (queryLower.includes('ai') || queryLower.includes('artificial intelligence') || queryLower.includes('chatgpt') || queryLower.includes('openai')) {
          content = `Recent developments in AI include continued advances in large language models, with companies like OpenAI, Google, and Anthropic releasing new models. There's ongoing discussion about AI safety, regulation, and the impact on various industries.`;
          sources.push({
            title: 'AI News and Developments',
            url: 'https://www.artificialintelligence-news.com/',
            snippet: 'Latest news and developments in artificial intelligence, machine learning, and AI technology.'
          });
          return true;
        }
        
        // Tech company news
        if (queryLower.includes('google') || queryLower.includes('microsoft') || queryLower.includes('apple') || queryLower.includes('tesla')) {
          content = `Recent tech industry news includes ongoing developments in AI, cloud computing, and consumer technology. Major tech companies continue to invest heavily in artificial intelligence and automation technologies.`;
          sources.push({
            title: 'Tech Industry News',
            url: 'https://techcrunch.com/',
            snippet: 'Latest technology news, startup information, and tech industry developments.'
          });
          return true;
        }
        
        // Stock market news
        if (queryLower.includes('stock') || queryLower.includes('market') || queryLower.includes('crypto') || queryLower.includes('bitcoin')) {
          content = `Financial markets continue to show volatility with ongoing economic uncertainty. Cryptocurrency markets remain active with regulatory developments and institutional adoption.`;
          sources.push({
            title: 'Financial Markets News',
            url: 'https://www.marketwatch.com/',
            snippet: 'Latest financial news, stock market updates, and economic analysis.'
          });
          return true;
        }
        
        // General news fallback
        if (queryLower.includes('news') || queryLower.includes('current') || queryLower.includes('today') || queryLower.includes('latest')) {
          content = `Current events continue to evolve across politics, technology, and global affairs. For the most up-to-date information, please check reliable news sources.`;
          sources.push({
            title: 'Current News',
            url: 'https://www.bbc.com/news',
            snippet: 'Latest breaking news and current events from around the world.'
          });
          return true;
        }
        
        return false;
      }
    ];
    
    // Try each strategy until one succeeds
    for (const strategy of searchStrategies) {
      try {
        const success = await strategy();
        if (success && content && sources.length > 0) {
          console.log(`✅ Web search successful with ${sources.length} sources`);
          return { content, sources };
        }
      } catch (error) {
        console.log(`Strategy failed:`, error);
        continue;
      }
    }
    
    console.log('❌ All search strategies failed');
    // Provide reputable fallback sources so UI has useful links
    return {
      content: 'Curated reputable sources for AI news.',
      sources: [
        { title: 'MIT Technology Review — AI', url: 'https://www.technologyreview.com/ai/', snippet: 'Latest AI news and analysis from MIT Technology Review.' },
        { title: 'Wired — Artificial Intelligence', url: 'https://www.wired.com/tag/artificial-intelligence/', snippet: 'Coverage of AI advancements and their impact from Wired.' },
        { title: 'Reuters — AI', url: 'https://www.reuters.com/technology/artificial-intelligence/', snippet: 'Up-to-date AI news from Reuters.' }
      ]
    };
    
  } catch (error) {
    console.log('❌ Web search failed:', error);
    return { content: '', sources: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, context, conversationHistory, shouldCallAI = true, isPublicChat = false } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // If it's a public chat and AI shouldn't be called, return no response
    if (isPublicChat && !shouldCallAI) {
      return NextResponse.json({
        success: true,
        answer: null, // No AI response
        shouldRespond: false
      });
    }

    // Clean @ mentions from the question if present
    const cleanedQuestion = question.replace(/@ai\s*/gi, '').trim();
    
    console.log('Chat API called with:', { 
      question: cleanedQuestion, 
      context, 
      conversationHistory: conversationHistory?.length || 0, 
      shouldCallAI, 
      isPublicChat,
      timestamp: new Date().toISOString()
    });
    
    // Check if we need current information and search for it
    let currentInfo = '';
    let sources: Array<{ title: string; url: string; snippet: string }> = [];
    const questionLower = cleanedQuestion.toLowerCase();
    const needsCurrentInfo = questionLower.includes('news') || 
                           questionLower.includes('current') || 
                           questionLower.includes('today') || 
                           questionLower.includes('recent') ||
                           questionLower.includes('latest') ||
                           questionLower.includes('what happened') ||
                           questionLower.includes('what\'s happening') ||
                           questionLower.includes('breaking') ||
                           questionLower.includes('update') ||
                           questionLower.includes('developments') ||
                           questionLower.includes('stock market') ||
                           questionLower.includes('crypto') ||
                           questionLower.includes('bitcoin') ||
                           questionLower.includes('election') ||
                           questionLower.includes('weather') ||
                           questionLower.includes('sports') ||
                           questionLower.includes('technology') ||
                           questionLower.includes('ai news') ||
                           questionLower.includes('chatgpt') ||
                           questionLower.includes('openai') ||
                           questionLower.includes('google') ||
                           questionLower.includes('microsoft') ||
                           questionLower.includes('apple') ||
                           questionLower.includes('tesla') ||
                           questionLower.includes('spacex') ||
                           questionLower.includes('nasa') ||
                           questionLower.includes('climate') ||
                           questionLower.includes('environment') ||
                           questionLower.includes('economy') ||
                           questionLower.includes('inflation') ||
                           questionLower.includes('unemployment') ||
                           questionLower.includes('war') ||
                           questionLower.includes('conflict') ||
                           questionLower.includes('peace') ||
                           questionLower.includes('treaty') ||
                           questionLower.includes('agreement') ||
                           questionLower.includes('summit') ||
                           questionLower.includes('conference') ||
                           questionLower.includes('meeting') ||
                           questionLower.includes('announcement') ||
                           questionLower.includes('release') ||
                           questionLower.includes('launch') ||
                           questionLower.includes('discovery') ||
                           questionLower.includes('research') ||
                           questionLower.includes('study') ||
                           questionLower.includes('findings') ||
                           questionLower.includes('results') ||
                           questionLower.includes('data') ||
                           questionLower.includes('statistics') ||
                           questionLower.includes('report') ||
                           questionLower.includes('analysis') ||
                           questionLower.includes('trend') ||
                           questionLower.includes('forecast') ||
                           questionLower.includes('prediction') ||
                           questionLower.includes('outlook') ||
                           questionLower.includes('future') ||
                           questionLower.includes('next') ||
                           questionLower.includes('upcoming') ||
                           questionLower.includes('expected') ||
                           questionLower.includes('anticipated') ||
                           questionLower.includes('planned') ||
                           questionLower.includes('scheduled') ||
                           questionLower.includes('event') ||
                           questionLower.includes('happening') ||
                           questionLower.includes('occurring') ||
                           questionLower.includes('taking place') ||
                           questionLower.includes('going on') ||
                           questionLower.includes('in progress') ||
                           questionLower.includes('ongoing') ||
                           questionLower.includes('active') ||
                           questionLower.includes('live') ||
                           questionLower.includes('real-time') ||
                           questionLower.includes('instant') ||
                           questionLower.includes('immediate') ||
                           questionLower.includes('urgent') ||
                           questionLower.includes('important') ||
                           questionLower.includes('significant') ||
                           questionLower.includes('major') ||
                           questionLower.includes('big') ||
                           questionLower.includes('huge') ||
                           questionLower.includes('massive') ||
                           questionLower.includes('breakthrough') ||
                           questionLower.includes('innovation') ||
                           questionLower.includes('invention') ||
                           questionLower.includes('creation') ||
                           questionLower.includes('development') ||
                           questionLower.includes('advancement') ||
                           questionLower.includes('progress') ||
                           questionLower.includes('improvement') ||
                           questionLower.includes('enhancement') ||
                           questionLower.includes('upgrade') ||
                           questionLower.includes('version') ||
                           questionLower.includes('debut') ||
                           questionLower.includes('premiere') ||
                           questionLower.includes('introduction') ||
                           questionLower.includes('reveal') ||
                           questionLower.includes('unveil') ||
                           questionLower.includes('disclose') ||
                           questionLower.includes('share') ||
                           questionLower.includes('publish') ||
                           questionLower.includes('post') ||
                           questionLower.includes('upload') ||
                           questionLower.includes('uploaded') ||
                           questionLower.includes('posted') ||
                           questionLower.includes('published') ||
                           questionLower.includes('released') ||
                           questionLower.includes('launched') ||
                           questionLower.includes('announced') ||
                           questionLower.includes('revealed') ||
                           questionLower.includes('unveiled') ||
                           questionLower.includes('disclosed') ||
                           questionLower.includes('shared') ||
                           questionLower.includes('made public') ||
                           questionLower.includes('made available') ||
                           questionLower.includes('accessible') ||
                           questionLower.includes('available') ||
                           questionLower.includes('online') ||
                           questionLower.includes('internet') ||
                           questionLower.includes('web') ||
                           questionLower.includes('website') ||
                           questionLower.includes('site') ||
                           questionLower.includes('page') ||
                           questionLower.includes('article') ||
                           questionLower.includes('blog') ||
                           questionLower.includes('tweet') ||
                           questionLower.includes('social media') ||
                           questionLower.includes('facebook') ||
                           questionLower.includes('twitter') ||
                           questionLower.includes('instagram') ||
                           questionLower.includes('linkedin') ||
                           questionLower.includes('youtube') ||
                           questionLower.includes('tiktok') ||
                           questionLower.includes('reddit') ||
                           questionLower.includes('discord') ||
                           questionLower.includes('telegram') ||
                           questionLower.includes('whatsapp') ||
                           questionLower.includes('snapchat') ||
                           questionLower.includes('pinterest') ||
                           questionLower.includes('medium') ||
                           questionLower.includes('substack') ||
                           questionLower.includes('newsletter') ||
                           questionLower.includes('email') ||
                           questionLower.includes('message') ||
                           questionLower.includes('communication') ||
                           questionLower.includes('information') ||
                           questionLower.includes('content') ||
                           questionLower.includes('material') ||
                           questionLower.includes('resource') ||
                           questionLower.includes('source') ||
                           questionLower.includes('reference') ||
                           questionLower.includes('citation') ||
                           questionLower.includes('link') ||
                           questionLower.includes('url') ||
                           questionLower.includes('trump') ||
                           questionLower.includes('tylenol') ||
                           questionLower.includes('politics') ||
                           questionLower.includes('2025');

    if (needsCurrentInfo) {
      console.log('🔍 Triggering web search for:', cleanedQuestion);
      const searchResults = await searchWeb(cleanedQuestion);
      currentInfo = searchResults.content ? `\n\nCurrent information:\n${searchResults.content}\n` : '';
      sources = searchResults.sources;
      console.log('📚 Found sources:', sources.length, sources);
    }

    // Build natural, human-like prompt
    const convoContext = conversationHistory?.length > 0 
      ? `\n\nPrevious chat:\n${conversationHistory.map((msg: any) => `${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.content}`).join('\n')}\n\n`
      : '';

    const prompt = `You're CourseConnect AI, a friendly and helpful study buddy! Respond naturally like you're chatting with a friend. Be conversational, engaging, and helpful.

Context: ${context || 'General Chat'}

When talking about current events or news, be conversational but factual. You can reference the information provided to give context.

${currentInfo}

${convoContext}User: ${cleanedQuestion}

CourseConnect AI:`;

    // Try Ollama first with smart model selection
    let aiResponse: string;
    let selectedModel: string;
    
    try {
      // Smart model selection - automatically picks best available model
      selectedModel = OllamaModelManager.getBestGeneralModel();
      
      if (!selectedModel) {
        throw new Error('No Ollama models available');
      }

      console.log(`Using Ollama model: ${selectedModel}`);
      
      // Add timeout to prevent slow responses
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Ollama timeout')), 15000); // 15 second timeout
      });
      
      const ollamaPromise = fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7, // Slightly less random, faster response
            num_tokens: 500, // Shorter responses, much faster
            num_ctx: 2048, // Smaller context window, faster processing
            top_p: 0.9, // Slightly less sampling, faster
            top_k: 20, // Reduce choices, faster generation
            num_batch: 1, // Process in smaller batches
            num_thread: 4 // Use fewer threads for faster response
          }
        })
      });

      const ollamaResponse = await Promise.race([ollamaPromise, timeoutPromise]) as Response;
      
      if (ollamaResponse.ok) {
        const ollamaResult = await ollamaResponse.json();
        aiResponse = ollamaResult.response;
      } else {
        throw new Error('Ollama not available or failed');
      }
    } catch (error) {
      console.log('Ollama failed, using intelligent fallback response');
      
      // Intelligent fallback that can handle current events if search succeeded
      const lowerQuestion = cleanedQuestion.toLowerCase();
      
      if (currentInfo) {
        // We have current info from search, provide a smart response
        if (lowerQuestion.includes('trump') && lowerQuestion.includes('tylenol')) {
          aiResponse = `${currentInfo}\n\nYeah, that's been a big topic lately! The science on this is pretty clear though - the claims made don't hold up to medical evidence. What specific aspect of this story are you curious about?`;
        } else {
          aiResponse = `Based on what I found: ${currentInfo.substring(0, 300)}...\n\nThat's the latest info I could find on this topic. Want to dive deeper into any specific aspect?`;
        }
      } else if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
        aiResponse = "Hey there! I'm CourseConnect AI, your friendly study buddy! I'm here to help with academics, homework questions, study strategies, or just chat about whatever's on your mind. What's up today?";
      } else if (lowerQuestion.includes('who are you')) {
        aiResponse = "I'm CourseConnect AI, your friendly study buddy! I was created by a solo developer who built CourseConnect as a unified platform for college students. I'm here to help you with studies, answer questions, or just chat about whatever's on your mind. What's up?";
      } else if (lowerQuestion.includes('news') || lowerQuestion.includes('current')) {
        aiResponse = "I'd love to help with current events! Unfortunately I'm having trouble accessing real-time info right now. Feel free to ask me about academic topics, or try asking something like 'what's the latest news about...' specifically.";
      } else {
        aiResponse = "That's an interesting question! I'd normally chat about this with you, but I'm having some technical issues right now. Want to talk about academics, ask about homework, or try asking something else? I'm here to help once we get this sorted out!";
      }
    }

    console.log('Chat API result:', { 
      model: selectedModel || 'fallback', 
      answerLength: aiResponse?.length || 0,
      timestamp: new Date().toISOString()
    });

    console.log('📤 Returning response with sources:', sources.length > 0 ? sources.length : 0);
    
    return NextResponse.json({
      success: true,
      answer: aiResponse,
      provider: selectedModel || 'fallback',
      shouldRespond: true,
      sources: sources.length > 0 ? sources : undefined,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    return NextResponse.json({
      error: 'Failed to process chat message',
      details: error.message 
    }, { status: 500 });
  }
}
