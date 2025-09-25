import { NextRequest, NextResponse } from 'next/server';

const googleApiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE;

export async function POST(request: NextRequest) {
  try {
    console.log('In-depth analysis API called');
    const { question, conversationHistory } = await request.json();
    console.log('Question:', question);

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Build conversation history for context
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${conversationHistory.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n')}`
      : '';

    // Use Google AI only (no OpenAI fallback needed)
    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google AI API key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CourseConnect AI providing detailed step-by-step mathematical analysis.

CRITICAL FORMATTING RULES:
1. NEVER use markdown formatting like **bold** or *italic* or # headers
2. NEVER use asterisks (*) or hash symbols (#) for formatting
3. Write in plain text only - no special formatting characters
4. Use KaTeX delimiters $...$ and $$...$$ for math expressions only
5. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
6. Write words OUTSIDE math delimiters, symbols INSIDE math delimiters
7. NEVER use \\text{} commands - keep ALL words OUTSIDE math delimiters
8. Only put mathematical symbols, numbers, and equations INSIDE $...$ delimiters

DETAILED MATH ANALYSIS RULES:
1. Provide COMPLETE step-by-step solutions with detailed explanations
2. Show every calculation and reasoning step
3. Explain the mathematical concepts and methods used
4. Use LaTeX for all math notation:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
5. CRITICAL: Write ALL words OUTSIDE of math delimiters
6. CRITICAL: Use proper spacing between words - never concatenate words together
7. CRITICAL: Each step should be clearly separated and readable
8. CRITICAL: Never use \\text{} commands - keep all text outside math delimiters
6. Example format:
   "DETAILED SOLUTION:
   
   Step 1: Identify the problem type
   This is a quadratic equation that can be solved by factoring.
   
   Step 2: Write the equation
   $x^2 + 3x + 2 = 0$
   
   Step 3: Factor the quadratic
   We need two numbers that multiply to 2 and add to 3.
   These numbers are 1 and 2.
   $x^2 + 3x + 2 = (x + 1)(x + 2) = 0$
   
   Step 4: Apply zero product property
   If $(x + 1)(x + 2) = 0$, then either $x + 1 = 0$ or $x + 2 = 0$
   
   Step 5: Solve each equation
   $x + 1 = 0$ → $x = -1$
   $x + 2 = 0$ → $x = -2$
   
   Step 6: Verify solutions
   For $x = -1$: $(-1)^2 + 3(-1) + 2 = 1 - 3 + 2 = 0$ ✓
   For $x = -2$: $(-2)^2 + 3(-2) + 2 = 4 - 6 + 2 = 0$ ✓
   
   Answer: $\\boxed{x = -1 \\text{ or } x = -2}$"

Question: ${question}${conversationContext}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a detailed analysis.';

    return NextResponse.json({ 
      analysis: answer.trim(),
      provider: 'google'
    });

  } catch (error) {
    console.error('In-depth analysis error:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: 'Failed to generate analysis', details: error.message }, { status: 500 });
  }
}
