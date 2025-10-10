// Utility function to clean up AI responses for conversational format
export function cleanAIResponse(response: string, isCodingQuestion: boolean = false): string {
  if (!response) return '';
  
  // Remove thinking content (content between <think> tags) - more robust regex
  let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Also remove tool_call tags (Lucy model sometimes uses these)
  cleaned = cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '');
  
  // Also remove any remaining <think> or </think> tags that might be malformed
  cleaned = cleaned.replace(/<\/?think[^>]*>/gi, '');
  
  // Remove any remaining tool_call tags
  cleaned = cleaned.replace(/<\/?tool_call[^>]*>/gi, '');
  
  // For coding questions, preserve code blocks
  if (isCodingQuestion) {
    // Only remove thinking content, keep everything else including code blocks
    return cleaned.trim();
  }
  
  // Preserve math expressions before cleaning
  const mathExpressions: string[] = [];
  let mathIndex = 0;
  
  // Find and temporarily replace math expressions
  cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, (match) => {
    mathExpressions.push(match);
    return `__MATH_${mathIndex++}__`;
  });
  
  // Convert to conversational format
  cleaned = cleaned
    // Remove markdown headers and convert to natural text
    .replace(/^#{1,6}\s*/gm, '')
    // Remove horizontal rules
    .replace(/^-{3,}\s*$/gm, '')
    // Remove excessive asterisks for bolding
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove code blocks
    .replace(/```[\w]*\n?/g, '')
    .replace(/```/g, '')
    // Convert bullet points to natural flow
    .replace(/^[\s]*[-*+]\s*/gm, '• ')
    // Remove numbered lists
    .replace(/^\d+\.\s*/gm, '')
    // Clean up excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove excessive spaces
    .replace(/[ \t]+/g, ' ')
    // Remove standalone emojis/symbols
    .replace(/^[🧠🔄📚💡📝💬]\s*/gm, '')
    // Clean up spacing
    .trim();
  
  // Restore math expressions
  cleaned = cleaned.replace(/__MATH_(\d+)__/g, (match, index) => {
    return mathExpressions[parseInt(index)] || match;
  });
  
  // Convert to natural paragraph format
  const lines = cleaned.split('\n').filter(line => line.trim().length > 0);
  
  // Group lines into natural paragraphs
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Start new paragraph for bullet points or very short lines
    if (trimmedLine.startsWith('•') || trimmedLine.length < 50) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
      currentParagraph += trimmedLine + ' ';
    } else {
      currentParagraph += trimmedLine + ' ';
    }
  }
  
  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }
  
  // Join paragraphs with proper spacing
  cleaned = paragraphs.join('\n\n').trim();
  
  // Final cleanup
  cleaned = cleaned
    .replace(/^\s*[•-]\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return cleaned;
}

// Function to extract thinking content - ONLY from complex questions with proper thinking tags
export function extractThinkingContent(response: string): string {
  if (!response) return '';

  // First try to extract from proper <think> tags at the beginning
  const thinkingMatch = response.match(/^<think>([\s\S]*?)<\/think>/i);
  if (thinkingMatch) {
    return thinkingMatch[1].trim();
  }

  // Fallback: try to extract from <tool_call> tags (Lucy model sometimes uses these)
  const toolCallMatch = response.match(/^<tool_call>([\s\S]*?)<\/tool_call>/i);
  if (toolCallMatch) {
    return toolCallMatch[1].trim();
  }

  // NO FALLBACK - if no proper thinking tags, return empty string
  // This ensures simple greetings don't show thinking indicators
  return '';
}

// Function to check if response contains thinking content
export function hasThinkingContent(response: string): boolean {
  return /<think>[\s\S]*?<\/think>/i.test(response);
}