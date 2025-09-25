/**
 * @fileOverview AI-Powered Syllabus Content Extraction
 * 
 * Uses OpenAI API to intelligently parse and structure syllabus content
 */

import { ParsedSyllabus, ParsingResult } from '@/types/syllabus-parsing';

export class AISyllabusParser {
  
  /**
   * Parse syllabus text using AI
   */
  static async parseSyllabus(
    text: string, 
    filename: string,
    format: 'pdf' | 'docx' | 'txt' | 'image'
  ): Promise<ParsingResult> {
    try {
      const prompt = this.createParsingPrompt(text);
      
      const response = await fetch('/api/syllabus-parser/ai-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          filename,
          format
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI parsing failed: ${response.status}`);
      }
      
      const result = await response.json();
      return this.validateAndScoreResult(result);
      
    } catch (error) {
      console.error('AI parsing error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        confidence: 0,
        requiresReview: true
      };
    }
  }
  
  /**
   * Create optimized prompt for syllabus parsing
   */
  private static createParsingPrompt(text: string): string {
    return `
You are an expert at parsing academic syllabi. Extract structured information from the following syllabus text and return it as valid JSON.

SYLLABUS TEXT:
${text}

EXTRACT THE FOLLOWING INFORMATION:

1. Course Information:
   - title: Course title
   - instructor: Instructor name
   - credits: Number of credit hours
   - semester: Semester (Fall, Spring, Summer)
   - year: Academic year
   - courseCode: Course code (e.g., CS101)
   - department: Department name

2. Schedule:
   - Array of schedule items with: day, time, location, type (lecture/lab/discussion/exam/office_hours), description

3. Assignments:
   - Array of assignments with: name, type (homework/exam/project/quiz/paper/presentation), dueDate (ISO string), weight (percentage), description, instructions

4. Grading Policy:
   - breakdown: Object with assignment types and their weights
   - scale: Object with letter grades and their ranges
   - policies: Array of grading-related policies

5. Readings:
   - Array of readings with: title, author, required (boolean), week, chapter, pages, type (textbook/article/handout/online)

6. Policies:
   - attendance: Attendance policy
   - late: Late work policy
   - academic_integrity: Academic integrity policy
   - technology: Technology policy
   - other: Array of other policies

7. Contacts:
   - instructor: Object with name, email, phone, office, office_hours
   - tas: Array of TAs with name, email, office_hours

IMPORTANT RULES:
- Return ONLY valid JSON, no additional text
- Use null for missing information
- Dates should be in ISO format (YYYY-MM-DD)
- Be conservative with confidence - if uncertain, mark for review
- Extract what you can find, don't make up information

Return format:
{
  "courseInfo": { ... },
  "schedule": [ ... ],
  "assignments": [ ... ],
  "gradingPolicy": { ... },
  "readings": [ ... ],
  "policies": { ... },
  "contacts": { ... },
  "confidence": 0.85,
  "requiresReview": false,
  "extractedFields": ["title", "instructor", "schedule"],
  "missingFields": ["readings", "policies"]
}
`;
  }
  
  /**
   * Validate and score the AI parsing result
   */
  private static validateAndScoreResult(result: any): ParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate required fields
    if (!result.courseInfo) {
      errors.push('Course information not found');
    }
    
    if (!result.courseInfo?.title) {
      warnings.push('Course title not found');
    }
    
    if (!result.courseInfo?.instructor) {
      warnings.push('Instructor name not found');
    }
    
    // Calculate confidence score
    let confidence = result.confidence || 0.5;
    
    // Adjust confidence based on extracted fields
    const extractedFields = result.extractedFields || [];
    const totalFields = 7; // courseInfo, schedule, assignments, gradingPolicy, readings, policies, contacts
    const fieldScore = extractedFields.length / totalFields;
    
    confidence = Math.min(confidence, fieldScore);
    
    // Determine if review is required
    const requiresReview = confidence < 0.7 || warnings.length > 2 || errors.length > 0;
    
    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      confidence,
      requiresReview
    };
  }
  
  /**
   * Extract specific information with targeted prompts
   */
  static async extractSpecificInfo(
    text: string,
    infoType: 'assignments' | 'schedule' | 'grading' | 'readings'
  ): Promise<any> {
    const prompts = {
      assignments: `Extract all assignments, exams, and due dates from this text. Return as JSON array with name, type, dueDate, weight, description.`,
      schedule: `Extract class schedule information from this text. Return as JSON array with day, time, location, type, description.`,
      grading: `Extract grading policy and grade breakdown from this text. Return as JSON with breakdown, scale, policies.`,
      readings: `Extract required and optional readings from this text. Return as JSON array with title, author, required, week, type.`
    };
    
    try {
      const response = await fetch('/api/syllabus-parser/ai-extract-specific', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          prompt: prompts[infoType]
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error extracting ${infoType}:`, error);
      return null;
    }
  }
}
