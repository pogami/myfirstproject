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
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
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
  const { toast } = useToast();

  // Sample data for demonstration
  useEffect(() => {
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
  }, []);

  const startNewSession = async () => {
    try {
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

      // Save session to Firebase
      const sessionsRef = collection(db, 'whiteboardSessions');
      const docRef = await addDoc(sessionsRef, {
        ...session,
        userId: 'current-user' // This would be the actual user ID
      });

      const sessionWithId = { ...session, id: docRef.id };

      setSessions([sessionWithId, ...sessions]);
      setCurrentSession(sessionWithId);
      setParticipants(sessionWithId.participants);
      setNewSession({ name: '', isPublic: true, password: '' });

      // Set up real-time listeners
      setupRealtimeListeners(sessionWithId.id);

      toast({
        title: "Session Created!",
        description: "Your new whiteboard session is ready.",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
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

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    
    toast({
      title: isVoiceEnabled ? "Voice Disabled" : "Voice Enabled",
      description: isVoiceEnabled ? "Your microphone is now off" : "Your microphone is now on",
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    toast({
      title: isVideoEnabled ? "Video Disabled" : "Video Enabled",
      description: isVideoEnabled ? "Your camera is now off" : "Your camera is now on",
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
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
                        >
                          {isRecording ? <StopIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {isRecording ? 'Stop' : 'Record'}
                        </Button>
                        <Button
                          variant={isVoiceEnabled ? 'default' : 'outline'}
                          size="sm"
                          onClick={toggleVoice}
                        >
                          {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant={isVideoEnabled ? 'default' : 'outline'}
                          size="sm"
                          onClick={toggleVideo}
                        >
                          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
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
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={() => setIsDrawing(true)}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseMove={(e) => {
                          if (isDrawing) {
                            // Handle drawing logic here
                          }
                        }}
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
                      
                      {/* Placeholder content */}
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Pen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start drawing on the whiteboard</p>
                          <p className="text-sm">Use the tools above to create your content</p>
                        </div>
                      </div>
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

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Drawing Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Drawing Tool</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['pen', 'eraser', 'rectangle', 'circle', 'text'].map((tool) => (
                      <Button
                        key={tool}
                        variant={currentTool.type === tool ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentTool({ ...currentTool, type: tool as any })}
                        className="flex flex-col items-center gap-1 h-16"
                      >
                        {getToolIcon(tool)}
                        <span className="text-xs capitalize">{tool}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${
                          currentTool.color === color ? 'border-primary' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentTool({ ...currentTool, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Brush Size: {currentTool.size}px</Label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={currentTool.size}
                  onChange={(e) => setCurrentTool({ ...currentTool, size: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
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
                    <Label>Voice Chat</Label>
                    <p className="text-sm text-muted-foreground">Enable microphone for voice communication</p>
                  </div>
                  <Button
                    variant={isVoiceEnabled ? 'default' : 'outline'}
                    onClick={toggleVoice}
                  >
                    {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Video Chat</Label>
                    <p className="text-sm text-muted-foreground">Enable camera for video communication</p>
                  </div>
                  <Button
                    variant={isVideoEnabled ? 'default' : 'outline'}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>
                
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
