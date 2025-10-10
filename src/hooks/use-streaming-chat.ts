import { useState, useCallback } from 'react';

interface StreamingMessage {
  type: 'status' | 'content' | 'done' | 'thinking';
  message?: string;
  content?: string;
  fullResponse?: string;
  thinking?: string;
}

interface UseStreamingChatOptions {
  onStatusUpdate?: (status: string) => void;
  onContentUpdate?: (content: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
  onThinkingUpdate?: (thinking: string) => void;
  timeout?: number; // Timeout in milliseconds, default 120 seconds
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [currentContent, setCurrentContent] = useState<string>('');
  const [fullResponse, setFullResponse] = useState<string>('');
  const [thinking, setThinking] = useState<string>('');

  const sendMessage = useCallback(async (
    question: string,
    context?: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ) => {
    // Prevent multiple simultaneous requests
    if (isStreaming) {
      console.warn('Already streaming, ignoring new request');
      return;
    }
    
    setIsStreaming(true);
    setCurrentStatus('');
    // Don't reset content immediately - let it show "AI is thinking..." until we get actual content
    setFullResponse('');
    setThinking('');

    // Create abort controller for better control
    const abortController = new AbortController();
    const timeout = options.timeout || 300000; // Default 5 minutes
    
    // Set up timeout - only abort if no data received for the full timeout period
    let timeoutId = setTimeout(() => {
      console.warn('Streaming timeout reached, aborting request');
      abortController.abort();
    }, timeout);

    try {
      // Determine userId for personalization
      let userId = 'guest';
      try {
        const possible =
          (typeof window !== 'undefined' && (localStorage.getItem('demo_user_id') || localStorage.getItem('guestUserId') || localStorage.getItem('guest_user_id'))) || '';
        if (possible) userId = possible;
      } catch {}

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CourseConnect-Client/1.0',
        },
        body: JSON.stringify({
          question: question,
          context: context,
          conversationHistory: conversationHistory,
          shouldCallAI: true,
          isPublicChat: false
        }),
        signal: abortController.signal
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Network error. Please check your connection and try again.');
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('API /api/chat failed:', response.status, text);
        throw new Error(`API call failed: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        console.error('No response body reader available');
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data: StreamingMessage = JSON.parse(line);
            
            switch (data.type) {
              case 'status':
                if (data.message) {
                  setCurrentStatus(data.message);
                  options.onStatusUpdate?.(data.message);
                }
                break;
                
              case 'content':
                if (data.content) {
                  setCurrentContent(prev => {
                    // If previous content was "AI is thinking..." or empty, start fresh
                    if (prev === '' || prev === 'AI is thinking...') {
                      return data.content;
                    }
                    return prev + data.content;
                  });
                  options.onContentUpdate?.(data.content);
                }
                break;
                
              case 'thinking':
                if (data.thinking) {
                  setThinking(prev => prev + data.thinking);
                  options.onThinkingUpdate?.(data.thinking);
                }
                break;
                
              case 'done':
                if (data.fullResponse) {
                  setFullResponse(data.fullResponse);
                  options.onComplete?.(data.fullResponse);
                }
                break;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming chunk:', parseError);
            console.warn('Raw chunk:', line);
          }
        }
        
        // Don't reset timeout on every chunk - let the original timeout handle it
        // This prevents premature timeouts during AI thinking periods
      }

    } catch (error) {
      console.error('Streaming chat error:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Request was aborted (likely due to timeout)');
          options.onError?.(new Error('Request timed out. The AI is taking longer than expected to respond.'));
        } else if (error.message.includes('fetch')) {
          options.onError?.(new Error('Network error. Please check your connection and try again.'));
        } else {
          options.onError?.(error);
        }
      } else {
        options.onError?.(new Error('An unexpected error occurred'));
      }
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsStreaming(false);
    setCurrentStatus('');
    setCurrentContent('');
    setFullResponse('');
    setThinking('');
  }, []);

  return {
    isStreaming,
    currentStatus,
    currentContent,
    fullResponse,
    thinking,
    sendMessage,
    reset
  };
}