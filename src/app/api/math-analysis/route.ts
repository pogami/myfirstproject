import { NextRequest, NextResponse } from 'next/server';
import { OllamaModelManager } from '@/lib/ollama-model-manager';

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Ensure model cache is fresh
    await OllamaModelManager.refreshAvailableModels();
    
    // Get the best model for mathematical analysis
    const mathModel = OllamaModelManager.getBestMathModel();
    const parameters = OllamaModelManager.getOptimalParameters(mathModel);
    
    console.log(`🧮 Using ${mathModel} for mathematical analysis`);
    
    // Enhanced prompt for mathematical analysis
    const mathPrompt = `You are a mathematical analysis expert. Provide a detailed, step-by-step analysis of the following mathematical question or problem.

Question: "${question}"
${context ? `Context: ${context}` : ''}

Please provide:

1. **Problem Identification**: What type of mathematical problem is this?
2. **Step-by-Step Solution**: Break down the solution into clear, logical steps
3. **Mathematical Concepts**: Explain the key mathematical concepts involved
4. **Alternative Methods**: If applicable, show alternative approaches
5. **Verification**: How can we verify the answer is correct?
6. **Real-World Applications**: Where might this type of problem appear in real life?
7. **Common Mistakes**: What mistakes do students often make with this type of problem?

Format your response in a clear, educational manner that helps someone understand not just the answer, but the mathematical reasoning behind it. Use proper mathematical notation and explain each step thoroughly.`;

    // Call Ollama API
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: mathModel,
        prompt: mathPrompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more precise mathematical reasoning
          num_ctx: 8192, // Larger context for detailed analysis
          top_p: 0.9,
          top_k: 40
        }
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const analysis = ollamaData.response || 'Unable to generate mathematical analysis.';

    return NextResponse.json({
      analysis,
      model: mathModel,
      question,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mathematical analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mathematical analysis' },
      { status: 500 }
    );
  }
}
