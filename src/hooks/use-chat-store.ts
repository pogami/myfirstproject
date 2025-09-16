
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Firestore } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';

export type Message = {
    sender: "user" | "bot" | "moderator";
    text: string;
    name: string;
    timestamp: number;
    userId?: string;
};

export type Chat = {
    id: string;
    title: string;
    messages: Message[];
    createdAt?: number;
    updatedAt?: number;
};

interface ChatState {
  chats: Record<string, Chat>;
  currentTab: string | undefined;
  showUpgrade: boolean; // To control the upgrade modal
  isGuest: boolean;
  isStoreLoading: boolean;
  isSendingMessage: boolean; // Loading state for message sending
  isDemoMode: boolean; // Demo mode for Advanced AI features
  addChat: (chatName: string, initialMessage: Message) => Promise<void>;
  addMessage: (chatId: string, message: Message, replaceLast?: boolean) => Promise<void>;
  setCurrentTab: (tabId: string | undefined) => void;
  setShowUpgrade: (show: boolean) => void;
  setIsDemoMode: (isDemo: boolean) => void;
  initializeAuthListener: () => () => void; // Returns an unsubscribe function
  clearGuestData: () => void;
  resetChat: (chatId: string) => Promise<void>;
  exportChat: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
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
      isDemoMode: true, // Default to demo mode enabled

      initializeAuthListener: () => {
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

      addChat: async (chatName, initialMessage, customChatId?: string) => {
        const chatId = customChatId || getChatId(chatName);
        const { isGuest } = get();

        // Check if chat already exists
        if (get().chats[chatId]) {
          // Chat exists, just switch to it
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
                        messages: [initialMessage],
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    }
                },
                currentTab: chatId
            }));
            return;
        }

        const user = (auth as Auth)?.currentUser;
        if (!user) return;

        // Optimistically update local state first
        set((state) => ({
            chats: {
                ...state.chats,
                [chatId]: {
                    id: chatId,
                    title: chatName,
                    messages: [initialMessage],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            },
            currentTab: chatId
        }));

        // Try to persist to Firestore (but don't fail if offline)
        try {
            const chatDocRef = doc(db as Firestore, 'chats', chatId);
            const chatDocSnap = await getDoc(chatDocRef);

            if (!chatDocSnap.exists()) {
                const newChat: Omit<Chat, 'id'> = {
                    title: chatName,
                    messages: [initialMessage],
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
            console.warn("Failed to save chat to firestore (offline mode):", error);
            // Chat is already saved locally, so continue working
        }
      },

      addMessage: async (chatId, message, replaceLast = false) => {
        const { isGuest } = get();
        
        // Set loading state
        set({ isSendingMessage: true });
        
         // This is optimistic update for the UI
        set((state) => {
          if (!state.chats[chatId]) return state;
          const messages = state.chats[chatId].messages;
          const newMessages = replaceLast ? [...messages.slice(0, -1), message] : [...messages, message];
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

        // If user is logged in, try to persist to Firestore (but don't fail if offline)
        if (!isGuest) {
            const chatDocRef = doc(db as Firestore, 'chats', chatId);
            try {
              const chatDocSnap = await getDoc(chatDocRef);
              if (chatDocSnap.exists()) {
                const currentMessages = chatDocSnap.data().messages || [];
                const newMessages = replaceLast ? [...currentMessages.slice(0, -1), message] : [...currentMessages, message];
                await updateDoc(chatDocRef, { messages: newMessages });
              }
            } catch (e) {
                console.warn("Failed to save message to firestore (offline mode):", e);
                // Continue working in offline mode - the message is already in local state
            }
        }
        
        // Clear loading state
        set({ isSendingMessage: false });
      },
      setCurrentTab: (tabId) => set({ currentTab: tabId }),
      setShowUpgrade: (show) => set({ showUpgrade: show }),
      setIsDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
      clearGuestData: () => set({ chats: {}, currentTab: undefined }),
      
      resetChat: async (chatId) => {
        const { isGuest } = get();
        const chat = get().chats[chatId];
        if (!chat) return;

        // Keep only the welcome message
        const welcomeMessage = chat.messages.find(m => m.text.includes('Welcome to') && m.text.includes('Chat Guidelines'));
        const resetMessages = welcomeMessage ? [welcomeMessage] : [];

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
          chatName: chat.name,
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
        a.download = `${chat.name.replace(/[^a-z0-9]/gi, '_')}_chat_export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      deleteChat: async (chatId) => {
        const { isGuest, currentTab } = get();
        
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

// Initialize the auth listener when the app loads
useChatStore.getState().initializeAuthListener();

