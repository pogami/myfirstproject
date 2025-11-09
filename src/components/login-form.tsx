

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client-simple";
import { doc, setDoc, getDoc, writeBatch, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLogo } from "@/components/icons/google-logo";
import { Loader2, User } from "lucide-react";
import { useAnimatedToast } from "@/hooks/use-animated-toast";
import { ToastContainer } from "@/components/animated-toast";
import { CCLogo } from "@/components/icons/cc-logo";
import { useChatStore, Chat } from "@/hooks/use-chat-store";
import { GuestUsernamePopup } from "@/components/guest-username-popup";


interface LoginFormProps {
  initialState?: 'login' | 'signup';
}

export function LoginForm({ initialState = 'login' }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(initialState === 'signup');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showGuestUsernamePopup, setShowGuestUsernamePopup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast, toasts, removeToast } = useAnimatedToast();
  const { chats: guestChats, clearGuestData } = useChatStore();


  useEffect(() => {
    setIsMounted(true);
    setIsSigningUp(initialState === 'signup');
  }, [initialState]);

  const migrateGuestData = async (userId: string) => {
    try {
        const chatIds = Object.keys(guestChats);
        if (chatIds.length === 0) {
            return;
        }

        // Firestore batch limit is 500 operations, so we need to split into multiple batches
        const MAX_BATCH_SIZE = 500;
        const chatsToMigrate: Array<{ chatId: string; chat: Chat }> = [];
        
        // Check which chats need to be migrated (don't exist in Firestore yet)
        const checkPromises = chatIds.map(async (chatId) => {
            const chat = guestChats[chatId];
            const chatDocRef = doc(db, "chats", chatId);
            const chatDocSnap = await getDoc(chatDocRef);
            
            if (!chatDocSnap.exists()) {
                chatsToMigrate.push({ chatId, chat });
            }
        });
        
        await Promise.all(checkPromises);
        
        if (chatsToMigrate.length === 0) {
            console.log('No new chats to migrate');
            return;
        }
        
        // Process in batches of MAX_BATCH_SIZE - 1 (reserve 1 for user doc update)
        const batches: Array<Array<{ chatId: string; chat: Chat }>> = [];
        for (let i = 0; i < chatsToMigrate.length; i += MAX_BATCH_SIZE - 1) {
            batches.push(chatsToMigrate.slice(i, i + MAX_BATCH_SIZE - 1));
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // Process each batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batchChats = batches[batchIndex];
            const batch = writeBatch(db);
            
            for (const { chatId, chat } of batchChats) {
                try {
                    // Save ALL chat data including courseData, metadata, and other properties
                    const chatData: any = {
                        name: chat.name || chat.title, 
                        messages: chat.messages || [],
                        userId: userId,
                        createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString(),
                        updatedAt: chat.updatedAt ? new Date(chat.updatedAt).toISOString() : new Date().toISOString()
                    };
                    
                    // Include optional fields if they exist
                    if (chat.chatType) chatData.chatType = chat.chatType;
                    if (chat.classGroupId) chatData.classGroupId = chat.classGroupId;
                    if (chat.members) chatData.members = chat.members;
                    if (chat.courseData) {
                        // Save complete courseData including assignments, exams, and all course info
                        chatData.courseData = chat.courseData;
                    }
                    if (chat.metadata) {
                        // Save metadata including quizzes, study plans, topics covered
                        chatData.metadata = chat.metadata;
                    }
                    
                    const chatDocRef = doc(db, "chats", chatId);
                    batch.set(chatDocRef, chatData);
                } catch (error) {
                    console.warn(`Failed to prepare chat ${chatId} for migration:`, error);
                    errorCount++;
                }
            }
            
            // Update user doc with chat IDs (only in the last batch to avoid overwriting)
            if (batchIndex === batches.length - 1) {
                const userDocRef = doc(db, "users", userId);
                batch.set(userDocRef, { chats: chatIds }, { merge: true });
            }
            
            try {
                await batch.commit();
                successCount += batchChats.length;
                console.log(`✅ Migrated batch ${batchIndex + 1}/${batches.length} (${batchChats.length} chats)`);
            } catch (error: any) {
                // Check if it's a document size limit error
                if (error?.code === 'invalid-argument' || error?.message?.includes('size')) {
                    console.warn('⚠️ One or more chats may be too large for Firestore. Attempting to migrate messages in chunks...');
                    // Try to save with limited messages if document is too large
                    for (const { chatId, chat } of batchChats) {
                        try {
                            const limitedChatData: any = {
                                name: chat.name || chat.title,
                                messages: (chat.messages || []).slice(-500), // Keep last 500 messages
                                userId: userId,
                                createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString(),
                                updatedAt: chat.updatedAt ? new Date(chat.updatedAt).toISOString() : new Date().toISOString()
                            };
                            
                            if (chat.chatType) limitedChatData.chatType = chat.chatType;
                            if (chat.classGroupId) limitedChatData.classGroupId = chat.classGroupId;
                            if (chat.members) limitedChatData.members = chat.members;
                            if (chat.courseData) limitedChatData.courseData = chat.courseData;
                            if (chat.metadata) limitedChatData.metadata = chat.metadata;
                            
                            const limitedBatch = writeBatch(db);
                            const chatDocRef = doc(db, "chats", chatId);
                            limitedBatch.set(chatDocRef, limitedChatData);
                            await limitedBatch.commit();
                            successCount++;
                            console.log(`✅ Migrated chat ${chatId} with limited messages (last 500)`);
                        } catch (limitedError) {
                            console.error(`❌ Failed to migrate chat ${chatId} even with limited messages:`, limitedError);
                            errorCount++;
                        }
                    }
                } else {
                    console.error(`❌ Batch ${batchIndex + 1} migration failed:`, error);
                    errorCount += batchChats.length;
                }
            }
        }
        
        // Only clear guest data if migration was mostly successful
        if (successCount > 0) {
            clearGuestData();
            console.log(`✅ Guest data migration completed: ${successCount} chats migrated${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        } else {
            console.warn('⚠️ No chats were migrated successfully. Guest data preserved.');
        }
    } catch (error) {
        console.error('❌ Error migrating guest data:', error);
        // Don't throw error - let user continue to dashboard
        // Guest data will remain in localStorage for retry
    }
}


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let user;
      if (isSigningUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        
        // Set a default display name from email if not provided
        const defaultDisplayName = email.split('@')[0];
        await updateProfile(user, { displayName: defaultDisplayName });
        await setDoc(doc(db, "users", user.uid), {
            displayName: defaultDisplayName,
            email,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        }, { merge: true });

        toast({ title: "Account Created!", description: "You have been successfully signed up." });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        toast({ title: "Signed In!", description: "Welcome back." });
      }

      // Migrate guest data (non-blocking)
      migrateGuestData(user.uid).catch(error => {
        console.error('Guest data migration failed:', error);
      });
      
      // Clear guest data after successful account creation/sign-in
      if (isSigningUp) {
        // Clear guest user data from localStorage
        localStorage.removeItem('guestUser');
        localStorage.removeItem('guest-notifications');
        localStorage.removeItem('guest-onboarding-completed');
        
        // Store flag to show onboarding
        localStorage.setItem('showOnboarding', 'true');
        sessionStorage.setItem('justSignedUp', 'true');
        
        // Add a small delay to ensure localStorage is cleared before navigation
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        // For regular sign-in, clear guest data and navigate
        localStorage.removeItem('guestUser');
        localStorage.removeItem('guest-notifications');
        localStorage.removeItem('guest-onboarding-completed');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }

    } catch (error: any)
    {
      console.error('Account creation error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Account Creation Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes and parameters for better compatibility
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      console.log('🔍 Google Sign-in Debug Info:');
      console.log('Current domain:', window.location.hostname);
      console.log('Current port:', window.location.port);
      console.log('Full URL:', window.location.href);
      console.log('Firebase auth domain:', auth.app.options.authDomain);
      console.log('Firebase project ID:', auth.app.options.projectId);
      console.log('Attempting Google sign-in...');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if this is a new user and create their profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isNewUser = !userDoc.exists();
      
      if (isNewUser) {
        // New user - create profile with default values
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName || "Google User",
          email: user.email,
          graduationYear: "",
          school: "",
          major: "",
          provider: "google",
          createdAt: new Date().toISOString()
        });
        
        toast({ 
          title: "Welcome to CourseConnect!", 
          description: "Your Google account has been connected. Complete your profile in settings." 
        });
        
        // Store flags to show onboarding and welcome toast for new users
        localStorage.setItem('showOnboarding', 'true');
        sessionStorage.setItem('justSignedUp', 'true');
      } else {
        toast({ title: "Signed In!", description: "Welcome back." });
      }
      
      // Migrate guest data (non-blocking)
      migrateGuestData(user.uid).catch(error => {
        console.error('Guest data migration failed:', error);
      });
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        domain: window.location.hostname,
        port: window.location.port,
        fullUrl: window.location.href,
        stack: error?.stack
      });
      
      let description = "Could not sign in with Google. Please try again or use another method.";
      
      if (error?.code === 'auth/operation-not-allowed') {
        description = "Google sign-in is not enabled. Please enable it in your Firebase console's Authentication settings.";
      } else if (error?.code === 'auth/unauthorized-domain') {
        description = `This domain (${window.location.hostname}:${window.location.port}) is not authorized. Please add 'localhost' to authorized domains in Firebase Console → Authentication → Settings.`;
      } else if (error?.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with this email. Please sign in with the original method."
      } else if (error?.code === 'auth/popup-closed-by-user') {
        description = "Sign-in was cancelled. Please try again if you want to continue.";
      } else if (error?.code === 'auth/invalid-action' || error?.message?.includes('invalid_request')) {
        description = `Invalid action/request. Please check your OAuth configuration:
        1. Add 'localhost' to Firebase Console → Authentication → Settings → Authorized domains
        2. Add 'http://localhost:${window.location.port}' to Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized JavaScript origins
        3. Current URL: ${window.location.href}`;
      } else if (error?.message?.includes('redirect_uri_mismatch')) {
        description = `Redirect URI mismatch. Please add 'http://localhost:${window.location.port}/__/auth/handler' to Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs`;
      } else if (error?.code === 'auth/network-request-failed') {
        description = "Network error. Please check your internet connection and try again.";
      } else if (error?.code === 'auth/too-many-requests') {
        description = "Too many failed attempts. Please try again later.";
      } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        description = `404 Error: OAuth configuration issue. Please check:
        1. Firebase Console → Authentication → Settings → Authorized domains (add 'localhost')
        2. Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized JavaScript origins (add 'http://localhost:${window.location.port}')
        3. Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs (add 'http://localhost:${window.location.port}/__/auth/handler')
        4. Current URL: ${window.location.href}`;
      } else if (error?.code === 'auth/configuration-not-found') {
        description = "Firebase configuration not found. Please check your Firebase project settings.";
      } else if (error?.code === 'auth/invalid-api-key') {
        description = "Invalid Firebase API key. Please check your Firebase configuration.";
      } else if (error?.code === 'auth/app-not-authorized') {
        description = "Firebase app not authorized. Please check your Firebase project configuration.";
      }

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: `${description}\n\nError Code: ${error?.code || 'Unknown'}\nError Message: ${error?.message || 'No details available'}`,
      });
    } finally {
        setIsSubmittingGoogle(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: errorMessage,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };


  const handleGuestLogin = async () => {
    // Show username popup instead of directly logging in
    setShowGuestUsernamePopup(true);
  }

  const handleGuestUsernameSet = async (username: string) => {
    setIsSubmittingGuest(true);
    
    try {
      console.log("Starting guest login process with username:", username);
      
      // Create a simple guest user object with the chosen username
      const guestUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: username,
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true
      };

      console.log("Created guest user:", guestUser);

      // Store guest info in localStorage FIRST (before Firebase operations)
      try {
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
        console.log("Stored guest user in localStorage");
      } catch (storageError) {
        console.error("Failed to store guest user in localStorage:", storageError);
        throw new Error("Failed to save guest session. Please check your browser settings.");
      }

      // Sign in anonymously so Firestore rules recognize the session
      // Wrap in try-catch to handle Firebase initialization errors gracefully
      let anonCred = null;
      let anonUid = null;
      
      try {
        // Check if auth is available
        if (!auth) {
          throw new Error("Authentication service is not available. Please refresh the page.");
        }
        
        anonCred = await signInAnonymously(auth);
        anonUid = anonCred?.user?.uid;
        console.log("Anonymous sign-in successful:", anonUid);
      } catch (authError: any) {
        console.warn("Anonymous sign-in failed, continuing with guest mode:", authError);
        // Continue without Firebase auth - guest mode will work with localStorage only
        // This allows the app to work even if Firebase is having issues
      }

      // Create/update minimal user profile for anonymous user (non-blocking)
      if (anonUid && db) {
        try {
          await setDoc(doc(db, "users", anonUid), {
            displayName: username,
            isAnonymous: true,
            createdAt: new Date().toISOString()
          }, { merge: true });
          console.log("Guest user profile created in Firestore");
        } catch (e) {
          console.warn("Failed to write anonymous user profile (non-critical):", e);
          // Don't throw - this is not critical for guest mode
        }
      }

      // Show success message
      toast({ 
        title: `Welcome, ${username}!`, 
        description: "You're now exploring CourseConnect. Create an account anytime to save your progress.",
        variant: 'success'
      });
      
      console.log("Redirecting to dashboard...");
      
      // Small delay to ensure state is saved before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Guest login error:", error);
      setIsSubmittingGuest(false);
      toast({
        variant: "destructive",
        title: "Guest Login Failed",
        description: error.message || "Could not sign in as guest. Please try again or refresh the page.",
      });
    }
  }


  return (
      <div className="w-full max-w-md animate-in fade-in-50 zoom-in-95" suppressHydrationWarning>
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden" suppressHydrationWarning>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl delay-500"></div>
        </div>
        
        <Card className="relative shadow-2xl rounded-3xl border-2 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-sm border-white/20 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 dark:border-gray-800/20" suppressHydrationWarning>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
          
          <CardHeader className="relative text-center pb-4" suppressHydrationWarning>
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-30"></div>
                <div className="relative rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 border-2 border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
                  <CCLogo className="h-20 w-auto drop-shadow-lg" />
                </div>
              </div>
            </div>
            <CardTitle className="text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {isSigningUp ? "Join CourseConnect" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground font-medium">
              {isSigningUp ? "Start your academic journey with AI-powered tools" : "Sign in to continue your learning"}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 p-6 pt-2" suppressHydrationWarning>
            {/* Guest Login Button - Prominent for new users */}
            {isSigningUp && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg font-semibold border-2 border-dashed border-purple-300/50 hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" 
                  onClick={handleGuestLogin}
                  disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}
                >
                  {isSubmittingGuest ? (
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    <User className="mr-2 h-5 w-5" />
                  )}
                  Try as Guest - No Account Required
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Explore the platform without creating an account. You can always sign up later to save your progress.
                </p>
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                  <div className="px-3 text-xs uppercase text-muted-foreground">Or create an account</div>
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}
                  className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  {!isSigningUp && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200"
                      disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}
                  className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                />
              </div>
              
              
              <Button type="submit" className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" size="lg" disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (isSigningUp ? "Create Account" : "Sign In")}
              </Button>
            </form>
            <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <div className="px-3 text-xs uppercase text-muted-foreground">Or</div>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 border-gray-200/50 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:border-blue-400" size="lg" onClick={handleGoogleSignIn} disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmittingGoogle ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <GoogleLogo className="mr-3 h-6 w-6" />}
                Sign in with Google
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-center text-base text-gray-600 dark:text-gray-400">
                {isSigningUp ? (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setIsSigningUp(false)} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200" disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}>Sign In</button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => setIsSigningUp(true)} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200" disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}>Create one</button>
                  </>
                )}
              </p>
              

              {/* Guest login option for login mode */}
              {!isSigningUp && (
                <div className="text-center">
                  <button 
                    onClick={handleGuestLogin}
                    disabled={isSubmitting || isSubmittingGoogle || isSubmittingGuest}
                    className="text-sm text-gray-500 hover:text-purple-600 transition-colors duration-200 flex items-center gap-2 mx-auto font-medium"
                  >
                    {isSubmittingGuest ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    Try as Guest
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isResettingPassword}
                    className="h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword || !resetEmail}
                    className="flex-1"
                  >
                    {isResettingPassword ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : null}
                    Send Reset Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                    disabled={isResettingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Guest Username Popup */}
        <GuestUsernamePopup
          isOpen={showGuestUsernamePopup}
          onClose={() => setShowGuestUsernamePopup(false)}
          onUsernameSet={handleGuestUsernameSet}
        />

        {/* Animated Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
  );
}

