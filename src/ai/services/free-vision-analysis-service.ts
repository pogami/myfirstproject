'use server';

import * as Tesseract from 'tesseract.js';

export type FreeVisionProvider = 'tesseract-ocr' | 'file-analysis' | 'fallback';

export interface FreeVisionAnalysisInput {
  imageData: string; // Base64 encoded image data
  fileName: string;
  fileType: string;
  tutorSpecialty: string;
  tutorDescription: string;
}

export interface FreeVisionAnalysisResult {
  analysis: string;
  provider: FreeVisionProvider;
  extractedText?: string;
  confidence?: number;
  error?: string;
}

/**
 * Analyzes an image using free OCR (Tesseract.js) and intelligent text analysis.
 * This is a free alternative to paid vision APIs.
 */
export async function analyzeImageWithFreeVision(input: FreeVisionAnalysisInput): Promise<FreeVisionAnalysisResult> {
  const { imageData, fileName, fileType, tutorSpecialty, tutorDescription } = input;

  try {
    // Convert base64 to buffer for Tesseract
    const base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    const buffer = Buffer.from(base64Data, 'base64');

    // Use Tesseract.js for OCR
    const { data: { text, confidence } } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Clean up the extracted text
    const cleanedText = text.trim().replace(/\n\s*\n/g, '\n').trim();
    
    // Generate intelligent analysis based on extracted text
    const analysis = generateIntelligentAnalysis({
      extractedText: cleanedText,
      fileName,
      fileType,
      tutorSpecialty,
      tutorDescription,
      confidence
    });

    return {
      analysis,
      provider: 'tesseract-ocr',
      extractedText: cleanedText,
      confidence: Math.round(confidence)
    };

  } catch (error: any) {
    console.warn('Tesseract OCR failed:', error.message);
    
    // Fallback to file-based analysis
    const fallbackAnalysis = generateFallbackAnalysis({
      fileName,
      fileType,
      tutorSpecialty,
      tutorDescription
    });

    return {
      analysis: fallbackAnalysis,
      provider: 'file-analysis',
      error: error.message
    };
  }
}

/**
 * Generates intelligent analysis based on OCR-extracted text
 */
function generateIntelligentAnalysis(params: {
  extractedText: string;
  fileName: string;
  fileType: string;
  tutorSpecialty: string;
  tutorDescription: string;
  confidence: number;
}): string {
  const { extractedText, fileName, fileType, tutorSpecialty, tutorDescription, confidence } = params;

  // Analyze the content type based on extracted text
  const contentAnalysis = analyzeContentType(extractedText);
  
  let analysis = `## 📸 **Image Analysis Complete!**

**File Information:**
• **File:** ${fileName}
• **Type:** ${fileType}
• **OCR Confidence:** ${confidence}%

---

## 📝 **Extracted Content:**

${extractedText ? `\`\`\`\n${extractedText}\n\`\`\`` : '*No readable text detected*'}

---

## 🔍 **Content Analysis:**

${contentAnalysis.description}

---

## 🎯 **Educational Insights:**

${contentAnalysis.educationalInsights}

---

## 💡 **Key Information Identified:**

${contentAnalysis.keyPoints.map(point => `• ${point}`).join('\n')}

---

## 📚 **Study Recommendations:**

${contentAnalysis.studyRecommendations.map(rec => `• ${rec}`).join('\n')}

---

## ❓ **Questions for Further Learning:**

${contentAnalysis.questions.map(q => `• ${q}`).join('\n')}

---

${tutorSpecialty !== 'General' ? `**Specialized ${tutorSpecialty} Focus:**\nAs your ${tutorSpecialty} tutor specializing in ${tutorDescription}, I can provide additional context and explanations specific to your field. Feel free to ask me about any concepts you'd like me to elaborate on!` : '**General Analysis:**\nI can provide comprehensive analysis across multiple subjects. Let me know if you need clarification on any specific concepts!'}`;

  return analysis;
}

/**
 * Analyzes the type of content based on extracted text
 */
function analyzeContentType(text: string): {
  description: string;
  educationalInsights: string;
  keyPoints: string[];
  studyRecommendations: string[];
  questions: string[];
} {
  const lowerText = text.toLowerCase();
  
  // Detect content type
  let contentType = 'general';
  let description = 'This appears to be a general document or image with text content.';
  
  if (lowerText.includes('equation') || lowerText.includes('formula') || lowerText.includes('=') || lowerText.includes('+') || lowerText.includes('-') || lowerText.includes('×') || lowerText.includes('÷')) {
    contentType = 'mathematics';
    description = 'This appears to be a mathematical document containing equations, formulas, or mathematical expressions.';
  } else if (lowerText.includes('chapter') || lowerText.includes('section') || lowerText.includes('lesson') || lowerText.includes('unit')) {
    contentType = 'educational';
    description = 'This appears to be educational material, possibly from a textbook, lecture notes, or study guide.';
  } else if (lowerText.includes('diagram') || lowerText.includes('chart') || lowerText.includes('graph') || lowerText.includes('figure')) {
    contentType = 'diagram';
    description = 'This appears to be a diagram, chart, or visual representation with accompanying text.';
  } else if (lowerText.includes('definition') || lowerText.includes('term') || lowerText.includes('concept')) {
    contentType = 'definitions';
    description = 'This appears to contain definitions, terms, or conceptual explanations.';
  }

  // Generate insights based on content type
  const insights = {
    mathematics: 'Mathematical content detected! This is excellent for understanding formulas, equations, and problem-solving techniques.',
    educational: 'Educational material identified! This content is structured for learning and knowledge retention.',
    diagram: 'Visual diagram with text! This combines visual and textual learning for better comprehension.',
    definitions: 'Definition-based content! This is perfect for building vocabulary and understanding key concepts.',
    general: 'General text content! This can be analyzed for various educational purposes.'
  };

  // Generate key points
  const keyPoints = [
    'Text successfully extracted using OCR technology',
    'Content analyzed for educational value',
    'Ready for detailed explanation and discussion'
  ];

  // Add content-specific key points
  if (contentType === 'mathematics') {
    keyPoints.push('Mathematical expressions identified');
    keyPoints.push('Equations and formulas detected');
  } else if (contentType === 'educational') {
    keyPoints.push('Educational structure recognized');
    keyPoints.push('Learning objectives may be present');
  }

  // Generate study recommendations
  const studyRecommendations = [
    'Review the extracted text carefully',
    'Ask specific questions about unclear concepts',
    'Request additional examples or explanations',
    'Practice with related problems or exercises'
  ];

  // Generate questions
  const questions = [
    'Can you explain the main concepts in this image?',
    'What are the key takeaways from this content?',
    'How does this relate to what we\'ve studied before?',
    'Can you provide additional examples?',
    'What should I focus on when studying this material?'
  ];

  return {
    description,
    educationalInsights: insights[contentType as keyof typeof insights],
    keyPoints,
    studyRecommendations,
    questions
  };
}

/**
 * Generates fallback analysis when OCR fails
 */
function generateFallbackAnalysis(params: {
  fileName: string;
  fileType: string;
  tutorSpecialty: string;
  tutorDescription: string;
}): string {
  const { fileName, fileType, tutorSpecialty, tutorDescription } = params;

  const specializedText = tutorSpecialty !== 'General' 
    ? `**Specialized ${tutorSpecialty} Support:**\nAs your ${tutorSpecialty} tutor specializing in ${tutorDescription}, I'm ready to provide expert analysis once you describe the content!`
    : '**General Support:**\nI\'m ready to help with any subject once you describe what you see in the image!';

  return `## 📸 **Image Analysis (Fallback Mode)**

**File Information:**
• **File:** ${fileName}
• **Type:** ${fileType}
• **Status:** OCR processing unavailable

---

## 🔍 **What I Can Help With:**

• **Content Description:** Please describe what you see in the image, and I can provide detailed analysis
• **Educational Context:** I can explain concepts based on your description
• **Study Assistance:** I can help with related topics and provide additional resources

---

## 💡 **How to Get Better Analysis:**

1. **Describe the Image:** Tell me what you see (text, diagrams, charts, etc.)
2. **Ask Specific Questions:** What concepts would you like me to explain?
3. **Share Context:** What subject or topic is this related to?

---

## 📚 **Example Questions You Can Ask:**

• "This image shows a diagram of [describe]. Can you explain how it works?"
• "I see text about [topic]. Can you help me understand the key concepts?"
• "This appears to be [subject] material. Can you provide additional context?"

---

${specializedText}

**Ready to help!** Just describe what you see, and I'll provide comprehensive analysis and explanations.`;
}
