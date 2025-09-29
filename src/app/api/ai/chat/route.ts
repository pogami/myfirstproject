import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }
    
    // Build context-aware prompt
    let prompt = `You are CourseConnect AI, a helpful and friendly AI tutor specializing in ${context || 'academic subjects'}. 

You should:
- Provide clear, educational explanations
- Be encouraging and supportive
- Use examples when helpful
- Ask follow-up questions to help students learn
- Keep responses conversational but informative
- If asked about topics outside your expertise, politely redirect to academic subjects

${conversationHistory && conversationHistory.length > 0 ? `
Recent conversation context:
${conversationHistory.map((msg: any) => `${msg.sender}: ${msg.message}`).join('\n')}
` : ''}

Student's question: ${message}

Please provide a helpful, educational response:`;

    // Try Ollama first for better performance
    let aiResponse: string;
    
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:1.5b', // Fast model for chat
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7, // Slightly more creative for chat
            max_tokens: 500, // Reasonable response length
            num_ctx: 2048
          }
        })
      });
      
      if (ollamaResponse.ok) {
        const ollamaResult = await ollamaResponse.json();
        aiResponse = ollamaResult.response;
      } else {
        throw new Error('Ollama not available or failed');
      }
    } catch (error) {
      console.log('Ollama failed, using fallback response');
      
      // Fallback responses based on common math questions
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('derivative') || lowerMessage.includes('differentiate')) {
        aiResponse = "Sure! A derivative tells you how fast a function is changing at any point. Think of it as the slope of the curve. For example, if f(x) = x², then f'(x) = 2x. This means at x=3, the slope is 6.";
      } else if (lowerMessage.includes('integral') || lowerMessage.includes('integrate')) {
        aiResponse = "Integrals are the reverse of derivatives! They help us find the area under a curve or the original function from its derivative. The fundamental theorem of calculus connects derivatives and integrals beautifully. Are you working on definite or indefinite integrals? I can help with either!";
      } else if (lowerMessage.includes('limit')) {
        aiResponse = "Limits are fundamental to calculus! They describe what happens to a function as it approaches a certain value. For example, lim(x→0) sin(x)/x = 1. This concept is the foundation for both derivatives and integrals. What specific limit are you working with?";
      } else if (lowerMessage.includes('chain rule')) {
        aiResponse = "The chain rule is essential for finding derivatives of composite functions! If you have f(g(x)), the derivative is f'(g(x)) × g'(x). Think of it as the derivative of the outer function times the derivative of the inner function. Would you like to see a step-by-step example?";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        aiResponse = "Hello! I'm your CourseConnect AI tutor. I'm here to help you with MATH-2211 Calculus and any other academic questions you might have. What would you like to learn about today?";
      } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
        aiResponse = "I'm here to help! Whether you're working on derivatives, integrals, limits, or any other calculus concepts, I can break things down step by step. What specific problem or concept are you working on?";
      } else {
        aiResponse = "That's an interesting question! While I specialize in academic subjects like calculus, I'd be happy to help you with MATH-2211 concepts like derivatives, integrals, limits, or any other calculus topics. Could you rephrase your question in terms of the math concepts you're studying?";
      }
    }
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      model: 'qwen2.5:1.5b'
    });
    
  } catch (error: any) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
