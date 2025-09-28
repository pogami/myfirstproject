import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

// Initialize Ollama client (server-side only)
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();

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

    // Parse syllabus using Ollama AI
    const prompt = `Extract course info from this syllabus. Return JSON only:

{
  "courseCode": "code or null",
  "courseTitle": "title or null", 
  "instructor": "name or null",
  "semester": "fall/spring/summer/winter or null",
  "year": "year or null",
  "university": "university or null",
  "department": "department or null"
}

Text: ${text.substring(0, 2000)}

JSON:`;

    const response = await ollama.generate({
      model: 'llama3.1:8b',
      prompt: prompt,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 300,
        num_ctx: 2048
      }
    });

    // Parse the JSON response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Calculate confidence based on how many fields were extracted
      const fields = Object.values(parsed).filter(value => value !== null && value !== '');
      const confidence = fields.length / 8; // 8 total fields
      
      const result = {
        success: true,
        extractedData: {
          ...parsed,
          confidence: Math.min(confidence, 1),
          extractedAt: Date.now()
        },
        isOllamaAvailable: true
      };

      return NextResponse.json(result);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    console.error('Error processing syllabus with Ollama:', error);
    
    // Fallback to regex-based parsing
    const fallbackResult = parseSyllabusWithRegex(text);
    
    return NextResponse.json({
      success: true,
      extractedData: fallbackResult,
      isOllamaAvailable: false
    });
  }
}

// Fallback regex-based parsing when Ollama fails
function parseSyllabusWithRegex(text: string) {
  const normalizedText = text.toLowerCase();
  
  // Course code patterns
  const courseCodePatterns = [
    /(?:course\s+code|catalog\s+number|subject\s+code)[:\s]*([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i,
    /([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i,
    /(?:csci|cse|math|eng|bio|chem|phys|econ|hist|engl)[-_\s]?\d{3,4}[a-z]?/i
  ];
  
  // Course title patterns
  const courseTitlePatterns = [
    /(?:course\s+title|title)[:\s]*([^\n\r]+)/i,
    /(?:introduction\s+to|fundamentals\s+of|principles\s+of)\s+([^\n\r]+)/i,
    /([a-z\s]+(?:introduction|fundamentals|principles|basics|overview))/i
  ];
  
  // Instructor patterns
  const instructorPatterns = [
    /(?:instructor|professor|teacher)[:\s]*([^\n\r@]+)/i,
    /([a-z]+\s+[a-z]+)\s*@[a-z]+\.[a-z]+/i,
    /([a-z]+\s+[a-z]+)\s*\([a-z]+@[a-z]+\.[a-z]+\)/i
  ];
  
  // Email patterns
  const emailPatterns = [
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
  ];
  
  // Semester patterns
  const semesterPatterns = [
    /(fall|spring|summer|winter|autumn)\s+(\d{4})/i,
    /(f|s|su|w|a)\s*(\d{4})/i,
    /(?:semester|term)[:\s]*(fall|spring|summer|winter|autumn)/i
  ];
  
  // University patterns
  const universityPatterns = [
    /(university\s+of\s+[^,\n\r]+)/i,
    /([^,\n\r]+\s+university)/i,
    /(college\s+of\s+[^,\n\r]+)/i,
    /([^,\n\r]+\s+college)/i
  ];
  
  // Department patterns
  const departmentPatterns = [
    /(?:department|school|division)\s+of\s+([^,\n\r]+)/i,
    /([^,\n\r]+\s+department)/i,
    /([^,\n\r]+\s+school)/i
  ];
  
  // Extract course code
  let courseCode: string | null = null;
  for (const pattern of courseCodePatterns) {
    const match = text.match(pattern);
    if (match) {
      courseCode = match[1].toUpperCase().replace(/[-_\s]/g, '');
      break;
    }
  }
  
  // Extract course title
  let courseTitle: string | null = null;
  for (const pattern of courseTitlePatterns) {
    const match = text.match(pattern);
    if (match) {
      courseTitle = match[1].trim();
      break;
    }
  }
  
  // Extract instructor
  let instructor: string | null = null;
  for (const pattern of instructorPatterns) {
    const match = text.match(pattern);
    if (match) {
      instructor = match[1].trim();
      break;
    }
  }
  
  // Extract email
  let instructorEmail: string | null = null;
  for (const pattern of emailPatterns) {
    const match = text.match(pattern);
    if (match) {
      instructorEmail = match[1].toLowerCase();
      break;
    }
  }
  
  // Extract semester and year
  let semester: string | null = null;
  let year: string | null = null;
  for (const pattern of semesterPatterns) {
    const match = text.match(pattern);
    if (match) {
      const sem = match[1].toLowerCase();
      if (sem.startsWith('f')) semester = 'fall';
      else if (sem.startsWith('s') && sem.length > 1) semester = 'spring';
      else if (sem.startsWith('su')) semester = 'summer';
      else if (sem.startsWith('w')) semester = 'winter';
      else if (sem.startsWith('a')) semester = 'autumn';
      else semester = sem;
      
      year = match[2] || match[1].match(/\d{4}/)?.[0] || null;
      break;
    }
  }
  
  // Extract university
  let university: string | null = null;
  for (const pattern of universityPatterns) {
    const match = text.match(pattern);
    if (match) {
      university = match[1].trim();
      break;
    }
  }
  
  // Extract department
  let department: string | null = null;
  for (const pattern of departmentPatterns) {
    const match = text.match(pattern);
    if (match) {
      department = match[1].trim();
      break;
    }
  }
  
  // Calculate confidence
  const fields = [courseCode, courseTitle, instructor, semester, year, university, department].filter(Boolean);
  const confidence = fields.length / 7;
  
  return {
    courseCode,
    courseTitle,
    instructor,
    instructorEmail,
    semester,
    year,
    university,
    department,
    confidence,
    extractedAt: Date.now()
  };
}
