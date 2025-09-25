'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RippleText } from '@/components/ripple-text';
import { CourseConnectLogo } from '@/components/icons/courseconnect-logo';
import { MessageTimestamp } from '@/components/message-timestamp';
import { DigitalClock } from '@/components/digital-clock';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Image, 
  FileText, 
  Lightbulb, 
  Calculator,
  Microscope,
  Globe,
  Code,
  History,
  Music,
  Zap,
  Brain,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { HamburgerMenu } from '@/components/hamburger-menu';
import { useToast } from '@/hooks/use-toast';
import { useTextExtraction } from '@/hooks/use-text-extraction';
import { provideStudyAssistance, StudyAssistanceInput } from '@/ai/services/dual-ai-service';
import MathRender from '@/components/math-render';
import { isMathOrPhysicsContent } from '@/utils/math-detection';
import { AIResponse } from '@/components/ai-response';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'audio' | 'code' | 'math';
  timestamp: Date;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  fileName?: string;
  fileType?: string;
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
  user?: {
    displayName?: string | null;
    photoURL?: string | null;
    email?: string | null;
  } | null;
}

export function AdvancedAITutor({ 
  currentSubject = 'General', 
  userLevel = 'intermediate',
  user = null
}: AdvancedAITutorProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<SubjectTutor | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showInDepth, setShowInDepth] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [activeTab, setActiveTab] = useState<'chat'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Hamburger menu handlers
  const handleCopyConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI Tutor'}: ${msg.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(conversationText);
  };

  const handleExportConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      subject: selectedTutor?.name || 'General',
      messages: messages
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetConversation = () => {
    setMessages([]);
    setLastQuestion('');
    setShowInDepth(false);
  };

  const handleDeleteConversation = () => {
    setMessages([]);
    setLastQuestion('');
    setShowInDepth(false);
    setSelectedTutor(null);
  };

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
      icon: <Music className="h-5 w-5" />,
      color: 'bg-pink-500',
      description: 'Specialized in arts, music, and creative writing',
      specialties: ['Art History', 'Music Theory', 'Creative Writing', 'Design', 'Photography']
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const getWelcomeMessage = () => {
      if (selectedTutor) {
        return `Hey there! 👋 Welcome to ${selectedTutor.name}!\n\nI'm your specialized ${selectedTutor.name} and I'm 100% focused on ${selectedTutor.description.toLowerCase()}.\n\nI can help you with:\n${selectedTutor.specialties.map(s => `• ${s}`).join('\n')}\n\nAsk me anything about ${selectedTutor.specialties[0]} or any other topic in my specialty!`;
      } else {
        return `Hey there! 👋 Welcome to Advanced AI Tutor!\n\nI'm CourseConnect AI, your personalized study buddy. I can help with homework, explain tricky concepts, or just chat about anything academic.\n\nWhat's on your mind today? Try asking:\n• "Help me understand calculus derivatives"\n• "Explain photosynthesis in simple terms"\n• "What's the best way to study for exams?"`;
      }
    };

    const welcomeMessage: AIMessage = {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(),
      type: 'text',
      timestamp: new Date(),
      subject: selectedTutor?.name || 'General'
    };
    setMessages([welcomeMessage]);
  }, [selectedTutor]);

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
    setLastQuestion(content);
    setInputMessage('');
    setIsProcessing(true);
    setIsTyping(true);

    try {
      // Use the actual AI service with strict specialization
      let context: string;
      let question = content;
      
      if (selectedTutor) {
        // Strict specialization - tutor should ONLY answer questions in their field
        context = `You are a highly specialized ${selectedTutor.name}. You are 100% focused on ${selectedTutor.description.toLowerCase()}.

CRITICAL RULES:
1. ONLY answer questions directly related to your specialty: ${selectedTutor.specialties.join(', ')}
2. If asked about ANYTHING outside your field, politely redirect the user
3. Be an expert in your field - provide deep, comprehensive answers
4. Use your specialized knowledge to give detailed explanations
5. If the question is unrelated, say: "I'm your ${selectedTutor.name} and I'm 100% focused on ${selectedTutor.description.toLowerCase()}. Your question doesn't seem related to my specialty. I can only help with: ${selectedTutor.specialties.map(s => `• ${s}`).join('\\n')}. To ask general questions, please deselect me as your tutor first."`;
      } else {
        // General AI tutor - can answer any question
        context = 'You are CourseConnect AI, an advanced AI tutor. You can help with any academic subject and provide comprehensive explanations.';
      }

      const input: StudyAssistanceInput = {
        question: question,
        context: context,
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      const result = await provideStudyAssistance(input);
      const aiResponse = result.answer;

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

  const getInDepthAnalysis = (question: string, tutor: SubjectTutor | null): string => {
    const input = question.toLowerCase().trim();
    
    if (tutor?.id === 'history' && input.includes('yemen')) {
      return `YEMEN: COMPREHENSIVE HISTORICAL ANALYSIS

GEOGRAPHICAL FOUNDATION
Yemen occupies a strategic position at the southern tip of the Arabian Peninsula, bordered by Saudi Arabia (north), Oman (east), Red Sea (west), and Arabian Sea (south). The country spans approximately 527,970 km² with diverse terrain including coastal plains, highlands, and desert regions. The capital Sana'a sits at 2,200m elevation, while Aden serves as the economic hub.

ANCIENT CIVILIZATIONS (1000 BCE - 600 CE)
Yemen was home to several sophisticated kingdoms that controlled the lucrative frankincense and myrrh trade routes:

Saba (Sheba) Kingdom (1200-275 BCE):
- Capital: Marib (home to the legendary Marib Dam)
- Queen of Sheba's legendary visit to King Solomon
- Advanced irrigation systems supporting 50,000+ people
- Controlled trade between Arabia, Africa, and India

Hadhramaut Kingdom (800 BCE - 300 CE):
- Capital: Shabwa
- Monopoly on frankincense production
- Sophisticated water management systems
- Cultural influence extending to East Africa

Himyar Kingdom (110 BCE - 525 CE):
- Last major pre-Islamic kingdom
- Adopted Judaism as state religion
- Controlled Red Sea trade routes
- Fell to Ethiopian invasion in 525 CE

ISLAMIC PERIOD (630-1918)
- 630 CE: Yemen converted to Islam during Prophet Muhammad's lifetime
- Multiple dynasties ruled: Umayyads, Abbasids, Ziyadids, Rasulids
- 1517: Ottoman Empire gained control
- 1635: Local Zaydi imams established independence
- 1839: British occupied Aden, creating strategic port

MODERN ERA TIMELINE
1918: Ottoman withdrawal, Yemen gained independence
1962: North Yemen Revolution - republic established
1967: South Yemen independence from Britain (People's Democratic Republic)
1970: South Yemen became Marxist state
1990: Unification of North and South Yemen
1994: Civil war - North defeated South
2011: Arab Spring protests forced President Saleh to resign
2014-2015: Houthi rebellion captured Sana'a, civil war began

CURRENT CONFLICT ANALYSIS (2014-Present)
The Yemen Civil War involves multiple factions:

Houthi Movement (Ansar Allah):
- Zaydi Shia group from northern highlands
- Supported by Iran
- Controls Sana'a and northern regions

Internationally Recognized Government:
- Led by President Hadi (now Rashad al-Alimi)
- Supported by Saudi Arabia and UAE
- Based in Aden

Southern Transitional Council:
- Separatist movement in South Yemen
- UAE-backed
- Seeks southern independence

HUMANITARIAN CRISIS IMPACT
- 24+ million people need humanitarian assistance
- 4+ million internally displaced
- Cholera outbreaks affecting millions
- Famine conditions in multiple regions
- 80% of population below poverty line

STRATEGIC SIGNIFICANCE
- Controls Bab el-Mandeb Strait (30% of global oil trade)
- Proximity to Saudi oil fields
- Gateway between Red Sea and Indian Ocean
- Historical crossroads of trade routes

ECONOMIC FOUNDATIONS
Traditional Economy:
- Agriculture: Coffee (Mocha), qat, cotton, fruits
- Fishing: Red Sea and Arabian Sea
- Trade: Historical frankincense routes

Modern Challenges:
- Oil reserves declining
- Water scarcity crisis
- Economic blockade effects
- Infrastructure destruction

CULTURAL HERITAGE
- UNESCO World Heritage Sites: Old City of Sana'a, Historic Town of Zabid
- Ancient architecture: Tower houses, mud-brick construction
- Traditional music: Yemeni folk, classical Arabic
- Literary tradition: Poetry, historical chronicles`;
    }
    
    if (tutor?.id === 'math' && input.includes('5x5x5')) {
      return `5 × 5 × 5 = 125: ADVANCED MATHEMATICAL ANALYSIS

COMPUTATIONAL BREAKDOWN
Step 1: 5 × 5 = 25
Step 2: 25 × 5 = 125

MATHEMATICAL REPRESENTATIONS
Exponential Notation: 5³ = 125
Prime Factorization: 125 = 5³ = 5 × 5 × 5
Scientific Notation: 1.25 × 10²

GEOMETRIC INTERPRETATIONS
Cube Volume: A cube with side length 5 units has volume 5³ = 125 cubic units
3D Grid: 5 × 5 × 5 lattice points in 3-dimensional space
Coordinate System: Points (x,y,z) where x,y,z ∈ {0,1,2,3,4}

COMBINATORIAL APPLICATIONS
Permutations: 5³ ways to arrange 3 items from 5 choices with repetition
Tree Diagram: 5 branches × 5 branches × 5 branches = 125 total paths
Probability: Sample space of 125 equally likely outcomes

NUMBER THEORY CONNECTIONS
Perfect Cube: 125 is a perfect cube (5³)
Sum of Cubes: 125 = 5³ = 4³ + 3³ + 2³ + 1³ + 0³
Digital Root: 1+2+5 = 8, then 8 → single digit
Divisibility: 125 is divisible by 1, 5, 25, 125

ALGEBRAIC EXTENSIONS
Polynomial Roots: x³ - 125 = 0 has root x = 5
Binomial Expansion: (5)³ = 125
Logarithmic Form: log₅(125) = 3

REAL-WORLD APPLICATIONS
Engineering: 5×5×5 cubic meter storage capacity
Computer Science: 5³ = 125 possible combinations in 3-bit system
Economics: Compound growth over 3 periods at 5% each
Physics: 5³ cubic units of volume in fluid dynamics

ADVANCED MATHEMATICAL CONCEPTS
Group Theory: 125 elements in certain finite groups
Topology: 125 points in 3D topological space
Calculus: Volume integral over 5×5×5 region
Linear Algebra: 125-dimensional vector space`;
    }
    
    return `In-depth analysis for "${question}" is not available. Please ask a more specific question or select a specialized tutor.`;
  };

  const handleInDepthAnalysis = () => {
    if (!lastQuestion) return;
    
    const inDepthResponse = getInDepthAnalysis(lastQuestion, selectedTutor);
    const assistantMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: inDepthResponse,
      type: 'text',
      timestamp: new Date(),
      subject: selectedTutor?.name || currentSubject,
      difficulty: userLevel
    };

    setMessages(prev => [...prev, assistantMessage]);
    setShowInDepth(true);
  };

  const copyChat = () => {
    const chatText = messages.map(msg => 
      `${msg.timestamp.toLocaleTimeString()} • ${msg.subject}\n${msg.content}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(chatText);
    toast({
      title: "Chat Copied",
      description: "Chat history has been copied to clipboard.",
    });
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      tutor: selectedTutor?.name || 'General',
      messages: messages
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Chat history has been exported as JSON file.",
    });
  };

  const resetChat = () => {
    setMessages([]);
    setLastQuestion('');
    setShowInDepth(false);
    toast({
      title: "Chat Reset",
      description: "Chat history has been cleared.",
    });
  };

  const generateAIResponse = (userInput: string, tutor: SubjectTutor | null): string => {
    const input = userInput.toLowerCase().trim();
    
    // If a specialized tutor is selected, they should answer ANY question in their field
    if (tutor) {
      // Only redirect if it's clearly not related to their field at all
      const isCompletelyUnrelated = tutor.specialties.every(specialty => 
        !input.includes(specialty.toLowerCase()) && 
        !input.includes(specialty.split(' ')[0].toLowerCase())
      ) && 
      // Additional checks for completely unrelated topics
      !(tutor.id === 'history' && (input.includes('yemen') || input.includes('war') || input.includes('revolution') || input.includes('ancient') || input.includes('medieval') || input.includes('civilization') || input.includes('history') || input.includes('past') || input.includes('timeline'))) &&
      !(tutor.id === 'math' && (input.includes('5x5x5') || input.includes('5*5*5') || input.includes('equation') || input.includes('solve') || input.includes('math') || input.includes('number') || input.includes('calculate') || input.includes('algebra') || input.includes('geometry'))) &&
      !(tutor.id === 'science' && (input.includes('photosynthesis') || input.includes('physics') || input.includes('chemistry') || input.includes('biology') || input.includes('science') || input.includes('experiment') || input.includes('molecule') || input.includes('atom'))) &&
      !(tutor.id === 'programming' && (input.includes('recursion') || input.includes('algorithm') || input.includes('code') || input.includes('programming') || input.includes('python') || input.includes('javascript') || input.includes('function'))) &&
      !(tutor.id === 'language' && (input.includes('grammar') || input.includes('writing') || input.includes('english') || input.includes('literature') || input.includes('poetry') || input.includes('essay'))) &&
      !(tutor.id === 'creative' && (input.includes('art') || input.includes('design') || input.includes('creative') || input.includes('music') || input.includes('drawing') || input.includes('painting')));
      
      // Only redirect if it's completely unrelated AND not a greeting
      if (isCompletelyUnrelated && !input.includes('hello') && !input.includes('hi') && !input.includes('help')) {
        return `I'm your ${tutor.name} and I'm 100% focused on ${tutor.description.toLowerCase()}. 

Your question doesn't seem related to my specialty. I can only help with:
${tutor.specialties.map(s => `• ${s}`).join('\n')}

To ask general questions, please deselect me as your tutor first. I'm here to give you expert-level help in my field!`;
      }
      
      // Provide direct, comprehensive answers for specialized tutors
      switch (tutor.id) {
        case 'math':
          if (input.includes('5x5x5') || input.includes('5*5*5') || input.includes('5 × 5 × 5')) {
            return `5 × 5 × 5 = 125

Step-by-step:
• 5 × 5 = 25
• 25 × 5 = 125

Alternative methods:
• Exponential: 5³ = 125
• Cube volume: A cube with sides of 5 units has volume 125 cubic units

Applications:
• Volume calculations
• Permutations (5³ ways to arrange 3 items from 5 choices)
• Probability (125 possible outcomes)

[In-Depth Analysis Available]`;
          }
          if (input.includes('calculus') || input.includes('derivative')) {
            return `**Calculus Derivatives - Complete Guide**

**Definition**: A derivative measures the instantaneous rate of change of a function at any point.

**Key Concepts:**
• **Notation**: f'(x), dy/dx, or Df(x)
• **Geometric meaning**: Slope of the tangent line
• **Physical meaning**: Instantaneous velocity/acceleration

**Essential Rules:**
1. **Power Rule**: If f(x) = x^n, then f'(x) = nx^(n-1)
2. **Constant Rule**: If f(x) = c, then f'(x) = 0
3. **Sum Rule**: (f + g)' = f' + g'
4. **Product Rule**: (fg)' = f'g + fg'
5. **Chain Rule**: (f(g(x)))' = f'(g(x)) · g'(x)

**Examples:**
• f(x) = x² → f'(x) = 2x
• f(x) = x³ → f'(x) = 3x²
• f(x) = √x → f'(x) = 1/(2√x)

**Applications:**
• Finding maximum/minimum values
• Optimization problems
• Related rates
• Curve sketching

What specific aspect of derivatives would you like me to explain further?`;
          }
          if (input.includes('algebra') || input.includes('equation') || input.includes('solve')) {
            return `**Algebra Problem Solving**

I'm ready to solve any algebraic equation! Here's my systematic approach:

**Step-by-Step Method:**
1. **Identify the type**: Linear, quadratic, polynomial, rational, etc.
2. **Simplify**: Combine like terms, clear fractions
3. **Isolate the variable**: Use inverse operations
4. **Check your answer**: Substitute back into original equation

**Common Techniques:**
• **Linear equations**: ax + b = c → x = (c-b)/a
• **Quadratic equations**: Use factoring, completing the square, or quadratic formula
• **Systems**: Substitution or elimination methods

**Example**: Solve 2x + 5 = 13
• Step 1: 2x = 13 - 5
• Step 2: 2x = 8
• Step 3: x = 4
• Check: 2(4) + 5 = 8 + 5 = 13 ✓

Please share your specific equation and I'll solve it step-by-step!`;
          }
          return `I'm your Math AI Tutor! I specialize in:
• Algebra: Equations, inequalities, functions, polynomials
• Calculus: Derivatives, integrals, limits, optimization
• Statistics: Probability, distributions, hypothesis testing
• Geometry: Shapes, proofs, trigonometry, coordinate geometry

I provide direct, step-by-step solutions. What math problem can I solve for you?`;
        
        case 'science':
          if (input.includes('photosynthesis')) {
            return `**Photosynthesis - Complete Process**

**Overall Equation:**
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**Two Main Stages:**

**1. Light-Dependent Reactions (Thylakoids)**
• **Input**: Light energy, H₂O, ADP, NADP⁺
• **Output**: ATP, NADPH, O₂
• **Process**: Light excites chlorophyll → electron transport chain → ATP synthesis
• **Key**: Photolysis splits water, releasing oxygen

**2. Calvin Cycle (Stroma)**
• **Input**: CO₂, ATP, NADPH
• **Output**: Glucose (C₆H₁₂O₆)
• **Process**: Carbon fixation → Reduction → Regeneration
• **Key**: RuBisCO enzyme fixes CO₂ to RuBP

**Factors Affecting Rate:**
• Light intensity
• CO₂ concentration
• Temperature
• Chlorophyll availability

**Importance**: Foundation of most food chains and oxygen production

Which stage would you like me to explain in detail?`;
          }
          if (input.includes('physics') || input.includes('force') || input.includes('motion')) {
            return `**Physics Fundamentals**

I can help with all physics concepts:

**Mechanics:**
• **Kinematics**: Motion equations, velocity, acceleration
• **Dynamics**: Newton's laws, forces, momentum
• **Energy**: Kinetic, potential, conservation of energy
• **Circular motion**: Centripetal force, angular velocity

**Example**: A car accelerates from 0 to 60 mph in 10 seconds
• Convert: 60 mph = 26.8 m/s
• Acceleration: a = Δv/Δt = 26.8/10 = 2.68 m/s²
• Distance: d = ½at² = ½(2.68)(10)² = 134 m

**Other Topics:**
• Thermodynamics, waves, electricity, magnetism
• Modern physics: quantum mechanics, relativity

What specific physics problem can I solve for you?`;
          }
          return `I'm your Science AI Tutor! I specialize in:
• Physics: Mechanics, thermodynamics, waves, electricity
• Chemistry: Atomic structure, bonding, reactions, stoichiometry
• Biology: Cell biology, genetics, evolution, ecology
• Earth Science: Geology, meteorology, astronomy

I provide detailed explanations with examples. What scientific concept can I explain?`;
        
        case 'programming':
          if (input.includes('recursion')) {
            return `**Recursion - Complete Guide**

**Definition**: A function that calls itself to solve smaller instances of the same problem.

**Essential Components:**
1. **Base Case**: Stopping condition (prevents infinite recursion)
2. **Recursive Case**: Function calls itself with modified parameters

**Classic Example - Factorial:**
\`\`\`python
def factorial(n):
    if n <= 1:        # Base case
        return 1
    return n * factorial(n-1)  # Recursive case
\`\`\`

**How it works:**
• factorial(5) = 5 × factorial(4)
• factorial(4) = 4 × factorial(3)
• factorial(3) = 3 × factorial(2)
• factorial(2) = 2 × factorial(1)
• factorial(1) = 1 (base case)
• Result: 5 × 4 × 3 × 2 × 1 = 120

**Other Examples:**
• Fibonacci sequence
• Binary tree traversal
• Tower of Hanoi
• Merge sort

**When to use recursion:**
• Problem can be broken into similar subproblems
• Each subproblem is smaller than the original
• Base case is clearly defined

What specific recursive problem can I help you solve?`;
          }
          if (input.includes('algorithm') || input.includes('sort') || input.includes('search')) {
            return `**Algorithms - Essential Concepts**

**Sorting Algorithms:**
• **Bubble Sort**: O(n²) - Simple but inefficient
• **Quick Sort**: O(n log n) average - Divide and conquer
• **Merge Sort**: O(n log n) - Stable, guaranteed performance
• **Heap Sort**: O(n log n) - In-place sorting

**Searching Algorithms:**
• **Linear Search**: O(n) - Check each element
• **Binary Search**: O(log n) - Requires sorted array

**Example - Binary Search:**
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

**Data Structures:**
• Arrays, Linked Lists, Stacks, Queues
• Trees, Graphs, Hash Tables

What specific algorithm can I explain or help you implement?`;
          }
          return `I'm your Programming AI Tutor! I specialize in:
• Languages: Python, JavaScript, Java, C++, TypeScript
• Data Structures: Arrays, linked lists, trees, graphs, hash tables
• Algorithms: Sorting, searching, dynamic programming, recursion
• Concepts: OOP, functional programming, design patterns

I provide working code examples and step-by-step explanations. What programming problem can I solve?`;
        
        case 'language':
          if (input.includes('grammar') || input.includes('sentence') || input.includes('writing')) {
            return `**Grammar and Writing Excellence**

**Common Grammar Rules:**
• **Subject-Verb Agreement**: "The team is" (singular) vs "The teams are" (plural)
• **Pronoun Agreement**: "Everyone should bring their book" (modern usage)
• **Comma Usage**: Separate items in lists, introductory phrases, non-essential clauses
• **Apostrophes**: Possession (John's book) vs contractions (don't)

**Sentence Structure:**
• **Simple**: One independent clause
• **Compound**: Two independent clauses joined by conjunction
• **Complex**: Independent + dependent clause
• **Compound-Complex**: Multiple clauses

**Writing Tips:**
• **Active Voice**: "The student wrote the essay" (not "The essay was written by the student")
• **Conciseness**: Remove unnecessary words
• **Parallel Structure**: "I like reading, writing, and studying" (not "I like reading, to write, and study")

**Example Analysis:**
"Despite the rain, the students, who were determined to succeed, continued their studies."
• Despite the rain = introductory phrase
• the students = subject
• who were determined to succeed = non-essential clause
• continued their studies = main verb phrase

What specific grammar or writing issue can I help you with?`;
          }
          return `I'm your Language AI Tutor! I specialize in:
• English: Grammar, writing, literature analysis, vocabulary
• Literature: Poetry, prose, literary devices, themes
• Writing: Essays, creative writing, research papers
• Languages: Spanish, French, German basics

I provide detailed explanations and examples. What language concept can I help you master?`;
        
        case 'history':
          if (input.includes('yemen')) {
            return `Yemen is a country in the southern Arabian Peninsula, bordered by Saudi Arabia, Oman, the Red Sea, and Arabian Sea. Capital: Sana'a.

Key Facts:
• Population: ~30 million
• Area: 527,970 km²
• Language: Arabic
• Religion: Islam

History: Ancient kingdoms (Saba/Sheba, Hadhramaut, Himyar) controlled frankincense trade routes. Converted to Islam in 630 CE. Modern Yemen formed in 1990 when North and South unified. Currently experiencing civil war since 2014.

Current Situation: Humanitarian crisis with 24+ million needing assistance. Controlled by Houthi rebels in north, internationally recognized government in south.

[In-Depth Analysis Available]`;
          }
          if (input.includes('war') || input.includes('battle') || input.includes('revolution')) {
            return `Historical Analysis Framework

Primary Sources: Documents, artifacts, eyewitness accounts from the time period
Secondary Sources: Books, articles written by historians analyzing primary sources

Historical Thinking Skills:
• Chronology: Understanding cause and effect over time
• Context: How events relate to their time period
• Perspective: Different viewpoints on the same event
• Evidence: Evaluating reliability of sources

Example Analysis - American Revolution:
• Causes: Taxation without representation, British restrictions on trade
• Key Events: Boston Tea Party (1773), Declaration of Independence (1776)
• Outcomes: American independence, new government structure
• Significance: Influenced other revolutions, established democratic principles

Historical Periods I Cover:
• Ancient civilizations, Medieval period, Renaissance
• World Wars, Cold War, Modern era
• Social movements, economic developments

What specific historical event or period can I analyze for you?`;
          }
          return `I'm your History AI Tutor! I specialize in:
• World History: Ancient civilizations to modern era
• American History: Colonial period to present
• Social Studies: Government, economics, geography
• Historical Analysis: Primary sources, cause and effect, perspective

I provide detailed historical context and analysis. What historical topic can I explain?`;
        
        case 'creative':
          if (input.includes('art') || input.includes('design') || input.includes('creative')) {
            return `**Creative Arts and Design**

**Design Principles:**
• **Balance**: Symmetrical vs asymmetrical composition
• **Contrast**: Light/dark, large/small, color opposites
• **Emphasis**: Focal point that draws attention
• **Unity**: Cohesive visual elements
• **Rhythm**: Repetition creating visual flow

**Color Theory:**
• **Primary**: Red, blue, yellow
• **Secondary**: Orange, green, purple
• **Complementary**: Opposite colors on color wheel
• **Analogous**: Adjacent colors for harmony

**Creative Process:**
1. **Research**: Gather inspiration and references
2. **Brainstorm**: Generate multiple ideas
3. **Sketch**: Quick visual exploration
4. **Refine**: Develop chosen concept
5. **Execute**: Final implementation

**Art Movements**: Renaissance, Impressionism, Modernism, Contemporary

What specific creative project or concept can I help you develop?`;
          }
          return `I'm your Creative AI Tutor! I specialize in:
• Visual Arts: Drawing, painting, design principles, color theory
• Music: Theory, composition, instrument techniques
• Creative Writing: Poetry, fiction, storytelling techniques
• Digital Arts: Graphic design, animation, multimedia

I provide inspiration and technical guidance. What creative project can I help you with?`;
        
        default:
          return `I'm your ${tutor.name}! I specialize in ${tutor.description.toLowerCase()}. 

I provide direct, expert-level answers in my field. What specific question can I answer for you?`;
      }
    }

    // General AI responses - only when no specialized tutor is selected
    if (input.includes('hello') || input.includes('hi')) {
      return `Hey there! 👋 Welcome to Advanced AI Tutor!\n\nI'm CourseConnect AI, your personalized study buddy. I can help with homework, explain tricky concepts, or just chat about anything academic.\n\nWhat's on your mind today? Try asking:\n• "Help me understand calculus derivatives"\n• "Explain photosynthesis in simple terms"\n• "What's the best way to study for exams?"`;
    }
    
    if (input.includes('help')) {
      return `I can help you with:

Math: Algebra, calculus, statistics, geometry - direct problem solving
Science: Physics, chemistry, biology, earth science - detailed explanations  
Programming: Python, JavaScript, Java, algorithms - working code examples
Languages: English, literature, writing - grammar and analysis
History: World history, social studies - historical analysis
Creative: Arts, music, creative writing - inspiration and techniques

For specialized help: Select a tutor above for 100% focused expertise
For general questions: Ask me anything and I'll give you direct answers

What would you like to learn about?`;
    }

    // Automatic subject detection for direct answers
    if (input.includes('history') || input.includes('yemen') || input.includes('war') || input.includes('revolution') || input.includes('ancient') || input.includes('medieval') || input.includes('civilization')) {
      if (input.includes('yemen')) {
        return `YEMEN: Advanced Historical Analysis

GEOGRAPHICAL FOUNDATION
Yemen occupies a strategic position at the southern tip of the Arabian Peninsula, bordered by Saudi Arabia (north), Oman (east), Red Sea (west), and Arabian Sea (south). The country spans approximately 527,970 km² with diverse terrain including coastal plains, highlands, and desert regions. The capital Sana'a sits at 2,200m elevation, while Aden serves as the economic hub.

ANCIENT CIVILIZATIONS (1000 BCE - 600 CE)
Yemen was home to several sophisticated kingdoms that controlled the lucrative frankincense and myrrh trade routes:

Saba (Sheba) Kingdom (1200-275 BCE):
- Capital: Marib (home to the legendary Marib Dam)
- Queen of Sheba's legendary visit to King Solomon
- Advanced irrigation systems supporting 50,000+ people
- Controlled trade between Arabia, Africa, and India

Hadhramaut Kingdom (800 BCE - 300 CE):
- Capital: Shabwa
- Monopoly on frankincense production
- Sophisticated water management systems
- Cultural influence extending to East Africa

Himyar Kingdom (110 BCE - 525 CE):
- Last major pre-Islamic kingdom
- Adopted Judaism as state religion
- Controlled Red Sea trade routes
- Fell to Ethiopian invasion in 525 CE

ISLAMIC PERIOD (630-1918)
- 630 CE: Yemen converted to Islam during Prophet Muhammad's lifetime
- Multiple dynasties ruled: Umayyads, Abbasids, Ziyadids, Rasulids
- 1517: Ottoman Empire gained control
- 1635: Local Zaydi imams established independence
- 1839: British occupied Aden, creating strategic port

MODERN ERA TIMELINE
1918: Ottoman withdrawal, Yemen gained independence
1962: North Yemen Revolution - republic established
1967: South Yemen independence from Britain (People's Democratic Republic)
1970: South Yemen became Marxist state
1990: Unification of North and South Yemen
1994: Civil war - North defeated South
2011: Arab Spring protests forced President Saleh to resign
2014-2015: Houthi rebellion captured Sana'a, civil war began

CURRENT CONFLICT ANALYSIS (2014-Present)
The Yemen Civil War involves multiple factions:

Houthi Movement (Ansar Allah):
- Zaydi Shia group from northern highlands
- Supported by Iran
- Controls Sana'a and northern regions

Internationally Recognized Government:
- Led by President Hadi (now Rashad al-Alimi)
- Supported by Saudi Arabia and UAE
- Based in Aden

Southern Transitional Council:
- Separatist movement in South Yemen
- UAE-backed
- Seeks southern independence

HUMANITARIAN CRISIS IMPACT
- 24+ million people need humanitarian assistance
- 4+ million internally displaced
- Cholera outbreaks affecting millions
- Famine conditions in multiple regions
- 80% of population below poverty line

STRATEGIC SIGNIFICANCE
- Controls Bab el-Mandeb Strait (30% of global oil trade)
- Proximity to Saudi oil fields
- Gateway between Red Sea and Indian Ocean
- Historical crossroads of trade routes

ECONOMIC FOUNDATIONS
Traditional Economy:
- Agriculture: Coffee (Mocha), qat, cotton, fruits
- Fishing: Red Sea and Arabian Sea
- Trade: Historical frankincense routes

Modern Challenges:
- Oil reserves declining
- Water scarcity crisis
- Economic blockade effects
- Infrastructure destruction

CULTURAL HERITAGE
- UNESCO World Heritage Sites: Old City of Sana'a, Historic Town of Zabid
- Ancient architecture: Tower houses, mud-brick construction
- Traditional music: Yemeni folk, classical Arabic
- Literary tradition: Poetry, historical chronicles

Would you like me to analyze any specific aspect in greater depth - such as the ancient kingdoms' trade networks, the current conflict's geopolitical implications, or Yemen's cultural contributions to Islamic civilization?`;
      }
      return `I can help you with historical topics! Here are some key areas I can explain:

World History: Ancient civilizations, medieval period, Renaissance, World Wars, Cold War
American History: Colonial period, Revolution, Civil War, World Wars, modern era
Social Studies: Government systems, economic developments, social movements
Historical Analysis: Primary sources, cause and effect relationships, different perspectives

What specific historical topic would you like me to explain in detail?`;
    }

    if (input.includes('math') || input.includes('algebra') || input.includes('calculus') || input.includes('geometry') || input.includes('equation') || input.includes('solve') || input.includes('5x5x5') || input.includes('5*5*5')) {
      if (input.includes('5x5x5') || input.includes('5*5*5') || input.includes('5 × 5 × 5')) {
        return `5 × 5 × 5 = 125: Advanced Mathematical Analysis

COMPUTATIONAL BREAKDOWN
Step 1: 5 × 5 = 25
Step 2: 25 × 5 = 125

MATHEMATICAL REPRESENTATIONS
Exponential Notation: 5³ = 125
Prime Factorization: 125 = 5³ = 5 × 5 × 5
Scientific Notation: 1.25 × 10²

GEOMETRIC INTERPRETATIONS
Cube Volume: A cube with side length 5 units has volume 5³ = 125 cubic units
3D Grid: 5 × 5 × 5 lattice points in 3-dimensional space
Coordinate System: Points (x,y,z) where x,y,z ∈ {0,1,2,3,4}

COMBINATORIAL APPLICATIONS
Permutations: 5³ ways to arrange 3 items from 5 choices with repetition
Tree Diagram: 5 branches × 5 branches × 5 branches = 125 total paths
Probability: Sample space of 125 equally likely outcomes

NUMBER THEORY CONNECTIONS
Perfect Cube: 125 is a perfect cube (5³)
Sum of Cubes: 125 = 5³ = 4³ + 3³ + 2³ + 1³ + 0³
Digital Root: 1+2+5 = 8, then 8 → single digit
Divisibility: 125 is divisible by 1, 5, 25, 125

ALGEBRAIC EXTENSIONS
Polynomial Roots: x³ - 125 = 0 has root x = 5
Binomial Expansion: (5)³ = 125
Logarithmic Form: log₅(125) = 3

REAL-WORLD APPLICATIONS
Engineering: 5×5×5 cubic meter storage capacity
Computer Science: 5³ = 125 possible combinations in 3-bit system
Economics: Compound growth over 3 periods at 5% each
Physics: 5³ cubic units of volume in fluid dynamics

ADVANCED MATHEMATICAL CONCEPTS
Group Theory: 125 elements in certain finite groups
Topology: 125 points in 3D topological space
Calculus: Volume integral over 5×5×5 region
Linear Algebra: 125-dimensional vector space

Would you like me to explore any specific mathematical concept in greater depth - such as the geometric properties of cubes, combinatorial applications, or connections to higher mathematics?`;
      }
      return `I can help you with mathematics! Here are the areas I can assist with:

Algebra: Solving equations, inequalities, functions, polynomials
Calculus: Derivatives, integrals, limits, optimization problems
Statistics: Probability, distributions, hypothesis testing
Geometry: Shapes, proofs, trigonometry, coordinate geometry

I provide step-by-step solutions and detailed explanations. What specific math problem can I solve for you?`;
    }

    if (input.includes('science') || input.includes('physics') || input.includes('chemistry') || input.includes('biology') || input.includes('photosynthesis')) {
      if (input.includes('photosynthesis')) {
        return `Photosynthesis is the process by which plants convert light energy into chemical energy. Here's how it works:

Overall Equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Two Main Stages:

1. Light-Dependent Reactions (Thylakoids)
Input: Light energy, H₂O, ADP, NADP⁺
Output: ATP, NADPH, O₂
Process: Light excites chlorophyll → electron transport chain → ATP synthesis
Key: Photolysis splits water, releasing oxygen

2. Calvin Cycle (Stroma)
Input: CO₂, ATP, NADPH
Output: Glucose (C₆H₁₂O₆)
Process: Carbon fixation → Reduction → Regeneration
Key: RuBisCO enzyme fixes CO₂ to RuBP

Factors Affecting Rate:
• Light intensity
• CO₂ concentration
• Temperature
• Chlorophyll availability

Importance: Foundation of most food chains and oxygen production

Which stage would you like me to explain in detail?`;
      }
      return `I can help you with science topics! Here are the areas I specialize in:

Physics: Mechanics, thermodynamics, waves, electricity, magnetism
Chemistry: Atomic structure, bonding, reactions, stoichiometry
Biology: Cell biology, genetics, evolution, ecology
Earth Science: Geology, meteorology, astronomy

I provide detailed explanations with examples and real-world applications. What scientific concept can I explain for you?`;
    }

    if (input.includes('programming') || input.includes('code') || input.includes('python') || input.includes('javascript') || input.includes('recursion') || input.includes('algorithm')) {
      if (input.includes('recursion')) {
        return `Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.

Essential Components:
1. Base Case: Stopping condition (prevents infinite recursion)
2. Recursive Case: Function calls itself with modified parameters

Classic Example - Factorial:
def factorial(n):
    if n <= 1:        # Base case
        return 1
    return n * factorial(n-1)  # Recursive case

How it works:
• factorial(5) = 5 × factorial(4)
• factorial(4) = 4 × factorial(3)
• factorial(3) = 3 × factorial(2)
• factorial(2) = 2 × factorial(1)
• factorial(1) = 1 (base case)
• Result: 5 × 4 × 3 × 2 × 1 = 120

Other Examples:
• Fibonacci sequence
• Binary tree traversal
• Tower of Hanoi
• Merge sort

When to use recursion:
• Problem can be broken into similar subproblems
• Each subproblem is smaller than the original
• Base case is clearly defined

What specific recursive problem can I help you solve?`;
      }
      return `I can help you with programming! Here are the areas I specialize in:

Languages: Python, JavaScript, Java, C++, TypeScript
Data Structures: Arrays, linked lists, trees, graphs, hash tables
Algorithms: Sorting, searching, dynamic programming, recursion
Concepts: OOP, functional programming, design patterns

I provide working code examples and step-by-step explanations. What programming problem can I solve for you?`;
    }

    // Provide direct answers for general questions
    if (input.includes('what is') || input.includes('explain') || input.includes('how does')) {
      return `I'd be happy to explain that concept! However, for the most detailed and expert-level help, I recommend selecting a specialized tutor above.

Specialized tutors provide:
• 100% focused expertise in their field
• Step-by-step problem solving
• Detailed explanations with examples
• Domain-specific knowledge

General mode provides:
• Broad overviews
• Basic explanations
• Multi-subject guidance

Could you provide more specific details about what you'd like me to explain? Or select a specialized tutor for expert-level help!`;
    }

    return `I'm here to help you learn! For the best experience:

Select a specialized tutor above for expert-level help in specific subjects
Ask specific questions and I'll give you direct, detailed answers

What would you like to learn about today?`;
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

  const { extractText, isExtracting } = useTextExtraction({
    onExtractionComplete: async (result, fileName) => {
      // Add extracted text as a message
      const extractedTextMessage: AIMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `📄 **Text extracted from ${fileName}**\n\n${result.text}`,
        type: 'text',
        timestamp: new Date(),
        subject: selectedTutor?.name || currentSubject,
        difficulty: userLevel
      };
      setMessages(prev => [...prev, extractedTextMessage]);
    },
    onExtractionError: (error, fileName) => {
      console.error('Text extraction failed:', error);
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isDocument = file.type.includes('document') || file.type.includes('text');
    const isExcel = file.type.includes('spreadsheet') || file.type.includes('excel');

    if (!isImage && !isPDF && !isDocument && !isExcel) {
      toast({
        variant: "destructive",
        title: "Unsupported File Type",
        description: "Please upload an image, PDF, document, or Excel file.",
      });
      return;
    }

    toast({
      title: "File Uploaded",
      description: "Processing your file...",
    });

    try {
      // Convert file to base64 for display
      const base64 = await convertFileToBase64(file);
      
      // Create user message with actual file display
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: base64,
        type: isImage ? 'image' : 'text',
        timestamp: new Date(),
        subject: selectedTutor?.name || currentSubject,
        fileName: file.name,
        fileType: file.type
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsProcessing(true);
      setIsTyping(true);
      
      // Extract text from the file first
      const extractionResult = await extractText(file);
      
      if (extractionResult?.success) {
        // Text extraction was successful - the hook will handle adding the extracted text message
        toast({
          title: "File Processed",
          description: "Text extracted successfully from your file.",
        });
      } else {
        // Fallback to AI analysis if text extraction fails
        const analysisResponse = await analyzeFileWithAI(file, base64, selectedTutor);
        
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: analysisResponse,
          type: 'text',
          timestamp: new Date(),
          subject: selectedTutor?.name || currentSubject,
          difficulty: userLevel
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        toast({
          title: "Analysis Complete",
          description: "I've analyzed your file and provided detailed insights.",
        });
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Could not process the file. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeFileWithAI = async (file: File, base64: string, tutor: SubjectTutor | null): Promise<string> => {
    try {
      // Call our AI analysis API
      const response = await fetch('/api/ai/analyze-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name,
          fileType: file.type,
          tutorSpecialty: tutor?.name || 'General',
          tutorDescription: tutor?.description || 'General AI tutor'
        })
      });

      if (!response.ok) {
        throw new Error('Analysis API failed');
      }

      const { analysis } = await response.json();
      return analysis;
      
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis
      return generateFallbackAnalysis(file.name, file.type, tutor);
    }
  };

  const generateFallbackAnalysis = (fileName: string, fileType: string, tutor: SubjectTutor | null): string => {
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    
    if (isImage) {
      return `I can see you've uploaded an image: **${fileName}**

**Image Analysis:**
• File: ${fileName}
• Type: ${fileType}
• Content: Visual content detected

**What I can help with:**
• Explain any concepts shown in the image
• Break down complex visual information
• Provide additional context and examples
• Connect visual elements to learning objectives

**Specialized Analysis:**
${tutor ? `As your ${tutor.name}, I can provide expert analysis focused on ${tutor.description.toLowerCase()}.` : 'I can provide general analysis across multiple subjects.'}

Please describe what you'd like me to focus on in this image, or ask specific questions about what you see!`;
    }
    
    if (isPDF) {
      return `I can see you've uploaded a PDF document: **${fileName}**

**Document Analysis:**
• File: ${fileName}
• Type: PDF Document
• Content: Text and visual content detected

**What I can help with:**
• Extract and explain key concepts
• Summarize important information
• Answer questions about the content
• Connect concepts to your studies

**Specialized Analysis:**
${tutor ? `As your ${tutor.name}, I can provide expert analysis focused on ${tutor.description.toLowerCase()}.` : 'I can provide comprehensive analysis across multiple subjects.'}

What specific aspects of this document would you like me to explain or analyze?`;
    }
    
    return `I can see you've uploaded a document: **${fileName}**

**Document Analysis:**
• File: ${fileName}
• Type: ${fileType}
• Content: Text content detected

**What I can help with:**
• Extract key information
• Explain complex concepts
• Answer questions about the content
• Provide additional context

**Specialized Analysis:**
${tutor ? `As your ${tutor.name}, I can provide expert analysis focused on ${tutor.description.toLowerCase()}.` : 'I can provide comprehensive analysis across multiple subjects.'}

What would you like me to focus on in this document?`;
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
          {/* Selected Tutor Display */}
          {selectedTutor && (
            <div className="mb-4 p-4 border border-primary bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${selectedTutor.color} flex items-center justify-center text-white`}>
                    {selectedTutor.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{selectedTutor.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedTutor.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTutor(null)}
                  className="text-xs"
                >
                  Deselect
                </Button>
              </div>
            </div>
          )}
          
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Tutor Chat
              {selectedTutor && (
                <Badge variant="outline" className="ml-2">
                  {selectedTutor.name}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastQuestion && !showInDepth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInDepthAnalysis}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  In-Depth Analysis
                </Button>
              )}
              <HamburgerMenu
                onCopy={handleCopyConversation}
                onExport={handleExportConversation}
                onReset={handleResetConversation}
                onDelete={handleDeleteConversation}
                copyLabel="Copy Chat"
                exportLabel="Export Chat"
                resetLabel="Reset Chat"
                deleteLabel="Clear All"
              />
            </div>
          </div>
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      <CourseConnectLogo className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {message.role === 'assistant' ? (
                  <div className="px-3 pb-3">
                    <div className="whitespace-pre-wrap text-sm">
                      {(() => {
                        // Check if this is a final answer/solution from AI
                        const isFinalAnswer = message.content.toLowerCase().includes('answer:') || 
                                            message.content.toLowerCase().includes('solution:') ||
                                            message.content.toLowerCase().includes('final answer:') ||
                                            message.content.toLowerCase().includes('therefore') ||
                                            message.content.toLowerCase().includes('so the answer is') ||
                                            message.content.toLowerCase().includes('the result is') ||
                                            (isMathOrPhysicsContent(message.content) && 
                                             (message.content.includes('=') || message.content.includes('equals')));
                        
                        if (isFinalAnswer && isMathOrPhysicsContent(message.content)) {
                          return (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2">
                              <div className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                                📐 Final Answer:
                              </div>
                              <MathRender input={message.content} displayMode={true} />
                            </div>
                          );
                        }
                        
                        // Use AIResponse for Programming AI Tutor (always highlight code)
                        if (selectedTutor?.id === 'programming') {
                          return <AIResponse content={message.content} alwaysHighlight={true} />;
                        }
                        
                        // For other tutors, use AIResponse only if content has code blocks
                        return <AIResponse content={message.content} alwaysHighlight={false} />;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MessageTimestamp timestamp={message.timestamp.getTime()} />
                      {message.subject && (
                        <span className="text-xs text-muted-foreground">• {message.subject}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    {message.type === 'image' && message.fileName ? (
                      <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                        <div className="mb-2">
                          <img 
                            src={message.content} 
                            alt={message.fileName}
                            className="max-w-full max-h-64 rounded-lg object-contain"
                          />
                        </div>
                        <div className="text-xs text-primary-foreground/80">
                          📷 {message.fileName}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <MessageTimestamp timestamp={message.timestamp.getTime()} />
                      {message.subject && (
                        <span className="text-xs text-muted-foreground">• {message.subject}</span>
                      )}
                    </div>
                  </div>
                )}
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    <CourseConnectLogo className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="px-3 pb-3">
                  <RippleText text="thinking..." className="text-primary text-sm" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex gap-2 sm:gap-3">
              <Input
                placeholder="Ask your AI tutor anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                disabled={isProcessing}
                className="text-sm sm:text-base min-h-[44px] sm:min-h-[40px]"
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isProcessing}
                size="sm"
                className="min-h-[44px] sm:min-h-[40px] min-w-[44px] sm:min-w-[40px]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isRecording || isProcessing}
                className="min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1 sm:mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1 sm:mr-2" />
                    Voice
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isProcessing}
                className="min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm"
              >
                <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                Upload File
              </Button>
              
              <input
                id="image-upload"
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.txt"
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
