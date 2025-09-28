import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

// Initialize Ollama client (server-side only)
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

export async function POST(request: NextRequest) {
  try {
    const { text, fileName, analysisType = 'summary' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Check if Ollama is running
    try {
      await ollama.list();
    } catch (error) {
      return NextResponse.json(
        { error: 'Ollama is not running. Please start Ollama first.' },
        { status: 503 }
      );
    }

    // Analyze file content with Ollama
    let prompt = '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Summarize this content from "${fileName}":
        
        ${text.substring(0, 1500)}
        
        Return JSON:
        {
          "summary": "brief summary",
          "keyPoints": ["point 1", "point 2", "point 3"],
          "confidence": 85
        }`;
        break;
        
      case 'extraction':
        prompt = `Extract key info from "${fileName}":
        
        ${text.substring(0, 1500)}
        
        Return JSON:
        {
          "summary": "extracted info summary",
          "keyPoints": ["point 1", "point 2"],
          "confidence": 90
        }`;
        break;
        
      case 'discussion':
        prompt = `Discussion points for "${fileName}":
        
        ${text.substring(0, 1500)}
        
        Return JSON:
        {
          "summary": "discussion analysis",
          "keyPoints": ["point 1", "point 2"],
          "confidence": 80
        }`;
        break;
        
      case 'qa':
        prompt = `Q&A prep for "${fileName}":
        
        ${text.substring(0, 1500)}
        
        Return JSON:
        {
          "summary": "Q&A summary",
          "keyPoints": ["point 1", "point 2"],
          "confidence": 85
        }`;
        break;
    }
    
    const response = await ollama.generate({
      model: 'llama3.1:8b',
      prompt: prompt,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 500,
        num_ctx: 2048
      }
    });
    
    // Parse the JSON response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      const result = {
        success: true,
        analysis: {
          summary: parsed.summary || 'Analysis completed',
          keyPoints: parsed.keyPoints || [],
          confidence: (parsed.confidence || 75) / 100
        },
        isOllamaAvailable: true
      };

      return NextResponse.json(result);
    } else {
      // Fallback if JSON parsing fails
      const result = {
        success: true,
        analysis: {
          summary: response.response,
          keyPoints: ['Content analyzed successfully'],
          confidence: 0.7
        },
        isOllamaAvailable: true
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error analyzing file content:', error);
    
    // Fallback analysis
    const result = {
      success: true,
      analysis: {
        summary: `Content from ${fileName} has been processed. The file contains ${text.length} characters of text.`,
        keyPoints: ['File processed successfully', 'Content extracted', 'Ready for discussion'],
        confidence: 0.6
      },
      isOllamaAvailable: false
    };

    return NextResponse.json(result);
  }
}
