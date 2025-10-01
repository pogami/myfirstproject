
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Firestore, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Socket } from 'socket.io-client';

export type Message = {
    id?: string;
    sender: "user" | "bot" | "moderator" | "system";
    text: string;
    name: string;
    timestamp: number;
    userId?: string;
    isJoinMessage?: boolean;
    sources?: Array<{
        title: string;
        url: string;
        snippet: string;
    }>;
    file?: {
        name: string;
        size: number;
        type: string;
        url: string;
    };
};

export type Chat = {
    id: string;
    title: string;
    messages: Message[];
    createdAt?: number;
    updatedAt?: number;
    chatType?: 'private' | 'public' | 'class';
    classGroupId?: string;
    members?: string[];
};

interface ChatState {
  chats: Record<string, Chat>;
  currentTab: string | undefined;
  showUpgrade: boolean; // To control the upgrade modal
  isGuest: boolean;
  isStoreLoading: boolean;
  isSendingMessage: boolean; // Loading state for message sending
  isDemoMode: boolean; // Demo mode for Advanced AI features
  trialActivated: boolean; // Whether user has activated their trial
  trialStartDate: number | null; // When the trial started (timestamp)
  trialDaysLeft: number; // Days remaining in trial
  // Socket.IO integration
  socket: Socket | null;
  isSocketConnected: boolean;
  activeUsers: Array<{ userId: string; userName: string }>;
  typingUsers: Array<{ userId: string; userName: string }>;
  isAiThinking: boolean;
  addChat: (chatName: string, initialMessage: Message, customChatId?: string, chatType?: 'private' | 'public' | 'class') => Promise<void>;
  addMessage: (chatId: string, message: Message, replaceLast?: boolean) => Promise<void>;
  addUserJoinMessage: (chatId: string, userName: string, userId: string) => Promise<void>;
  joinPublicGeneralChat: () => Promise<void>;
  subscribeToChat: (chatId: string) => Promise<void>;
  setCurrentTab: (tabId: string | undefined) => void;
  setShowUpgrade: (show: boolean) => void;
  setIsDemoMode: (isDemo: boolean) => void;
  activateTrial: () => void; // Activate the 14-day trial
  updateTrialDaysLeft: () => void; // Update trial days remaining
  initializeAuthListener: () => () => void; // Returns an unsubscribe function
  clearGuestData: () => void;
  resetChat: (chatId: string) => Promise<void>;
  exportChat: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  initializeGeneralChats: () => void;
  // Socket.IO methods
  setSocket: (socket: Socket | null) => void;
  setSocketConnected: (connected: boolean) => void;
  setActiveUsers: (users: Array<{ userId: string; userName: string }>) => void;
  setTypingUsers: (users: Array<{ userId: string; userName: string }>) => void;
  setAiThinking: (thinking: boolean) => void;
  sendRealtimeMessage: (chatId: string, message: Message) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  receiveRealtimeMessage: (chatId: string, message: Message) => void;
}

const getChatId = (chatName: string) => chatName.toLowerCase().replace(/[\\s:]/g, '-');


export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentTab: undefined,
      showUpgrade: false,
      isGuest: true,
      isStoreLoading: true,
      isSendingMessage: false,
      isDemoMode: false, // Only enable demo mode when trial is activated
      trialActivated: false, // Trial not activated by default
      trialStartDate: null, // No trial start date initially
      trialDaysLeft: 14, // Full 14 days available
      // Socket.IO state
      socket: null,
      isSocketConnected: false,
      activeUsers: [],
      typingUsers: [],
      isAiThinking: false,
      // Track active Firestore subscriptions to avoid duplicates
      _chatSubscriptions: {} as Record<string, () => void>,

      initializeAuthListener: () => {
        console.log("initializeAuthListener called");
        
        // Immediately set loading to false and enable guest mode for real-time chat
        console.log("Setting isStoreLoading to false and isGuest to true");
        set({ isStoreLoading: false, isGuest: true });
        
        // Check if auth is properly initialized
        if (!auth || typeof auth !== 'object' || typeof auth.onAuthStateChanged !== 'function') {
          console.warn("Auth object not properly initialized, using guest mode for real-time chat");
          return () => {}; // Return empty unsubscribe function
        }
        
        console.log("Auth object is properly initialized, setting up auth listener");
        
        const unsubscribe = onAuthStateChanged(auth as Auth, async (user) => {
          try {
            console.log("Auth state changed, user:", user ? "signed in" : "signed out");
            if (user) {
              // User is signed in.
              console.log("User signed in, loading chats...");
              set({ isGuest: false, isStoreLoading: false }); // Keep loading false for real-time chat
              
              try {
                const userDocRef = doc(db as Firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const chatIds: string[] = userData.chats || [];
                    const chatsToLoad: Record<string, Chat> = {};

                    for (const chatId of chatIds) {
                         const chatDocRef = doc(db as Firestore, 'chats', chatId);
                         const chatDocSnap = await getDoc(chatDocRef);
                         if (chatDocSnap.exists()) {
                             const chatData = chatDocSnap.data() as Omit<Chat, 'id'>;
                             chatsToLoad[chatId] = { ...chatData, id: chatId };
                         }
                    }
                    // Merge with existing local chats to preserve any guest chats
                    const currentState = get();
                    const mergedChats = { ...currentState.chats, ...chatsToLoad };
                    set({ chats: mergedChats, isStoreLoading: false });
                } else {
                     // Don't overwrite existing chats if user has no Firestore chats yet
                     const currentState = get();
                     if (Object.keys(currentState.chats).length === 0) {
                         set({ chats: {}, isStoreLoading: false });
                     } else {
                         set({ isStoreLoading: false });
                     }
                }
              } catch (error) {
                console.warn("Failed to load user chats (offline mode):", error);
                // Continue in offline mode - preserve existing chats
                const currentState = get();
                if (Object.keys(currentState.chats).length === 0) {
                    set({ chats: {}, isStoreLoading: false });
                } else {
                    set({ isStoreLoading: false });
                }
              }
            } else {
              // User is signed out. The persisted local state for guests will be used.
              console.log("User signed out, switching to guest mode");
              set({ isGuest: true, isStoreLoading: false });
            }
          } catch (authError) {
            console.warn("Auth state change error (offline mode):", authError);
            // If auth fails completely, fall back to guest mode
            set({ isGuest: true, isStoreLoading: false });
          }
        });
        return unsubscribe;
      },

      addChat: async (chatName, initialMessage, customChatId?: string, chatType: 'private' | 'public' | 'class' = 'private') => {
        const chatId = customChatId || getChatId(chatName);
        const { isGuest } = get();
        
        const newChat: Chat = {
          id: chatId,
          title: chatName,
          messages: [initialMessage],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          chatType,
          members: chatType !== 'private' ? [] : undefined
        };

        console.log('addChat called:', { chatName, chatId, customChatId, isGuest });

        // Ensure initial message text is always a string
        const safeInitialMessage = {
          ...initialMessage,
          text: typeof initialMessage.text === 'string' ? initialMessage.text : JSON.stringify(initialMessage.text)
        };

        // Check if chat already exists
        if (get().chats[chatId]) {
          // Chat exists, just switch to it
          console.log('Chat already exists, switching to:', chatId);
          set({ currentTab: chatId });
          return;
        }

        if (isGuest) {
            // For guest users, just add to local state
            set((state) => ({
                chats: {
                    ...state.chats,
                    [chatId]: {
                        id: chatId,
                        title: chatName,
                        messages: [safeInitialMessage],
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    }
                },
                currentTab: chatId
            }));
            return;
        }

        // Check if auth is properly initialized before accessing currentUser
        if (!auth || typeof auth !== 'object' || typeof auth.currentUser === 'undefined') {
          console.warn("Auth object not properly initialized, skipping Firestore operations");
          return;
        }
        
        const user = (auth as Auth)?.currentUser;
        if (!user) {
          console.log('No authenticated user, skipping Firestore operations');
          return;
        }

        console.log('User authenticated, persisting chat to Firestore:', user.uid);

        // Optimistically update local state first
        set((state) => {
            console.log('Adding chat to local state:', { chatId, chatName });
            return {
                chats: {
                    ...state.chats,
                    [chatId]: {
                        id: chatId,
                        title: chatName,
                        messages: [safeInitialMessage],
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    }
                },
                currentTab: chatId
            };
        });

        // Try to persist to Firestore (but don't fail if offline)
        try {
            const chatDocRef = doc(db as Firestore, 'chats', chatId);
            const chatDocSnap = await getDoc(chatDocRef);

            if (!chatDocSnap.exists()) {
                const newChat: Omit<Chat, 'id'> = {
                    title: chatName,
                    messages: [safeInitialMessage],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                await setDoc(chatDocRef, newChat);
            }
            
            const userDocRef = doc(db as Firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
                chats: arrayUnion(chatId)
            });

            // Start realtime subscription
            await get().subscribeToChat(chatId);
        } catch (error) {
            // Only log non-offline errors to reduce noise
            if (error && typeof error === 'object' && 'code' in error && error.code !== 'unavailable') {
                console.warn("Failed to save chat to firestore:", error);
            }
            // Chat is already saved locally, so continue working
        }
      },

      addMessage: async (chatId, message, replaceLast = false) => {
        console.log('addMessage called:', { chatId, message: { id: message.id, text: message.text, sender: message.sender } });
        const { isGuest, socket, isSocketConnected } = get();
        // Ensure chat exists locally
        set((state) => {
          if (!state.chats[chatId]) {
            state.chats[chatId] = {
              id: chatId,
              title: chatId === 'public-general-chat' ? 'Community' : chatId,
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              chatType: chatId === 'public-general-chat' ? 'public' : 'private'
            } as Chat;
          }
          return state;
        });
        
        // Generate unique ID for message if it doesn't have one
        const generateMessageId = () => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const sessionId = Math.random().toString(36).substr(2, 4);
          return `${timestamp}-${random}-${sessionId}`;
        };
        
        // Ensure message text is always a string and has a unique ID
        const safeMessage = {
          ...message,
          id: message.id || generateMessageId(), // Generate ID if missing
          text: typeof message.text === 'string' ? message.text : JSON.stringify(message.text)
        };
        
        // Optimistic update for immediate UI response (with deduplication)
        set((state) => {
          if (!state.chats[chatId]) return state;
          
        // Check if message already exists (by ID first, then by content)
        const existingById = state.chats[chatId].messages.find(m => m.id === safeMessage.id);
        const existingByContent = state.chats[chatId].messages.find(m => 
          m.timestamp === safeMessage.timestamp && 
          m.userId === safeMessage.userId && 
          m.text === safeMessage.text
        );
        
        if (existingById) {
          console.log('Message already exists by ID in addMessage, skipping duplicate:', { 
            id: safeMessage.id, 
            existingId: existingById.id,
            text: safeMessage.text?.substring(0, 50) + '...',
            totalMessages: state.chats[chatId].messages.length
          });
          return state;
        }
        
        if (existingByContent) {
          console.log('Message already exists by content in addMessage, skipping duplicate:', { 
            id: safeMessage.id, 
            existingId: existingByContent.id,
            text: safeMessage.text?.substring(0, 50) + '...',
            totalMessages: state.chats[chatId].messages.length
          });
          return state;
        }
        
        console.log('Adding new message to chat:', { 
          id: safeMessage.id, 
          userId: safeMessage.userId,
          text: safeMessage.text?.substring(0, 50) + '...',
          totalMessages: state.chats[chatId].messages.length + 1
        });
          
          const messages = state.chats[chatId].messages;
          const newMessages = replaceLast ? [...messages.slice(0, -1), safeMessage] : [...messages, safeMessage];
           return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: newMessages,
              },
            },
          };
        });

        // Broadcast message via Socket.IO for real-time delivery
        if (socket && isSocketConnected) {
          console.log('Broadcasting message via Socket.IO:', { 
            messageId: safeMessage.id, 
            userId: safeMessage.userId, 
            userName: safeMessage.name,
            chatId 
          });
          socket.emit('send-message', {
            chatId,
            message: safeMessage
          });
        } else {
          console.log('Socket not connected, message not broadcasted:', { 
            hasSocket: !!socket, 
            isSocketConnected, 
            messageId: safeMessage.id 
          });
        }

        // Persist to Firestore in background (non-blocking) - works for both guest and authenticated users
        try {
            // Don't await this - let it run in background
            const chatDocRef = doc(db as Firestore, 'chats', chatId);
            getDoc(chatDocRef).then(chatDocSnap => {
              if (chatDocSnap.exists()) {
                const currentMessages = chatDocSnap.data().messages || [];
                const newMessages = replaceLast ? [...currentMessages.slice(0, -1), safeMessage] : [...currentMessages, safeMessage];
                return updateDoc(chatDocRef, { messages: newMessages });
              } else {
                // Create the chat doc if missing (especially for public-general-chat)
                const newChat: Omit<Chat, 'id'> = {
                  title: chatId === 'public-general-chat' ? 'Community' : chatId,
                  messages: [safeMessage],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  chatType: chatId === 'public-general-chat' ? 'public' : 'private'
                };
                return setDoc(chatDocRef, newChat);
              }
            }).catch(e => {
                // Only log non-offline errors to reduce noise
                if (e && typeof e === 'object' && 'code' in e && e.code !== 'unavailable') {
                    console.warn("Failed to save message to firestore:", e);
                }
                // Continue working in offline mode - the message is already in local state
            });
        } catch (error) {
            console.warn("Failed to save message to Firestore:", error);
            // Continue in real-time mode even if Firestore fails
        }
      },

      addUserJoinMessage: async (chatId: string, userName: string, userId: string) => {
        const joinMessage: Message = {
          sender: 'system',
          name: 'System',
          text: `${userName} has joined the chat`,
          timestamp: Date.now(),
          userId,
          isJoinMessage: true
        };

        const { addMessage } = get();
        await addMessage(chatId, joinMessage);
      },

      // Ensure public-general-chat exists and subscribe to it
      joinPublicGeneralChat: async () => {
        const chatId = 'public-general-chat';
        const chatTitle = 'Community';
        const { isGuest } = get();

        // Optimistically create locally if missing
        set((state) => {
          if (state.chats[chatId]) return state;
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                id: chatId,
                title: chatTitle,
                messages: [{
                  sender: 'bot',
                  name: 'CourseConnect AI',
                  text: 'Welcome to Community Chat! Connect with students, share knowledge, and study together. Type @ai to ask the AI in this room.',
                  timestamp: Date.now()
                }],
                chatType: 'public',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                members: []
              }
            },
            currentTab: chatId
          };
        });

        // Firestore: ensure doc exists and subscribe
        try {
          const chatDocRef = doc(db as Firestore, 'chats', chatId);
          const chatDocSnap = await getDoc(chatDocRef);
          if (!chatDocSnap.exists()) {
            await setDoc(chatDocRef, {
              title: chatTitle,
              messages: [{
                sender: 'bot',
                name: 'CourseConnect AI',
                text: 'Welcome to the Public General Chat! Type @ai to ask the AI in this room.',
                timestamp: Date.now()
              }],
              chatType: 'public',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              members: []
            } as Omit<Chat, 'id'>);
          }

          // Subscribe to realtime updates
          await get().subscribeToChat(chatId);
          set({ currentTab: chatId });
        } catch (e) {
          console.warn('joinPublicGeneralChat failed (offline mode ok):', e);
        }
      },

      // Subscribe to a chat document for realtime updates
      subscribeToChat: async (chatId: string) => {
        try {
          const anyState = get() as any;
          if (!anyState._chatSubscriptions) anyState._chatSubscriptions = {};
          if (anyState._chatSubscriptions[chatId]) {
            return; // Already subscribed
          }

          const chatDocRef = doc(db as Firestore, 'chats', chatId);
          const unsubscribe = onSnapshot(chatDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() as Omit<Chat, 'id'>;
              // Ensure messages text are strings for safety
              const safeMessages = (data.messages || []).map((m: any) => ({
                ...m,
                text: typeof m.text === 'string' ? m.text : JSON.stringify(m.text)
              }));
              set((state) => ({
                chats: {
                  ...state.chats,
                  [chatId]: {
                    id: chatId,
                    ...data,
                    messages: safeMessages
                  }
                }
              }));
            }
          }, (error) => {
            console.warn('onSnapshot error for chat', chatId, error);
          });

          anyState._chatSubscriptions[chatId] = unsubscribe;
        } catch (e) {
          console.warn('subscribeToChat failed (offline mode ok):', e);
        }
      },
      setCurrentTab: (tabId) => {
        console.log('setCurrentTab called with:', tabId);
        console.log('Available chats:', Object.keys(get().chats));
        set({ currentTab: tabId });
      },
      setShowUpgrade: (show) => set({ showUpgrade: show }),
      setIsDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
      
      // Trial management functions
      activateTrial: () => {
        const now = Date.now();
        set({ 
          trialActivated: true, 
          trialStartDate: now,
          trialDaysLeft: 14,
          isDemoMode: true // Enable demo mode when trial is activated
        });
        console.log("Trial activated! Started at:", new Date(now).toISOString());
      },
      
      updateTrialDaysLeft: () => {
        const { trialActivated, trialStartDate } = get();
        if (!trialActivated || !trialStartDate) {
          return; // No trial active
        }
        
        const now = Date.now();
        const trialEndTime = trialStartDate + (14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds
        const timeRemaining = trialEndTime - now;
        
        if (timeRemaining <= 0) {
          // Trial expired
          set({ 
            trialDaysLeft: 0, 
            isDemoMode: false,
            trialActivated: false 
          });
        } else {
          // Calculate days remaining
          const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
          set({ trialDaysLeft: daysRemaining });
        }
      },
      
      clearGuestData: () => set({ chats: {}, currentTab: undefined }),
      
      resetChat: async (chatId) => {
        const { isGuest } = get();
        const chat = get().chats[chatId];
        if (!chat) return;

        // Clear all messages and add new welcome message
        const newWelcomeMessage = chatId === 'public-general-chat' ? {
          sender: 'bot' as const,
          name: 'CourseConnect AI',
          text: `Welcome to Community Chat! 👥 Connect with fellow students, share knowledge, and study together. Chat with students, form study groups, share resources, or get AI help by typing @ai. Just start typing to join the conversation!`
        } : {
          sender: 'bot' as const,
          name: 'CourseConnect AI',
          text: `Welcome to General Chat! 👋 I'm your personal AI assistant, ready to help with any academic questions. I can help with study support, homework, academic guidance, and any subject. Simply type your question below and I'll provide detailed responses. Ready to learn? Ask me anything! 🚀`
        };
        const resetMessages = [newWelcomeMessage];

        // Update local state
        set((state) => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              messages: resetMessages
            }
          }
        }));

        // Update Firestore if user is logged in
        if (!isGuest) {
          const chatDocRef = doc(db as Firestore, 'chats', chatId);
          try {
            await updateDoc(chatDocRef, { messages: resetMessages });
          } catch (error) {
            console.warn("Failed to reset chat in firestore:", error);
          }
        }
      },

      exportChat: (chatId) => {
        const chat = get().chats[chatId];
        if (!chat) return;

        const exportData = {
          chatName: chat.title,
          exportDate: new Date().toISOString(),
          messageCount: chat.messages.length,
          messages: chat.messages.map(msg => ({
            sender: msg.sender,
            name: msg.name,
            text: msg.text,
            timestamp: new Date(msg.timestamp).toLocaleString()
          }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}_chat_export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      deleteChat: async (chatId) => {
        const { isGuest, currentTab } = get();
        
        // Prevent deletion of general chat
        if (chatId === 'general-chat') {
          console.log('Cannot delete general chat');
          return;
        }
        
        // Update local state
        set((state) => {
          const newChats = { ...state.chats };
          delete newChats[chatId];
          
          // If we're deleting the current tab, switch to another chat or undefined
          let newCurrentTab = currentTab;
          if (currentTab === chatId) {
            const remainingChats = Object.keys(newChats);
            newCurrentTab = remainingChats.length > 0 ? remainingChats[0] : undefined;
          }
          
          return {
            chats: newChats,
            currentTab: newCurrentTab
          };
        });

        // Update Firestore if user is logged in
        if (!isGuest) {
          try {
            // Check if auth is properly initialized before accessing currentUser
            if (!auth || typeof auth !== 'object' || typeof auth.currentUser === 'undefined') {
              console.warn("Auth object not properly initialized, skipping Firestore operations");
              return;
            }
            
            // Remove chat from user's chat list
            const user = (auth as Auth)?.currentUser;
            if (user) {
              const userDocRef = doc(db as Firestore, 'users', user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const chatIds = userData.chats || [];
                const updatedChatIds = chatIds.filter((id: string) => id !== chatId);
                await updateDoc(userDocRef, { chats: updatedChatIds });
              }
            }
          } catch (error) {
            console.warn("Failed to delete chat from firestore:", error);
          }
        }
      },
      
      initializeGeneralChats: () => {
        const { chats } = get();
        
        // Create Private General Chat
        if (!chats['private-general-chat']) {
          const privateGeneralMessage = {
            sender: 'bot' as const,
            name: 'CourseConnect AI',
            text: `Welcome to General Chat! 👋 I'm your personal AI assistant, ready to help with any academic questions. I can help with study support, homework, academic guidance, and any subject. Simply type your question below and I'll provide detailed responses. Ready to learn? Ask me anything! 🚀`,
            timestamp: Date.now()
          };
          
          set((state) => ({
            chats: {
              ...state.chats,
              'private-general-chat': {
                id: 'private-general-chat',
                title: 'General Chat',
                messages: [privateGeneralMessage],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                chatType: 'private'
              }
            },
            currentTab: state.currentTab || 'private-general-chat'
          }));
        }

        // Create Public General Chat
        if (!chats['public-general-chat']) {
          const publicGeneralMessage = {
            sender: 'bot' as const,
            name: 'CourseConnect AI',
            text: `Welcome to Community Chat! 👥 Connect with fellow students, share knowledge, and study together. Chat with students, form study groups, share resources, or get AI help by typing @ai. Just start typing to join the conversation!`,
            timestamp: Date.now()
          };
          
          set((state) => ({
            chats: {
              ...state.chats,
              'public-general-chat': {
                id: 'public-general-chat',
                title: 'Community',
                messages: [publicGeneralMessage],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                chatType: 'public',
                members: []
              }
            }
          }));
        }
      },

      // Socket.IO methods
      setSocket: (socket) => set({ socket }),
      setSocketConnected: (connected) => set({ isSocketConnected: connected }),
      setActiveUsers: (users) => set({ activeUsers: users }),
      setTypingUsers: (users) => set({ typingUsers: users }),
      setAiThinking: (thinking) => set({ isAiThinking: thinking }),
      
      sendRealtimeMessage: (chatId, message) => {
        const { socket } = get();
        if (socket && get().isSocketConnected) {
          console.log('Sending real-time message:', { chatId, message });
          socket.emit('send-message', { chatId, message });
        }
      },
      
      startTyping: (chatId) => {
        const { socket } = get();
        if (socket && get().isSocketConnected) {
          console.log('Starting typing indicator for chat:', chatId);
          socket.emit('typing-start', { chatId });
        }
      },
      
      stopTyping: (chatId) => {
        const { socket } = get();
        if (socket && get().isSocketConnected) {
          console.log('Stopping typing indicator for chat:', chatId);
          socket.emit('typing-stop', { chatId });
        }
      },
      
      receiveRealtimeMessage: (chatId, message) => {
        console.log('Receiving real-time message:', { chatId, message });
        
        // Skip messages from the current user to avoid duplicates
        const { isGuest } = get();
        const currentUserId = isGuest ? 'guest' : (auth as Auth)?.currentUser?.uid;
        
        if (message.userId === currentUserId) {
          console.log('Skipping message from current user to avoid duplicate:', { 
            messageUserId: message.userId, 
            currentUserId,
            messageId: message.id 
          });
          return;
        }
        
        // Generate unique ID for incoming message if it doesn't have one
        const generateMessageId = () => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const sessionId = Math.random().toString(36).substr(2, 4);
          return `${timestamp}-${random}-${sessionId}`;
        };
        
        // Ensure chat exists locally
        set((state) => {
          if (!state.chats[chatId]) {
            state.chats[chatId] = {
              id: chatId,
              title: chatId === 'public-general-chat' ? 'Community' : chatId,
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              chatType: chatId === 'public-general-chat' ? 'public' : 'private'
            } as Chat;
          }
          return state;
        });
        
        // Ensure message text is always a string and has a unique ID
        const safeMessage = {
          ...message,
          id: message.id || generateMessageId(), // Generate ID if missing
          text: typeof message.text === 'string' ? message.text : JSON.stringify(message.text)
        };
        
        // Add message to local state (avoid duplicates)
        set((state) => {
          if (!state.chats[chatId]) return state;
          
          // Check if message already exists (by ID first, then by content)
          const existingById = state.chats[chatId].messages.find(m => m.id === safeMessage.id);
          const existingByContent = state.chats[chatId].messages.find(m => 
            m.timestamp === safeMessage.timestamp && 
            m.userId === safeMessage.userId && 
            m.text === safeMessage.text
          );
          
          if (existingById) {
            console.log('Message already exists by ID, skipping duplicate:', { 
              id: safeMessage.id, 
              existingId: existingById.id,
              text: safeMessage.text 
            });
            return state;
          }
          
          if (existingByContent) {
            console.log('Message already exists by content, skipping duplicate:', { 
              id: safeMessage.id, 
              existingId: existingByContent.id,
              text: safeMessage.text 
            });
            return state;
          }
          
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: [...state.chats[chatId].messages, safeMessage],
              },
            },
          };
        });
      },
    }),
    {
      name: 'chat-storage', // This will now store guest chats
      storage: createJSONStorage(() => {
        // Check if localStorage is available (client-side)
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage;
        }
        // Fallback for server-side rendering
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist specific fields, not the entire state (exclude Socket.IO objects)
      partialize: (state) => ({
        chats: state.chats,
        currentTab: state.currentTab,
        isGuest: state.isGuest,
        isDemoMode: state.isDemoMode,
        trialActivated: state.trialActivated,
        trialStartDate: state.trialStartDate,
        trialDaysLeft: state.trialDaysLeft
        // Exclude: socket, isSocketConnected, activeUsers, typingUsers, isAiThinking
      })
    }
  )
);

// Initialize the auth listener when the app loads (with error handling)
try {
  if (typeof window !== 'undefined') {
    useChatStore.getState().initializeAuthListener();
  }
} catch (error) {
  console.warn("Failed to initialize auth listener:", error);
}

