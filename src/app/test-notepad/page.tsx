"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Circle, Plus, X, ChevronUp, ChevronDown, BookOpen, User, Calendar, MessageSquare, Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/hooks/use-chat-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface StickyNote {
  id: string;
  text: string;
  subject: string;
  author: string;
  createdAt: Date;
  votes: number;
  userVote: 'up' | 'down' | null;
  color: string;
  position: { x: number; y: number };
}

const noteColors = [
  'bg-yellow-200',
  'bg-pink-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-purple-200',
  'bg-orange-200'
];

export default function TestNotepadPage() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Notes from Chat feature
  const { chats } = useChatStore();
  const { toast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [notesMetadata, setNotesMetadata] = useState<any>(null);
  const [showGeneratedNotes, setShowGeneratedNotes] = useState(false);
  const [createStudyGuide, setCreateStudyGuide] = useState(false);
  
  // Get course chats only
  const courseChats = Object.values(chats).filter(
    chat => chat.chatType === 'class' || chat.courseData
  );

  const createNote = () => {
    if (!newNoteText.trim() || !newNoteSubject.trim()) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    const randomX = boardRect ? Math.random() * (boardRect.width - 250) : 100;
    const randomY = boardRect ? Math.random() * (boardRect.height - 200) : 100;

    const newNote: StickyNote = {
      id: Date.now().toString(),
      text: newNoteText,
      subject: newNoteSubject,
      author: newNoteAuthor || 'Anonymous',
      createdAt: new Date(),
      votes: 0,
      userVote: null,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      position: { x: randomX, y: randomY }
    };

    setNotes([...notes, newNote]);
    setNewNoteText('');
    setNewNoteSubject('');
    setNewNoteAuthor('');
    setIsCreating(false);
  };

  const handleVote = (noteId: string, voteType: 'up' | 'down') => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        let newVotes = note.votes;
        let newUserVote: 'up' | 'down' | null = voteType;

        if (note.userVote === voteType) {
          // Undo vote
          newVotes += voteType === 'up' ? -1 : 1;
          newUserVote = null;
        } else if (note.userVote) {
          // Change vote
          newVotes += voteType === 'up' ? 2 : -2;
        } else {
          // New vote
          newVotes += voteType === 'up' ? 1 : -1;
        }

        return { ...note, votes: newVotes, userVote: newUserVote };
      }
      return note;
    }));
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const generateNotesFromChat = async () => {
    if (!selectedChatId) {
      toast({
        variant: "destructive",
        title: "No Chat Selected",
        description: "Please select a course chat to generate notes from.",
      });
      return;
    }

    const selectedChat = chats[selectedChatId];
    if (!selectedChat || !selectedChat.messages || selectedChat.messages.length === 0) {
      toast({
        variant: "destructive",
        title: "No Messages Found",
        description: "This chat doesn't have any messages yet. Start a conversation first!",
      });
      return;
    }

    setIsGeneratingNotes(true);
    setShowGeneratedNotes(false);

    try {
      const response = await fetch('/api/notes/generate-from-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatMessages: selectedChat.messages,
          courseData: selectedChat.courseData,
          options: {
            createStudyGuide: createStudyGuide
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const data = await response.json();
      setGeneratedNotes(data.notes);
      setNotesMetadata(data.metadata);
      setShowGeneratedNotes(true);

      toast({
        title: "Notes Generated!",
        description: `Successfully generated notes from ${selectedChat.title}`,
      });
    } catch (error: any) {
      console.error('Error generating notes:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate notes. Please try again.",
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const addGeneratedNoteToBoard = () => {
    if (!generatedNotes || !selectedChatId) return;

    const selectedChat = chats[selectedChatId];
    const courseName = selectedChat?.courseData?.courseName || selectedChat?.title || 'Generated Notes';

    const boardRect = boardRef.current?.getBoundingClientRect();
    const randomX = boardRect ? Math.random() * (boardRect.width - 250) : 100;
    const randomY = boardRect ? Math.random() * (boardRect.height - 200) : 100;

    const newNote: StickyNote = {
      id: Date.now().toString(),
      text: generatedNotes.substring(0, 500) + (generatedNotes.length > 500 ? '...' : ''),
      subject: courseName,
      author: 'AI Generated',
      createdAt: new Date(),
      votes: 0,
      userVote: null,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      position: { x: randomX, y: randomY }
    };

    setNotes([...notes, newNote]);
    toast({
      title: "Note Added!",
      description: "Generated note has been added to the bulletin board.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Class Notes Bulletin Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share study notes with your classmates. Upvote helpful notes!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        </div>

        {/* Notes from Chat Feature */}
        <Card className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Notes from Chat
            </CardTitle>
            <CardDescription>
              Automatically generate comprehensive study notes from your course chat conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chat-select" className="text-sm font-medium mb-2 block">
                  Select Course Chat
                </Label>
                <Select value={selectedChatId} onValueChange={setSelectedChatId}>
                  <SelectTrigger id="chat-select" className="w-full">
                    <SelectValue placeholder="Choose a course chat..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courseChats.length === 0 ? (
                      <SelectItem value="no-chats" disabled>
                        No course chats available
                      </SelectItem>
                    ) : (
                      courseChats.map((chat) => (
                        <SelectItem key={chat.id} value={chat.id}>
                          {chat.courseData?.courseCode || chat.title}
                          {chat.courseData?.courseName && ` - ${chat.courseData.courseName}`}
                          {chat.messages && ` (${chat.messages.length} messages)`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={generateNotesFromChat}
                  disabled={!selectedChatId || isGeneratingNotes || courseChats.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isGeneratingNotes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Generate Notes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="study-guide"
                checked={createStudyGuide}
                onChange={(e) => setCreateStudyGuide(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="study-guide" className="text-sm cursor-pointer">
                Format as study guide (with review questions)
              </Label>
            </div>

            {/* Generated Notes Display */}
            {showGeneratedNotes && generatedNotes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Generated Notes</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addGeneratedNoteToBoard}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Board
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([generatedNotes], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `notes-${selectedChatId}-${Date.now()}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {notesMetadata && (
                      <CardDescription>
                        {notesMetadata.topicsMentioned?.length > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            Topics covered: {notesMetadata.topicsMentioned.join(', ')}
                          </span>
                        )}
                        {notesMetadata.topicsNotDiscussed?.length > 0 && (
                          <span className="text-orange-600 dark:text-orange-400 ml-2">
                            • Missing: {notesMetadata.topicsNotDiscussed.slice(0, 3).join(', ')}
                            {notesMetadata.topicsNotDiscussed.length > 3 && '...'}
                          </span>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{generatedNotes}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Create Note Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsCreating(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Create New Note
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject / Course
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g., MATH 101, Biology, Chemistry"
                      value={newNoteSubject}
                      onChange={(e) => setNewNoteSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author" className="text-sm font-medium">
                      Your Name (optional)
                    </Label>
                    <Input
                      id="author"
                      placeholder="Anonymous"
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note" className="text-sm font-medium">
                      Note Content
                    </Label>
                    <textarea
                      id="note"
                      placeholder="Type your note here..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="mt-1 w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={createNote}
                      disabled={!newNoteText.trim() || !newNoteSubject.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Post Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulletin Board */}
        <div
          ref={boardRef}
          className="relative min-h-[600px] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-4 border-amber-300 dark:border-gray-600 p-8 shadow-inner"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)'
          }}
        >
          {notes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No notes yet. Click "Create Note" to get started!</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ scale: 0, rotate: -5 }}
                  animate={{ scale: 1, rotate: Math.random() * 4 - 2 }}
                  exit={{ scale: 0, rotate: 5 }}
                  className={`absolute ${note.color} dark:bg-opacity-80 p-4 rounded shadow-lg cursor-move`}
                  style={{
                    left: `${note.position.x}px`,
                    top: `${note.position.y}px`,
                    width: '250px',
                    transform: `rotate(${Math.random() * 4 - 2}deg)`
                  }}
                  drag
                  dragMomentum={false}
                  onDragEnd={(event, info) => {
                    const boardRect = boardRef.current?.getBoundingClientRect();
                    if (boardRect) {
                      const newX = note.position.x + info.offset.x;
                      const newY = note.position.y + info.offset.y;
                      setNotes(notes.map(n => 
                        n.id === note.id 
                          ? { ...n, position: { x: Math.max(0, Math.min(newX, boardRect.width - 250)), y: Math.max(0, Math.min(newY, boardRect.height - 200)) } }
                          : n
                      ));
                    }
                  }}
                >
                  {/* Pin */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                  </div>

                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-3 w-3 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-800 truncate">
                          {note.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{note.author}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Note Content */}
                  <div className="text-sm text-gray-800 dark:text-gray-900 mb-3 whitespace-pre-wrap break-words">
                    {note.text}
                  </div>

                  {/* Voting Section */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => handleVote(note.id, 'up')}
                      className={`p-1 rounded transition-colors ${
                        note.userVote === 'up'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <span className={`text-sm font-semibold min-w-[2rem] text-center ${
                      note.votes > 0 ? 'text-green-600' : note.votes < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {note.votes > 0 ? '+' : ''}{note.votes}
                    </span>
                    <button
                      onClick={() => handleVote(note.id, 'down')}
                      className={`p-1 rounded transition-colors ${
                        note.userVote === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Stats */}
        {notes.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Notes
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {notes.reduce((sum, note) => sum + (note.votes > 0 ? note.votes : 0), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Upvotes
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(notes.map(n => n.subject)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Subjects Covered
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

