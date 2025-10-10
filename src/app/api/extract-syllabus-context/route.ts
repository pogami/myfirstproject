import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';
import { z } from 'zod';

export const runtime = 'nodejs';

const SyllabusExtractionSchema = z.object({
  syllabusText: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syllabusText } = SyllabusExtractionSchema.parse(body);

    const prompt = `You are a syllabus analysis AI. Extract the following information from the syllabus text and return ONLY a valid JSON object. If information is not found, use null for that field.

Required JSON format:
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

Syllabus Text:
${syllabusText}

Return ONLY the JSON object, no other text:`;

    const aiResponse = await provideStudyAssistanceWithFallback({
      question: prompt,
      context: 'Syllabus extraction task - return JSON only'
    });

    // Clean the response to extract JSON
    let jsonString = aiResponse.answer.trim();
    
    // Remove any markdown code blocks
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    }

    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', aiResponse.answer);
      
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
