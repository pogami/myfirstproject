"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, Users, MessageSquare, Sparkles } from "lucide-react";

type SimUser = {
  id: string;
  name: string;
};

export default function TestChatPage() {
  const ROOM_ID = "test-shared-room";
  const { chats, addChat, addMessage, setCurrentTab, currentTab } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const [activeUser, setActiveUser] = useState<SimUser>({ id: "u1", name: "Alice" });
  const otherUser: SimUser = useMemo(() => ({ id: activeUser.id === "u1" ? "u2" : "u1", name: activeUser.id === "u1" ? "Bob" : "Alice" }), [activeUser]);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Ensure the room exists and focused
  useEffect(() => {
    (async () => {
      console.log('Test chat useEffect running, chats:', Object.keys(chats));
      if (!chats[ROOM_ID]) {
        console.log('Creating test chat room...');
        const welcomeMessage = {
          id: "welcome",
          text: "Welcome to the test chat room.",
          sender: "system" as const,
          name: "System",
          timestamp: Date.now()
        };
        await addChat("Test Shared Room", welcomeMessage, ROOM_ID, "public");
        console.log('Test chat room created');
      }
      setCurrentTab(ROOM_ID);
    })();
  }, [ROOM_ID, addChat, setCurrentTab]); // Removed chats from dependencies to prevent loop

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats[currentTab || ROOM_ID]?.messages?.length]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const message = {
      id: `${Date.now()}`,
      text,
      sender: "user" as const,
      name: activeUser.name,
      userId: activeUser.id,
      timestamp: Date.now(),
    };

    console.log('Sending message as', activeUser.name, ':', text);
    setInputValue("");
    await addMessage(ROOM_ID, message);
    console.log('Message sent, current messages:', chats[ROOM_ID]?.messages?.length);

    const hasAIMention = text.includes("@ai") || text.includes("@AI");
    if (hasAIMention) {
      setIsLoading(true);
      try {
        const cleaned = text.replace(/@ai|@AI/g, "").trim();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: cleaned || text, context: "Test Shared Room", conversation: (chats[ROOM_ID]?.messages || []).slice(-6).map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })) }),
        });
        const data = await res.json();
        const aiText = data?.answer || data?.response || "(No AI response)";
        await addMessage(ROOM_ID, { id: `${Date.now()}-ai`, text: aiText, sender: "bot", name: "AI", timestamp: Date.now() });
      } catch (e) {
        await addMessage(ROOM_ID, { id: `${Date.now()}-aierr`, text: "AI failed to respond.", sender: "system", name: "System", timestamp: Date.now() });
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputValue, addMessage, ROOM_ID, activeUser, chats]);

  const sendAsOtherUser = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;
    const msg = { id: `${Date.now()}-other`, text, sender: "user" as const, name: otherUser.name, userId: otherUser.id, timestamp: Date.now() };
    setInputValue("");
    await addMessage(ROOM_ID, msg);
  }, [inputValue, addMessage, ROOM_ID, otherUser]);

  const messages = chats[ROOM_ID]?.messages || [];
  
  console.log('Test chat render - ROOM_ID:', ROOM_ID, 'currentTab:', currentTab, 'messages count:', messages.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discord-Style Chat Test
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience real-time collaborative chat with AI integration. Switch between users and mention <Badge variant="secondary" className="mx-1">@ai</Badge> to get intelligent responses.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                      {activeUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activeUser.name}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <Badge variant="default" className="text-xs">You</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-500 text-white text-sm">
                      {otherUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{otherUser.name}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Switch User</label>
                <Select
                  value={activeUser.id}
                  onValueChange={(value) => setActiveUser(value === "u1" ? { id: "u1", name: "Alice" } : { id: "u2", name: "Bob" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u1">Alice</SelectItem>
                    <SelectItem value="u2">Bob</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  <span>AI Assistant Ready</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type @ai in your message to get help
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Chat */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test Shared Room
                <Badge variant="outline" className="ml-auto">
                  {messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[600px]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Welcome to the chat!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Start the conversation by sending a message. Try mentioning <Badge variant="secondary" className="mx-1">@ai</Badge> to see the AI in action.
                    </p>
                  </div>
                ) : (
                  messages.map((m: any) => (
                    <div key={m.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className={`text-xs ${
                          m.sender === "bot" ? "bg-blue-500 text-white" :
                          m.sender === "system" ? "bg-amber-500 text-white" :
                          m.name === "Alice" ? "bg-pink-500 text-white" :
                          "bg-green-500 text-white"
                        }`}>
                          {m.sender === "bot" ? "AI" : m.sender === "system" ? "S" : m.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {m.sender === "bot" ? (
                              <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                AI Assistant
                              </span>
                            ) : m.sender === "system" ? (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                System
                              </span>
                            ) : (
                              m.name
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(m.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={`text-sm leading-relaxed ${
                          m.sender === "bot" ? "text-blue-700 dark:text-blue-300" :
                          m.sender === "system" ? "text-amber-700 dark:text-amber-300" :
                          "text-foreground"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Message as ${activeUser.name}... (try @ai for AI help)`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === "Enter" && !e.shiftKey) { 
                        e.preventDefault(); 
                        sendMessage(); 
                      } 
                    }}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={sendAsOtherUser}
                    disabled={isLoading || !inputValue.trim()}
                    className="flex-1"
                  >
                    Send as {otherUser.name}
                  </Button>
                </div>

                {isLoading && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    AI is thinking...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Built with Next.js, Zustand, and Firebase • Real-time chat simulation</p>
        </div>
      </div>
    </div>
  );
}


