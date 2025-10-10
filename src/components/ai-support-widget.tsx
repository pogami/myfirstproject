'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

// Function to convert markdown-style links to HTML links
function formatMessageWithLinks(content: string): JSX.Element {
  const parts: JSX.Element[] = [];
  let currentIndex = 0;
  
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > currentIndex) {
      parts.push(
        <span key={`text-${currentIndex}`}>
          {content.substring(currentIndex, match.index)}
        </span>
      );
    }
    
    // Add the link
    parts.push(
      <a
        key={`link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 underline font-medium"
      >
        {match[1]}
      </a>
    );
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last link
  if (currentIndex < content.length) {
    parts.push(
      <span key={`text-${currentIndex}`}>
        {content.substring(currentIndex)}
      </span>
    );
  }
  
  return <>{parts.length > 0 ? parts : content}</>;
}

export function AISupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your CourseConnect AI assistant. Ask me anything about our platform, pricing, features, or how to get started!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0); // Reset unread when opening
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input.trim(),
          context: `You are CourseConnect's AI SUPPORT ASSISTANT. You ONLY help with CourseConnect platform questions.

IMPORTANT: You ONLY respond to questions about:
- CourseConnect features, pricing, signup
- Platform navigation and help
- Technical support issues
- Account/billing questions

DO NOT respond to:
- General academic questions (math, science, homework)
- General knowledge questions
- Non-CourseConnect related topics

If someone asks a general question, say: "I'm CourseConnect's support assistant. I can only help with questions about our platform. For academic help, try our AI tutoring features! Please sign up here: [Get Started](https://courseconnectai.com/dashboard)"

ABOUT COURSECONNECT:
- AI-powered study platform for college students
- Features: AI syllabus analysis, homework help, study groups, 24/7 AI tutoring, smart scheduling
- Pricing: Free tier available + Premium ($4.99/month) with unlimited AI help
- Privacy: FERPA compliant, end-to-end encrypted
- Available 24/7 with instant AI responses

IMPORTANT - HOW TO PROVIDE LINKS:
When users ask "where is X page" or need to visit a page, provide the link in this EXACT format: [Page Name](URL)

Available pages:
- Pricing page: [View Pricing](https://courseconnectai.com/pricing)
- About page: [About Us](https://courseconnectai.com/about)
- Sign up/Dashboard: [Get Started](https://courseconnectai.com/dashboard)
- Contact page: [Contact Us](https://courseconnectai.com/contact)
- Privacy policy: [Privacy Policy](https://courseconnectai.com/privacy)
- Terms of service: [Terms of Service](https://courseconnectai.com/terms)
- Home page: [Home](https://courseconnectai.com)

RESPONSE STYLE:
- Keep responses SHORT and DIRECT (1-2 sentences max)
- Be helpful but concise
- When users ask "where is the pricing page" or similar, say "You can find it here: [View Pricing](https://courseconnectai.com/pricing)"
- Always use the [text](url) format for links - NEVER show raw URLs
- If it's a crisis/safety issue, provide immediate help resources`,
          conversationHistory: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          shouldCallAI: true,
          isPublicChat: false
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.response || "I'm here to help! Could you rephrase your question?",
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // If chat is closed, increment unread counter
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again or contact us at support@courseconnectai.com",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Open AI Support Chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white animate-bounce">
              {unreadCount}
            </span>
          )}
          
          {/* Online indicator (only when no unread) */}
          {unreadCount === 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                {/* Live pulsing status */}
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">CourseConnect AI Support</h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.role === 'assistant' ? formatMessageWithLinks(msg.content) : msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}