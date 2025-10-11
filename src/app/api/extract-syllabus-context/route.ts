import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const SyllabusExtractionSchema = z.object({
  syllabusText: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syllabusText } = SyllabusExtractionSchema.parse(body);

    const prompt = `Extract course information from this syllabus and return ONLY valid JSON. Use null for missing fields.

JSON format:
{
  "courseName": "string or null",
  "courseCode": "string or null", 
  "professor": "string or null",
  "university": "string or null",
  "semester": "string or null",
  "year": "string or null",
  "department": "string or null",
  "topics": ["array of strings"],
  "assignments": [{"name": "string", "dueDate": "YYYY-MM-DD or null"}],
  "exams": [{"name": "string", "date": "YYYY-MM-DD or null"}]
}

Syllabus:
${syllabusText}

JSON:`;

    // Use OpenAI directly for syllabus analysis
    let aiResponse: string;
    let selectedModel: string;
    
    try {
      console.log('Using OpenAI for syllabus analysis...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 2000,
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content || '';
        selectedModel = 'openai';
        console.log('✅ OpenAI succeeded for syllabus analysis, response length:', aiResponse.length);
      } else {
        const errorData = await response.text();
        console.log('OpenAI error response:', errorData);
        throw new Error(`OpenAI failed: ${response.status}`);
      }
    } catch (error) {
      console.error('OpenAI failed:', error);
      return NextResponse.json({
        success: false,
        error: 'AI service is temporarily unavailable. Please try again later.'
      }, { status: 500 });
    }

    const aiResponseObj = {
      answer: aiResponse,
      provider: selectedModel,
      shouldRespond: true,
      timestamp: new Date().toISOString(),
      sources: [],
    };

    // Clean the response to extract JSON
    let jsonString = aiResponse.trim();
    console.log('Raw AI response:', aiResponse);
    console.log('Response length:', aiResponse.length);
    
    // Remove any markdown code blocks
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    }

    console.log('Cleaned JSON string:', jsonString);

    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
      console.log('Successfully parsed JSON:', extractedData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Failed to parse JSON string:', jsonString);
      
      // Fallback: return a basic structure
      extractedData = {
        courseName: null,
        courseCode: null,
        professor: null,
        university: null,
        semester: null,
        year: null,
        department: null,
        topics: [],
        assignments: [],
        exams: []
      };
    }

    return NextResponse.json({ success: true, extractedData });
  } catch (error: any) {
    console.error('Error extracting syllabus context:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      extractedData: {
        courseName: null,
        courseCode: null,
        professor: null,
        university: null,
        semester: null,
        year: null,
        department: null,
        topics: [],
        assignments: [],
        exams: []
      }
    }, { status: 500 });
  }
}
