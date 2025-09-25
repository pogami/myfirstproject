'use server';

/**
 * @fileOverview AI Vision Service for Image Analysis
 * 
 * This service provides image analysis capabilities using Google Gemini Pro Vision
 * and OpenAI GPT-4 Vision as fallback.
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google AI
const googleApiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE;

export interface VisionAnalysisInput {
  imageData: string; // base64 encoded image
  fileName: string;
  fileType: string;
  tutorSpecialty?: string;
  tutorDescription?: string;
  prompt?: string;
}

export interface VisionAnalysisResponse {
  analysis: string;
  provider: 'google' | 'openai' | 'fallback';
  error?: string;
}

/**
 * Analyze image using Google Gemini Pro Vision
 */
async function analyzeWithGoogleVision(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
  try {
    if (!googleApiKey) {
      throw new Error('Google AI API key not found');
    }

    // Remove data URL prefix if present
    const base64Data = input.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this image: ${input.fileName}

Please provide a comprehensive analysis including:

1. **Visual Description**: Describe exactly what you can see in this image - objects, text, diagrams, charts, people, scenes, etc.
2. **Content Analysis**: If there's text visible, read and explain it. If there are diagrams or charts, describe what they show.
3. **Educational Value**: Explain how this image can be used for learning and what concepts it illustrates.
4. **Key Information**: Extract any important facts, data, formulas, or concepts that are visible.
5. **Specific Details**: Point out specific elements, colors, shapes, or text that you can identify.

${input.tutorSpecialty && input.tutorSpecialty !== 'General' ? `As a ${input.tutorSpecialty} specializing in ${input.tutorDescription}, focus your analysis on how this image relates to your field of expertise.` : 'Provide a general educational analysis.'}

Be detailed and specific in your analysis. Describe what you can actually see in the image.`
            },
            {
              inline_data: {
                mime_type: input.fileType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Google Vision API');
    }

    const analysis = data.candidates[0].content.parts[0].text;
    
    return {
      analysis,
      provider: 'google'
    };

  } catch (error) {
    console.error('Google Vision API error:', error);
    throw error;
  }
}

/**
 * Analyze image using OpenAI GPT-4 Vision
 */
async function analyzeWithOpenAIVision(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image: ${input.fileName}

Please provide a comprehensive analysis including:

1. **Visual Description**: Describe exactly what you can see in this image - objects, text, diagrams, charts, people, scenes, etc.
2. **Content Analysis**: If there's text visible, read and explain it. If there are diagrams or charts, describe what they show.
3. **Educational Value**: Explain how this image can be used for learning and what concepts it illustrates.
4. **Key Information**: Extract any important facts, data, formulas, or concepts that are visible.
5. **Specific Details**: Point out specific elements, colors, shapes, or text that you can identify.

${input.tutorSpecialty && input.tutorSpecialty !== 'General' ? `As a ${input.tutorSpecialty} specializing in ${input.tutorDescription}, focus your analysis on how this image relates to your field of expertise.` : 'Provide a general educational analysis.'}

Be detailed and specific in your analysis. Describe what you can actually see in the image.`
            },
            {
              type: "image_url",
              image_url: {
                url: input.imageData
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const analysis = response.choices[0]?.message?.content || 'No analysis available';
    
    return {
      analysis,
      provider: 'openai'
    };

  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    throw error;
  }
}

/**
 * Main function to analyze images with automatic fallback
 */
export async function analyzeImageWithVision(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
  console.log('Starting image analysis with vision capabilities...');
  
  // Try Google Gemini Pro Vision first
  try {
    console.log('Attempting Google Gemini Pro Vision...');
    const result = await analyzeWithGoogleVision(input);
    console.log('Google Vision analysis successful');
    return result;
  } catch (error) {
    console.log('Google Vision failed, trying OpenAI Vision...');
    
    // Fallback to OpenAI GPT-4 Vision
    try {
      const result = await analyzeWithOpenAIVision(input);
      console.log('OpenAI Vision analysis successful');
      return result;
    } catch (error) {
      console.error('Both vision APIs failed:', error);
      
      // Final fallback - return a message explaining the limitation
      return {
        analysis: `I can see you've uploaded an image: **${input.fileName}**

**Image Analysis Status:**
• File: ${input.fileName}
• Type: ${input.fileType}
• Analysis: Vision capabilities are currently unavailable

**What I can help with:**
• Explain concepts if you describe what's in the image
• Provide educational context based on the filename
• Answer questions about related topics

**To get better analysis:**
Please describe what you see in the image, and I can provide detailed explanations and educational insights based on your description.

${input.tutorSpecialty && input.tutorSpecialty !== 'General' ? `As your ${input.tutorSpecialty}, I can provide expert analysis once you describe the image content.` : 'I can provide comprehensive analysis once you describe what you see.'}`,
        provider: 'fallback',
        error: 'Vision APIs unavailable'
      };
    }
  }
}
