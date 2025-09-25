"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Palette, 
  Users, 
  Share, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Square as StopIcon,
  Settings,
  MessageSquare,
  Camera,
  Save,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Eye,
  Lock,
  Unlock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { rtdb } from '@/lib/firebase/client';
import { ref, set, onValue, off } from 'firebase/database';

interface DrawingTool {
  type: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';
  color: string;
  size: number;
}

interface WhiteboardSession {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: string;
  lastModified: string;
  isRecording: boolean;
  isPublic: boolean;
  password?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  cursorPosition?: { x: number; y: number };
  color: string;
}

interface WhiteboardElement {
  id: string;
  type: 'drawing' | 'text' | 'shape';
  data: any;
  timestamp: number;
  author: string;
}

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  type: 'text' | 'system';
}

export function CollaborativeWhiteboard() {
  const [currentSession, setCurrentSession] = useState<WhiteboardSession | null>(null);
  const [sessions, setSessions] = useState<WhiteboardSession[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#000000',
    size: 2
  });
  const [newMessage, setNewMessage] = useState('');
  const [newSession, setNewSession] = useState({
    name: '',
    isPublic: true,
    password: ''
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const { toast } = useToast();

  // Drawing functions
  const getCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUndoStack(prev => [...prev, canvas.toDataURL()]);
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    setRedoStack(prev => [...prev, currentState]);
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    setUndoStack(prev => [...prev, currentState]);
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nextState;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    saveCanvasState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const ctx = getCanvas();
    if (!ctx) return;
    
    const currentPoint = getMousePos(e);
    
    if (currentTool.type === 'pen') {
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = currentTool.color;
        ctx.lineWidth = currentTool.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      setLastPoint(currentPoint);
    } else if (currentTool.type === 'eraser') {
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = currentTool.size * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      setLastPoint(currentPoint);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool.type === 'text') {
      const pos = getMousePos(e);
      setTextPosition(pos);
      setIsTextMode(true);
      return;
    }
    
    setIsDrawing(true);
    setLastPoint(getMousePos(e));
    saveCanvasState();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && e && (currentTool.type === 'rectangle' || currentTool.type === 'circle')) {
      drawShape(e);
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  const addText = () => {
    if (!textInput.trim() || !textPosition) return;
    
    const ctx = getCanvas();
    if (!ctx) return;
    
    saveCanvasState();
    
    ctx.font = `${currentTool.size * 4}px Arial`;
    ctx.fillStyle = currentTool.color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setIsTextMode(false);
    setTextPosition(null);
  };

  const drawShape = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool.type !== 'rectangle' && currentTool.type !== 'circle') return;
    
    const ctx = getCanvas();
    if (!ctx) return;
    
    const startPoint = lastPoint;
    const endPoint = getMousePos(e);
    
    if (!startPoint) return;
    
    saveCanvasState();
    
    ctx.beginPath();
    ctx.strokeStyle = currentTool.color;
    ctx.lineWidth = currentTool.size;
    
    if (currentTool.type === 'rectangle') {
      ctx.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    } else if (currentTool.type === 'circle') {
      const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
    }
    
    ctx.stroke();
  };

  const saveWhiteboard = async () => {
    if (!currentSession) return;

    try {
      // Save whiteboard state to Firebase
      const whiteboardRef = doc(db, 'whiteboardSessions', currentSession.id);
      await updateDoc(whiteboardRef, {
        whiteboardElements,
        lastModified: new Date().toISOString()
      });

      toast({
        title: "Whiteboard Saved!",
        description: "Your whiteboard has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      toast({
        title: "Error",
        description: "Failed to save whiteboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            saveWhiteboard();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveWhiteboard]);

  // Load sessions from Firebase or localStorage
  const loadSessions = async () => {
    try {
      // Try to load from Firebase first
      const sessionsRef = collection(db, 'whiteboardSessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const firebaseSessions: WhiteboardSession[] = [];
      querySnapshot.forEach((doc) => {
        firebaseSessions.push({ id: doc.id, ...doc.data() } as WhiteboardSession);
      });
      
      console.log('Loaded sessions from Firebase:', firebaseSessions.length);
      setSessions(firebaseSessions);
      
    } catch (firebaseError) {
      console.warn('Failed to load from Firebase, trying localStorage:', firebaseError);
      
      // Fallback to localStorage
      try {
        const localSessions = JSON.parse(localStorage.getItem('whiteboardSessions') || '[]');
        console.log('Loaded sessions from localStorage:', localSessions.length);
        setSessions(localSessions);
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
        // Use sample data as final fallback
        loadSampleSessions();
      }
    }
  };

  const loadSampleSessions = () => {
    const sampleSessions: WhiteboardSession[] = [
      {
        id: '1',
        name: 'Calculus Study Group',
        participants: [
          {
            id: '1',
            name: 'Alex Johnson',
            avatar: '/api/placeholder/40/40',
            isOnline: true,
            isMuted: false,
            isVideoOn: true,
            color: '#3B82F6'
          },
          {
            id: '2',
            name: 'Sarah Chen',
            avatar: '/api/placeholder/40/40',
            isOnline: true,
            isMuted: true,
            isVideoOn: false,
            color: '#EF4444'
          }
        ],
        createdAt: '2024-01-10T10:00:00Z',
        lastModified: '2024-01-10T14:30:00Z',
        isRecording: false,
        isPublic: true
      },
      {
        id: '2',
        name: 'CS Fundamentals Lab',
        participants: [
          {
            id: '3',
            name: 'Mike Wilson',
            avatar: '/api/placeholder/40/40',
            isOnline: false,
            isMuted: false,
            isVideoOn: false,
            color: '#10B981'
          }
        ],
        createdAt: '2024-01-12T09:00:00Z',
        lastModified: '2024-01-12T11:00:00Z',
        isRecording: true,
        isPublic: false,
        password: 'cs101'
      }
    ];
    setSessions(sampleSessions);

    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        author: 'Alex Johnson',
        message: 'Let\'s start with derivatives',
        timestamp: Date.now() - 300000,
        type: 'text'
      },
      {
        id: '2',
        author: 'Sarah Chen',
        message: 'I\'ll draw the graph',
        timestamp: Date.now() - 240000,
        type: 'text'
      },
      {
        id: '3',
        author: 'System',
        message: 'Sarah joined the session',
        timestamp: Date.now() - 180000,
        type: 'system'
      }
    ];
    setChatMessages(sampleMessages);
  };

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const startNewSession = async () => {
    try {
      console.log('Starting new session creation...');
      
      const session: WhiteboardSession = {
        id: `session-${Date.now()}`,
        name: newSession.name || `Whiteboard Session ${sessions.length + 1}`,
        participants: [
          {
            id: 'current-user',
            name: 'You',
            avatar: '/api/placeholder/40/40',
            isOnline: true,
            isMuted: false,
            isVideoOn: false,
            color: '#8B5CF6'
          }
        ],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isRecording: false,
        isPublic: newSession.isPublic,
        password: newSession.password || undefined
      };

      console.log('Session data prepared:', session);

      // Try to save session to Firebase, but fallback to local storage if it fails
      let sessionWithId = session;
      
      try {
        // Save session to Firebase
        const sessionsRef = collection(db, 'whiteboardSessions');
        console.log('Firebase collection reference created');
        
        const docRef = await addDoc(sessionsRef, {
          ...session,
          userId: 'current-user' // This would be the actual user ID
        });

        console.log('Session saved to Firebase with ID:', docRef.id);
        sessionWithId = { ...session, id: docRef.id };
        
        // Set up real-time listeners only if Firebase worked
        setupRealtimeListeners(sessionWithId.id);
        
      } catch (firebaseError) {
        console.warn('Firebase save failed, using local session:', firebaseError);
        // Use local session without Firebase
        sessionWithId = { ...session, id: session.id };
        
        // Store in localStorage as fallback
        const localSessions = JSON.parse(localStorage.getItem('whiteboardSessions') || '[]');
        localSessions.push(sessionWithId);
        localStorage.setItem('whiteboardSessions', JSON.stringify(localSessions));
      }

      setSessions([sessionWithId, ...sessions]);
      setCurrentSession(sessionWithId);
      setParticipants(sessionWithId.participants);
      setNewSession({ name: '', isPublic: true, password: '' });

      toast({
        title: "Session Created!",
        description: "Your new whiteboard session is ready.",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast({
        title: "Error",
        description: `Failed to create session: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const joinSession = (session: WhiteboardSession) => {
    setCurrentSession(session);
    setParticipants(session.participants);
    
    // Set up real-time listeners
    setupRealtimeListeners(session.id);
    
    toast({
      title: "Joined Session!",
      description: `You've joined ${session.name}`,
    });
  };

  const setupRealtimeListeners = (sessionId: string) => {
    // Listen for whiteboard elements
    const elementsRef = collection(db, 'whiteboardSessions', sessionId, 'elements');
    const unsubscribeElements = onSnapshot(elementsRef, (snapshot) => {
      const elements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhiteboardElement[];
      setWhiteboardElements(elements);
    });

    // Listen for chat messages
    const messagesRef = collection(db, 'whiteboardSessions', sessionId, 'messages');
    const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setChatMessages(messages);
    });

    // Listen for participant updates
    const participantsRef = ref(rtdb, `whiteboardSessions/${sessionId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      const participantsData = snapshot.val();
      if (participantsData) {
        const participantsList = Object.values(participantsData) as Participant[];
        setParticipants(participantsList);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeElements();
      unsubscribeMessages();
      off(participantsRef);
    };
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Session recording has been stopped" : "Session is now being recorded",
    });
  };


  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    try {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        author: 'You',
        message: newMessage,
        timestamp: Date.now(),
        type: 'text'
      };

      // Save message to Firebase
      const messagesRef = collection(db, 'whiteboardSessions', currentSession.id, 'messages');
      await addDoc(messagesRef, {
        ...message,
        userId: 'current-user' // This would be the actual user ID
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportWhiteboard = () => {
    if (!currentSession) return;

    // Simulate export
    toast({
      title: "Export Started!",
      description: "Your whiteboard is being exported as an image.",
    });
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'pen': return <Pen className="h-4 w-4" />;
      case 'eraser': return <Eraser className="h-4 w-4" />;
      case 'rectangle': return <Square className="h-4 w-4" />;
      case 'circle': return <Circle className="h-4 w-4" />;
      case 'text': return <Type className="h-4 w-4" />;
      default: return <Pen className="h-4 w-4" />;
    }
  };

  const getParticipantStatusColor = (participant: Participant) => {
    if (!participant.isOnline) return 'bg-gray-400';
    if (participant.isMuted) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pen className="h-6 w-6 text-primary" />
            Collaborative Whiteboard
          </h2>
          <p className="text-muted-foreground">
            Real-time collaborative whiteboard with voice chat and screen sharing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveWhiteboard} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={exportWhiteboard} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="whiteboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Whiteboard Tab */}
        <TabsContent value="whiteboard" className="space-y-4">
          {currentSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
              {/* Main Whiteboard Area */}
              <div className="lg:col-span-3 space-y-4">
                {/* Toolbar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {['pen', 'eraser', 'rectangle', 'circle', 'text'].map((tool) => (
                            <Button
                              key={tool}
                              variant={currentTool.type === tool ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentTool({ ...currentTool, type: tool as any })}
                            >
                              {getToolIcon(tool)}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Undo/Redo buttons */}
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={undo}
                            disabled={undoStack.length === 0}
                          >
                            ↶
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={redo}
                            disabled={redoStack.length === 0}
                          >
                            ↷
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCanvas}
                          >
                            Clear
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Label className="text-sm">Color:</Label>
                          <input
                            type="color"
                            value={currentTool.color}
                            onChange={(e) => setCurrentTool({ ...currentTool, color: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Size:</Label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentTool.size}
                            onChange={(e) => setCurrentTool({ ...currentTool, size: parseInt(e.target.value) })}
                            className="w-20"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isRecording ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={toggleRecording}
                          className="flex items-center gap-2"
                        >
                          {isRecording ? <StopIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Whiteboard Canvas */}
                <Card className="flex-1">
                  <CardContent className="p-0">
                    <div className="relative h-[500px] bg-white border rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseUp={(e) => stopDrawing(e)}
                        onMouseMove={draw}
                        onMouseLeave={() => stopDrawing()}
                      />
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%">
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>
                      
                      {/* Text input modal */}
                      {isTextMode && textPosition && (
                        <div 
                          className="absolute bg-white border rounded shadow-lg p-2"
                          style={{ left: textPosition.x, top: textPosition.y }}
                        >
                          <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addText()}
                            onBlur={addText}
                            autoFocus
                            className="border-none outline-none text-sm"
                            placeholder="Enter text..."
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Participants */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Participants ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                            <div className="relative">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {participant.name[0]}
                                </span>
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getParticipantStatusColor(participant)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{participant.name}</p>
                              <div className="flex items-center gap-1">
                                {participant.isMuted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                                {participant.isVideoOn && <Video className="h-3 w-3 text-muted-foreground" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Chat */}
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={`text-sm ${message.type === 'system' ? 'text-muted-foreground italic' : ''}`}>
                            {message.type === 'text' && (
                              <span className="font-medium text-primary">{message.author}: </span>
                            )}
                            {message.message}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Session</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Join an existing session or create a new one to start collaborating
                </p>
                <Button onClick={() => startNewSession()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create New Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    value={newSession.name}
                    onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                    placeholder="Enter session name"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newSession.isPublic}
                    onChange={(e) => setNewSession({ ...newSession, isPublic: e.target.checked })}
                  />
                  <Label htmlFor="isPublic">Public Session</Label>
                </div>
                
                {!newSession.isPublic && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newSession.password}
                      onChange={(e) => setNewSession({ ...newSession, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                )}
                
                <Button onClick={startNewSession} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </CardContent>
            </Card>

            {/* Existing Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Available Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{session.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.participants.length} participants • {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={session.isPublic ? 'default' : 'secondary'}>
                            {session.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          {session.isRecording && (
                            <Badge variant="destructive">
                              <Play className="h-3 w-3 mr-1" />
                              Recording
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => joinSession(session)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Session Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Recording</Label>
                    <p className="text-sm text-muted-foreground">Record the whiteboard session for later review</p>
                  </div>
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <StopIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
