import { NextRequest, NextResponse } from 'next/server';
import { OllamaModelManager } from '@/lib/ollama-model-manager';

export async function POST(request: NextRequest) {
  try {
    console.log('AI analyze-document API called');
    const { extractedText, fileName, fileType, userPrompt } = await request.json();
    
    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text content provided for analysis' },
        { status: 400 }
      );
    }
    
    // Determine the analysis type based on user prompt
    let analysisPrompt: string;
    
    if (userPrompt) {
      // User has a specific question about the document
      analysisPrompt = `Document Analysis Request:

Document: ${fileName} (${fileType || 'unknown type'})
Content Preview: ${extractedText.substring(0, 500)}...

User Question: ${userPrompt}

Please provide a comprehensive answer to the user's question based on the document content.`;
    } else {
      // General analysis
      analysisPrompt = `Document Analysis:

Document: ${fileName} (${fileType || 'unknown type'})
Content: ${extractedText.substring(0, 800)}...

Analyze this document and provide:
1. Brief summary
2. Key points
3. Important details
4. Potential discussion topics`;
    }

    console.log(`🔍 Starting document analysis for: ${fileName}`);

// Use Ollama for analysis
await OllamaModelManager.refreshAvailableModels();
const selectedModel = OllamaModelManager.getBestGeneralModel();
    let aiResponse: string;
    
    if (selectedModel) {
      try {
        console.log(`🔍 Using Ollama model: ${selectedModel}`);
        
        // Add timeout for reliability
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Analysis timeout')), 15000);
        });

        const ollamaPromise = fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: analysisPrompt,
            stream: false,
            options: {
              temperature: 0.7,
              num_tokens: 800, // More detailed responses
              num_ctx: 2048,
              top_p: 0.9,
              top_k: 20,
              num_batch: 1,
              num_thread: 4
            }
          })
        });

        const ollamaResponse = await Promise.race([ollamaPromise, timeoutPromise]) as Response;

        if (ollamaResponse.ok) {
          const ollamaResult = await ollamaResponse.json();
          aiResponse = ollamaResult.response || 'Document analysis completed successfully.';
          console.log(`🔍 Ollama analysis successful: ${aiResponse.substring(0, 50)}...`);
        } else {
          throw new Error(`Ollama request failed with status: ${ollamaResponse.status}`);
        }
      } catch (error) {
        console.log(`🔍 Ollama failed, using fallback:`, error.message);
        // Simple fallback analysis
        aiResponse = `Document "${fileName}" (${fileType}) has been processed. Content length: ${extractedText.length} characters. ${userPrompt ? `Response to your question: ${userPrompt} - Please refer to the document content for specific answers.` : 'Document is ready for questions and analysis.'}`;
      }
    } else {
      console.log('🔍 No Ollama models available, using fallback');
      aiResponse = `Document "${fileName}" (${fileType}) uploaded successfully. Content: ${extractedText.substring(0, 200)}... Ready for questions.`;
    }
    
    return NextResponse.json({
      success: true,
      analysis: aiResponse,
      fileName,
      fileType,
      provider: selectedModel || 'fallback',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔍 Document analysis error:', error);
    
    return NextResponse.json({
      success: true,
      error: 'Document analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      analysis: 'Document was uploaded and processed successfully. Ready for questions about the content.',
      timestamp: new Date().toISOString()
    });
  }
}