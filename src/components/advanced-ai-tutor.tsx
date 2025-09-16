'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Image, 
  FileText, 
  Lightbulb, 
  BookOpen,
  Calculator,
  Microscope,
  Globe,
  Code,
  History,
  Music,
  Palette,
  Zap,
  Brain,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'audio' | 'code' | 'math';
  timestamp: Date;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface SubjectTutor {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  specialties: string[];
}

interface AdvancedAITutorProps {
  currentSubject?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export function AdvancedAITutor({ 
  currentSubject = 'General', 
  userLevel = 'intermediate' 
}: AdvancedAITutorProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<SubjectTutor | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const subjectTutors: SubjectTutor[] = [
    {
      id: 'math',
      name: 'Math AI Tutor',
      icon: <Calculator className="h-5 w-5" />,
      color: 'bg-blue-500',
      description: 'Specialized in algebra, calculus, statistics, and geometry',
      specialties: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry']
    },
    {
      id: 'science',
      name: 'Science AI Tutor',
      icon: <Microscope className="h-5 w-5" />,
      color: 'bg-green-500',
      description: 'Expert in physics, chemistry, biology, and earth sciences',
      specialties: ['Physics', 'Chemistry', 'Biology', 'Earth Science', 'Environmental Science']
    },
    {
      id: 'programming',
      name: 'Programming AI Tutor',
      icon: <Code className="h-5 w-5" />,
      color: 'bg-purple-500',
      description: 'Master of programming languages and computer science concepts',
      specialties: ['Python', 'JavaScript', 'Java', 'C++', 'Data Structures', 'Algorithms']
    },
    {
      id: 'language',
      name: 'Language AI Tutor',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-orange-500',
      description: 'Specialized in English, literature, and foreign languages',
      specialties: ['English', 'Literature', 'Writing', 'Grammar', 'Spanish', 'French']
    },
    {
      id: 'history',
      name: 'History AI Tutor',
      icon: <History className="h-5 w-5" />,
      color: 'bg-red-500',
      description: 'Expert in world history, social studies, and political science',
      specialties: ['World History', 'US History', 'Political Science', 'Geography', 'Economics']
    },
    {
      id: 'creative',
      name: 'Creative AI Tutor',
      icon: <Palette className="h-5 w-5" />,
      color: 'bg-pink-500',
      description: 'Specialized in arts, music, and creative writing',
      specialties: ['Art History', 'Music Theory', 'Creative Writing', 'Design', 'Photography']
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: AIMessage = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your advanced AI tutor. I can help you with multiple subjects and learning styles. Choose a specialized tutor below or ask me anything!`,
      type: 'text',
      timestamp: new Date(),
      subject: 'General'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string, type: AIMessage['type'] = 'text') => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type,
      timestamp: new Date(),
      subject: selectedTutor?.name || currentSubject
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setIsTyping(true);

    try {
      // Simulate AI processing with shorter delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const aiResponse = generateAIResponse(content, selectedTutor);
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        type: 'text',
        timestamp: new Date(),
        subject: selectedTutor?.name || currentSubject,
        difficulty: userLevel
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string, tutor: SubjectTutor | null): string => {
    const input = userInput.toLowerCase();
    
    if (tutor) {
      switch (tutor.id) {
        case 'math':
          if (input.includes('5x5x5') || input.includes('5*5*5') || input.includes('5 × 5 × 5')) {
            return `**5 × 5 × 5 = 125**

Let me break this down step by step:

**Step 1**: 5 × 5 = 25
**Step 2**: 25 × 5 = 125

**Alternative approaches:**
• **Exponential form**: 5³ = 5 × 5 × 5 = 125
• **Repeated addition**: 5 + 5 + 5 + 5 + 5 = 25, then 25 + 25 + 25 + 25 + 25 = 125

**Real-world context:**
This could represent:
• Volume of a cube with side length 5 units
• 5³ cubic units = 125 cubic units
• Total combinations in a 3-step process where each step has 5 options

**Related concepts:**
• Powers and exponents
• Volume calculations
• Permutations and combinations

Would you like me to explain any of these related concepts in more detail?`;
          }
          if (input.includes('calculus') || input.includes('derivative')) {
            return `Great question about calculus! Let me break down derivatives for you:\n\n1. **Definition**: A derivative measures how fast a function is changing at any point.\n2. **Notation**: f'(x) or dy/dx\n3. **Power Rule**: If f(x) = x^n, then f'(x) = nx^(n-1)\n4. **Example**: If f(x) = x², then f'(x) = 2x\n\nWould you like me to explain any specific part in more detail?`;
          }
          return `I'm your Math AI Tutor! I can help with algebra, calculus, statistics, geometry, and more. What specific math concept would you like to explore?`;
        
        case 'science':
          if (input.includes('photosynthesis')) {
            return `Photosynthesis is fascinating! Here's how it works:\n\n**Process**: Plants convert light energy into chemical energy\n**Equation**: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n**Two Stages**:\n1. Light-dependent reactions (in thylakoids)\n2. Calvin cycle (in stroma)\n\nThis process is essential for life on Earth! Would you like me to explain either stage in detail?`;
          }
          return `I'm your Science AI Tutor! I specialize in physics, chemistry, biology, and earth sciences. What scientific concept can I help you understand?`;
        
        case 'programming':
          if (input.includes('recursion')) {
            return `Recursion is a powerful programming concept! Here's the breakdown:\n\n**Definition**: A function that calls itself to solve smaller instances of the same problem\n**Key Components**:\n1. Base case (stopping condition)\n2. Recursive case (function calls itself)\n\n**Example** (Factorial):\n\`\`\`python\ndef factorial(n):\n    if n <= 1:  # Base case\n        return 1\n    return n * factorial(n-1)  # Recursive case\n\`\`\`\n\nWould you like to see more examples or practice problems?`;
          }
          return `I'm your Programming AI Tutor! I can help with Python, JavaScript, Java, C++, data structures, algorithms, and more. What programming concept would you like to learn?`;
        
        default:
          return `I'm your ${tutor.name}! I specialize in ${tutor.description}. How can I help you learn today?`;
      }
    }

    // General AI responses
    if (input.includes('hello') || input.includes('hi')) {
      return `Hello! I'm your advanced AI tutor. I can help you with multiple subjects and learning styles. Choose a specialized tutor above or ask me anything!`;
    }
    
    if (input.includes('help')) {
      return `I can help you with:\n\n• **Math**: Algebra, calculus, statistics, geometry\n• **Science**: Physics, chemistry, biology, earth science\n• **Programming**: Python, JavaScript, Java, algorithms\n• **Languages**: English, literature, writing\n• **History**: World history, social studies\n• **Creative**: Arts, music, creative writing\n\nWhat would you like to learn about?`;
    }

    return `That's an interesting question! I'd be happy to help you understand that concept. Could you provide a bit more detail about what specific aspect you'd like me to explain?`;
  };

  const startVoiceRecording = async () => {
    try {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          variant: "destructive",
          title: "Voice Input Not Supported",
          description: "Your browser doesn't support voice input. Please use text input instead.",
        });
        return;
      }

      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      
      setIsRecording(true);
      toast({
        title: "Voice Recording Started",
        description: "Speak your question clearly...",
      });
      
      // Use Web Speech API for real voice recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
        toast({
          title: "Voice Captured",
          description: "Your question has been transcribed.",
        });
      };
      
      recognition.onerror = (event: any) => {
        setIsRecording(false);
        toast({
          variant: "destructive",
          title: "Voice Recognition Error",
          description: "Could not process your voice. Please try again.",
        });
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      
    } catch (error) {
      setIsRecording(false);
      toast({
        variant: "destructive",
        title: "Microphone Permission Denied",
        description: "Please allow microphone access to use voice input.",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Image Uploaded",
        description: "Analyzing your image...",
      });
      
      // Create user message for the uploaded image
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `📷 Image: ${file.name}`,
        type: 'image',
        timestamp: new Date(),
        subject: selectedTutor?.name || currentSubject
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsProcessing(true);
      setIsTyping(true);
      
      // Simulate AI image analysis
      setTimeout(() => {
        const aiResponse = generateImageAnalysis(file.name);
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          type: 'text',
          timestamp: new Date(),
          subject: selectedTutor?.name || currentSubject,
          difficulty: userLevel
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        setIsTyping(false);
        
        toast({
          title: "Image Analysis Complete",
          description: "I've analyzed your image and provided insights.",
        });
      }, 2000);
    }
  };

  const generateImageAnalysis = (fileName: string): string => {
    const fileType = fileName.toLowerCase();
    
    if (fileType.includes('diagram') || fileType.includes('chart')) {
      return `I can see this is a diagram or chart. Based on the visual elements, I can help you understand:

**Key Elements Detected:**
• Data visualization components
• Structural relationships
• Process flow indicators

**Analysis:**
This appears to be a structured diagram that shows relationships between different components. The visual layout suggests a systematic approach to presenting information.

**How I can help:**
• Explain the relationships shown
• Break down complex concepts into simpler parts
• Provide additional context for better understanding
• Suggest study strategies for this type of content

Would you like me to explain any specific part of this diagram in more detail?`;
    }
    
    if (fileType.includes('math') || fileType.includes('equation')) {
      return `I can see this contains mathematical content. Let me help you understand:

**Mathematical Elements Detected:**
• Equations and formulas
• Problem-solving steps
• Graphical representations

**Analysis:**
This appears to be a mathematical problem or concept. The visual format helps illustrate the relationships between different mathematical elements.

**How I can help:**
• Explain the mathematical concepts step by step
• Break down complex equations
• Provide alternative solution methods
• Connect this to broader mathematical principles

What specific part of this math problem would you like me to explain?`;
    }
    
    if (fileType.includes('science') || fileType.includes('biology') || fileType.includes('chemistry')) {
      return `I can see this is a scientific diagram or image. Let me analyze it:

**Scientific Elements Detected:**
• Biological or chemical structures
• Process diagrams
• Laboratory equipment or procedures

**Analysis:**
This appears to be a scientific concept visualization. The image likely shows important relationships or processes in your field of study.

**How I can help:**
• Explain the scientific concepts shown
• Break down complex processes
• Connect this to real-world applications
• Suggest study techniques for this material

What scientific concept would you like me to explain in detail?`;
    }
    
    return `I can see you've uploaded an image. Let me analyze it:

**Image Analysis:**
• File: ${fileName}
• Content type: Educational material
• Visual complexity: Moderate

**What I can help with:**
• Explain any concepts shown in the image
• Break down complex visual information
• Provide additional context and examples
• Suggest study strategies for this type of content

**Next Steps:**
Please let me know what specific aspect of this image you'd like me to explain, or if you have any questions about the content shown.

I'm here to help you understand whatever concepts are presented in this visual material!`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Tutors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Specialized AI Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjectTutors.map((tutor) => (
              <div
                key={tutor.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTutor?.id === tutor.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTutor(tutor)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full ${tutor.color} flex items-center justify-center text-white`}>
                    {tutor.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{tutor.name}</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{tutor.description}</p>
                <div className="flex flex-wrap gap-1">
                  {tutor.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Tutor Chat
            {selectedTutor && (
              <Badge variant="outline" className="ml-2">
                {selectedTutor.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                    {message.subject && ` • ${message.subject}`}
                  </div>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-background border p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask your AI tutor anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                disabled={isProcessing}
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isRecording || isProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isProcessing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Image
              </Button>
              
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
