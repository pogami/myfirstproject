import { NextRequest, NextResponse } from 'next/server';
import { OllamaModelManager } from '@/lib/ollama-model-manager';

// Simple in-memory summary cache for the demo (per-process)
const roomSummaryCache = new Map<string, string>();

async function generateSummary(model: string, history: Array<{ role: string; content: string }>): Promise<string> {
  const text = history
    .slice(-50)
    .map(h => `${h.role}: ${h.content}`)
    .join('\n');

  const prompt = `You are a helpful assistant. Summarize the following conversation for future reference in 5-8 concise bullet points. Include names, decisions, formulas, and key preferences. Avoid chain-of-thought, just the summary bullets.\n\n${text}\n\nSummary:`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2, max_tokens: 256 } })
  });

  if (!res.ok) return '';
  const data = await res.json();
  return typeof data?.response === 'string' ? data.response.trim() : '';
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, conversationHistory } = body;
    
    console.log('🎓 Demo Chat API called with:', { 
      question: question?.substring(0, 100) + '...',
      historyLength: conversationHistory?.length || 0
    });

    const cleanedQuestion = question.trim();
    if (!cleanedQuestion) {
      return NextResponse.json({
        success: false,
        error: 'No question provided'
      }, { status: 400 });
    }

    // Persona + style
    let contextPrompt = `System persona:\nYou are CourseConnect AI — a friendly, concise educational tutor.\n- Answer naturally and human-like.\n- Keep simple answers to ≤3 sentences.\n- For math, use LaTeX: $inline$ and $$display$$ only for equations.\n- For code, use fenced markdown with language and runnable snippets.\n- Cite document sources when present.\n- Do not include chain-of-thought; reason silently.\n\n`;

    // Short-term memory: recent turns
    const recent = Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [];
    if (recent.length) {
      contextPrompt += `Recent conversation (most recent last):\n`;
      recent.forEach((msg: any) => {
        const who = msg.role === 'assistant' ? 'Tutor' : 'Student';
        contextPrompt += `${who}: ${msg.content}\n`;
      });
      contextPrompt += `\n`;
    }

    // Mid-term memory: rolling room summary (keyed by a synthetic room id for demo)
    // For demo we key by a stable hash of the first 3 user msgs or fallback to 'demo'
    const roomKey = (Array.isArray(conversationHistory) && conversationHistory.length)
      ? (conversationHistory.filter((m: any) => m.role === 'user').slice(0, 3).map((m: any) => m.content).join('|').slice(0, 64) || 'demo')
      : 'demo';

    let summary = roomSummaryCache.get(roomKey) || '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 20) {
      // Refresh summary asynchronously (fire and forget)
      (async () => {
        try {
          await OllamaModelManager.ensureModelCacheFresh();
          const modelForSummary = OllamaModelManager.getBestGeneralModel() || 'qwen2.5:7b';
          const s = await generateSummary(modelForSummary, conversationHistory);
          if (s) roomSummaryCache.set(roomKey, s);
        } catch {}
      })();
    }
    if (summary) {
      contextPrompt += `Conversation summary (for context):\n${summary}\n\n`;
    }

    contextPrompt += `Student question: ${cleanedQuestion}\n\nProvide the best possible answer now.`;

    // Get the best model
    let selectedModel: string;
    try {
      await OllamaModelManager.ensureModelCacheFresh();
      selectedModel = OllamaModelManager.getBestGeneralModel();
      
      if (!selectedModel) {
        throw new Error('No Ollama models available');
      }
      
      console.log(`🎓 Using model: ${selectedModel}`);
    } catch (error) {
      console.warn('⚠️ Ollama not available, using fallback');
      selectedModel = 'hf.co/Menlo/Lucy-gguf:Q4_K_M';
    }

    // Test if Ollama is actually running
    try {
      const testResponse = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!testResponse.ok) {
        throw new Error('Ollama not responding');
      }
    } catch (error) {
      console.error('❌ Ollama is not running:', error);
      return NextResponse.json({
        success: false,
        error: 'Ollama is not running. Please start Ollama first.',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              prompt: contextPrompt,
              stream: true,
              options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1024,
                stop: ['</think>', '<think>']
              }
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let fullResponse = '';
          let isControllerClosed = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                
                if (data.response) {
                  fullResponse += data.response;
                  
                  // Send content in real-time
                  if (!isControllerClosed) {
                    try {
                      controller.enqueue(new TextEncoder().encode(
                        JSON.stringify({ type: 'content', content: data.response }) + '\n'
                      ));
                    } catch (enqueueError) {
                      if (enqueueError.code === 'ERR_INVALID_STATE') {
                        console.log('⚠️ Controller already closed, stopping streaming');
                        isControllerClosed = true;
                        break;
                      }
                      throw enqueueError;
                    }
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Failed to parse streaming chunk:', line);
                continue;
              }
            }
          }

          // Send completion
          if (!isControllerClosed) {
            try {
              controller.enqueue(new TextEncoder().encode(
                JSON.stringify({ 
                  type: 'done', 
                  fullResponse: fullResponse,
                  model: selectedModel
                }) + '\n'
              ));
              controller.close();
            } catch (closeError) {
              console.warn('⚠️ Error closing controller:', closeError);
            }
          }

        } catch (error) {
          console.error('❌ Demo streaming error:', error);
          
          if (!isControllerClosed) {
            try {
              controller.enqueue(new TextEncoder().encode(
                JSON.stringify({ 
                  type: 'error', 
                  error: 'Demo AI response failed. Please try again.' 
                }) + '\n'
              ));
              controller.close();
            } catch (closeError) {
              console.warn('⚠️ Error closing controller after error:', closeError);
            }
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Demo Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Demo AI service temporarily unavailable',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
