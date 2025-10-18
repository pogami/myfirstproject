import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('🎯 OpenAI Vision API called');
  
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key configured:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const { message, image, mimeType } = await request.json();
    console.log('Request data:', { 
      hasMessage: !!message, 
      hasImage: !!image, 
      imageLength: image?.length || 0,
      mimeType 
    });
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    const prompt = message || "What's in this image? Describe it in detail.";
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`📸 Sending to GPT-4o Vision...`);
    
    // Enhanced system prompt for better formatting
           const systemPrompt = `You are a helpful academic assistant analyzing images for students.

FORMATTING RULES:
1. For ALL mathematical expressions, equations, or formulas:
   - Use LaTeX format enclosed in $...$ for inline math
   - Use LaTeX format enclosed in $$...$$ for display/block math
   - NEVER use \\( or \\) - ONLY use $ and $$
   - Examples: 
     * Inline: The equation is $x^2 + y^2 = r^2$
     * Display: $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
   - For variables: $k$, $x$, $y$, etc.
   - For equations: $f(x) = x^2 + 3x + 2$
   - For fractions: $\\frac{a}{b}$ or $$\\frac{a}{b}$$

2. Response style:
   - Be CONCISE and direct
   - Skip unnecessary introductions like "This image shows..."
   - Get straight to the solution/explanation
   - Use **bold** for key terms (sparingly)
   - DO NOT use asterisks for formatting
   - Use numbered lists ONLY when showing multiple steps

3. When solving math problems:
   - Show the problem first in LaTeX
   - Show solution steps (if needed)
   - Give final answer clearly
   - Keep explanations brief and focused

4. For diagrams/concepts:
   - Explain what's shown concisely
   - Highlight key points
   - Skip obvious details

5. Overall tone: Clear, concise, academic, helpful`;

    // Enhanced prompt for image-only analysis
    const enhancedPrompt = prompt.trim() === 'Describe this image and extract relevant info.' 
      ? 'Analyze this image comprehensively. Identify what you see, extract any text or data, explain concepts shown, and provide educational insights. Be thorough but concise.'
      : prompt;

    const userPrompt = `${enhancedPrompt}

CRITICAL: Format ALL math using $...$ for inline and $$...$$ for display. NEVER use \\( or \\). Examples: $k = 3$, $x^2 + 4x + 1$, $$\\frac{a}{b}$$`;
    
    // Use GPT-4o with vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${image}`,
                detail: "high"
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });
    
    const text = response.choices[0]?.message?.content || 'No response';
    
    console.log(`✅ SUCCESS with GPT-4o!`);
    console.log(`📄 Response length: ${text.length} characters`);
    
    return NextResponse.json({ 
      response: text, 
      model: "gpt-4o",
      provider: "OpenAI"
    });
    
  } catch (error: any) {
    console.error('🚨 OpenAI Vision API error:', error);
    console.error('Error message:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze image',
        details: 'Make sure your OPENAI_API_KEY is valid and has access to GPT-4o',
        provider: 'OpenAI'
      },
      { status: 500 }
    );
  }
}

