
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Firestore } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';

export type Message = {
    id?: string;
    sender: "user" | "bot" | "moderator" | "system";
    text: string;
    name: string;
    timestamp: number;
    userId?: string;
    isJoinMessage?: boolean;
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
  addChat: (chatName: string, initialMessage: Message, customChatId?: string, chatType?: 'private' | 'public' | 'class') => Promise<void>;
  addMessage: (chatId: string, message: Message, replaceLast?: boolean) => Promise<void>;
  addUserJoinMessage: (chatId: string, userName: string, userId: string) => Promise<void>;
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

      initializeAuthListener: () => {
        // Check if auth is properly initialized
        if (!auth || typeof auth !== 'object' || typeof auth.onAuthStateChanged !== 'function') {
          console.warn("Auth object not properly initialized, falling back to guest mode");
          set({ isGuest: true, isStoreLoading: false });
          return () => {}; // Return empty unsubscribe function
        }
        
        // Set loading to false immediately to prevent infinite loading
        setTimeout(() => {
          const currentState = get();
          if (currentState.isStoreLoading) {
            console.log("Setting store loading to false after timeout");
            set({ isStoreLoading: false });
          }
        }, 1000); // 1 second timeout
        
        const unsubscribe = onAuthStateChanged(auth as Auth, async (user) => {
          try {
            if (user) {
              // User is signed in.
              set({ isGuest: false, isStoreLoading: true });
              
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
        } catch (error) {
            // Only log non-offline errors to reduce noise
            if (error && typeof error === 'object' && 'code' in error && error.code !== 'unavailable') {
                console.warn("Failed to save chat to firestore:", error);
            }
            // Chat is already saved locally, so continue working
        }
      },

      addMessage: async (chatId, message, replaceLast = false) => {
        const { isGuest } = get();
        
        // Ensure message text is always a string
        const safeMessage = {
          ...message,
          text: typeof message.text === 'string' ? message.text : JSON.stringify(message.text)
        };
        
        // Optimistic update for immediate UI response
        set((state) => {
          if (!state.chats[chatId]) return state;
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

        // Persist to Firestore in background (non-blocking)
        if (!isGuest) {
            // Don't await this - let it run in background
            const chatDocRef = doc(db as Firestore, 'chats', chatId);
            getDoc(chatDocRef).then(chatDocSnap => {
              if (chatDocSnap.exists()) {
                const currentMessages = chatDocSnap.data().messages || [];
                const newMessages = replaceLast ? [...currentMessages.slice(0, -1), safeMessage] : [...currentMessages, safeMessage];
                return updateDoc(chatDocRef, { messages: newMessages });
              }
            }).catch(e => {
                // Only log non-offline errors to reduce noise
                if (e && typeof e === 'object' && 'code' in e && e.code !== 'unavailable') {
                    console.warn("Failed to save message to firestore:", e);
                }
                // Continue working in offline mode - the message is already in local state
            });
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
        const newWelcomeMessage = {
          sender: 'bot' as const,
          name: 'CourseConnect AI',
          text: 'Welcome to General Chat! 🎓\n\nQuick Start: Ask questions about any topic, get AI homework help, or discuss academic concepts. Be specific and detailed for better assistance!\n\nSubjects: Math, Science, English, History, Computer Science & more.',
          timestamp: Date.now()
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
            text: `Welcome to Private General Chat! 🤖\n\n**Private Chat Features:**\n• Direct AI assistance with any topic\n• Personalized study help\n• Homework support\n• Academic guidance\n\n**How to use:**\n• Just type your question - AI responds automatically\n• No need for @ mentions here\n• Get detailed, step-by-step explanations\n\nWhat can I help you with today?`,
            timestamp: Date.now()
          };
          
          set((state) => ({
            chats: {
              ...state.chats,
              'private-general-chat': {
                id: 'private-general-chat',
                title: 'Private General Chat',
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
            text: `Welcome to Public General Chat! 👥\n\nQuick Start: Chat with other students, share study resources, or collaborate on topics. Type @ai to call the AI assistant.\n\nFeatures: Student collaboration, AI assistance, knowledge sharing & more.`,
            timestamp: Date.now()
          };
          
          set((state) => ({
            chats: {
              ...state.chats,
              'public-general-chat': {
                id: 'public-general-chat',
                title: 'Public General Chat',
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

