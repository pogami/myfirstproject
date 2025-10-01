

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, OAuthProvider, GoogleAuthProvider, signInWithPopup, updateProfile, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client-simple";
import { doc, setDoc, getDoc, writeBatch, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MicrosoftLogo } from "@/components/icons/microsoft-logo";
import { GoogleLogo } from "@/components/icons/google-logo";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { universities } from "@/lib/universities";
import { useChatStore, Chat } from "@/hooks/use-chat-store";


interface LoginFormProps {
  initialState?: 'login' | 'signup';
}

export function LoginForm({ initialState = 'login' }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingMicrosoft, setIsSubmittingMicrosoft] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(initialState === 'signup');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { chats: guestChats, clearGuestData } = useChatStore();


  useEffect(() => {
    setIsSigningUp(initialState === 'signup');
  }, [initialState]);

  const migrateGuestData = async (userId: string) => {
    try {
        if (Object.keys(guestChats).length > 0) {
            const batch = writeBatch(db);
            const chatIds = Object.keys(guestChats);

            for (const chatId of chatIds) {
                const chat = guestChats[chatId];
                const chatDocRef = doc(db, "chats", chatId);
                const chatDocSnap = await getDoc(chatDocRef);

                if (!chatDocSnap.exists()) {
                    batch.set(chatDocRef, { 
                        name: chat.name, 
                        messages: chat.messages,
                        userId: userId,
                        createdAt: new Date().toISOString()
                    });
                }
            }
            
            const userDocRef = doc(db, "users", userId);
            batch.set(userDocRef, { chats: chatIds }, { merge: true });
            
            await batch.commit();
            clearGuestData();
            console.log('Guest data migrated successfully');
        }
    } catch (error) {
        console.error('Error migrating guest data:', error);
        // Don't throw error - let user continue to dashboard
    }
}


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let user;
      if (isSigningUp) {
        if (!school || !major) {
            toast({
                variant: "destructive",
                title: "Validation Failed",
                description: "Please select your school and enter your major.",
            });
            setIsSubmitting(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        
        await updateProfile(user, { displayName });
        await setDoc(doc(db, "users", user.uid), {
            displayName,
            email,
            graduationYear,
            school,
            major,
        });

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
      
      // Check existing verification status
      checkVerificationStatus(user.uid);
      
      // For new signups, show onboarding slideshow
      if (isSigningUp) {
        // Store flag to show onboarding
        localStorage.setItem('showOnboarding', 'true');
      }
      
      // Navigate to dashboard
      router.push('/dashboard');

    } catch (error: any)
    {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message,
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
      console.log('Attempting Google sign-in...');
      console.log('Current domain:', window.location.hostname);
      console.log('Current port:', window.location.port);
      console.log('Full URL:', window.location.href);
      
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
        
        // Store flag to show onboarding for new users
        localStorage.setItem('showOnboarding', 'true');
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
        description: description,
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

  const handleMicrosoftSignIn = async () => {
    setIsSubmittingMicrosoft(true);
    const provider = new OAuthProvider('microsoft.com');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await migrateGuestData(user.uid);
      toast({ title: "Signed In!", description: "Welcome back." });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let description = "Could not sign in with Outlook. Please try again or use another method.";
      if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/unauthorized-domain') {
        description = "Sign-in with Microsoft is not enabled. Please enable it in your Firebase console's Authentication settings.";
      } else if (error?.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with this email. Please sign in with the original method."
      }

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: description,
      });
    } finally {
        setIsSubmittingMicrosoft(false);
    }
  }

  const handleGuestLogin = async () => {
    setIsSubmittingGuest(true);
    
    try {
      console.log("Starting guest login process...");
      
      // Create a simple guest user object
      const guestUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: "Guest User",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true
      };

      console.log("Created guest user:", guestUser);

      // Store guest info in localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      console.log("Stored guest user in localStorage");

      // Show success message
      toast({ 
        title: "Welcome, Guest!", 
        description: "You're now exploring CourseConnect. Create an account anytime to save your progress." 
      });
      
      console.log("Redirecting to dashboard...");
      
      // Immediate redirect for faster loading
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Guest login error:", error);
      toast({
        variant: "destructive",
        title: "Guest Login Failed",
        description: `Could not sign in as guest: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setIsSubmittingGuest(false);
    }
  }


  return (
      <div className="w-full max-w-md animate-in fade-in-50 zoom-in-95">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <Card className="relative shadow-2xl rounded-3xl border-2 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-sm border-white/20 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 dark:border-gray-800/20">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
          
          <CardHeader className="relative text-center pb-6">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 border-2 border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
                  <CourseConnectLogo className="h-16 w-16 text-primary drop-shadow-lg" />
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
          <CardContent className="relative space-y-6 p-8 pt-2">
            {/* Guest Login Button - Prominent for new users */}
            {isSigningUp && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg font-semibold border-2 border-dashed border-purple-300/50 hover:border-purple-400/70 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" 
                  onClick={handleGuestLogin}
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
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
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or create an account</span>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-5">
              {isSigningUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                      className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="school" className="text-sm font-semibold text-gray-700 dark:text-gray-300">School</Label>
                     <Select onValueChange={setSchool} value={school} required>
                        <SelectTrigger id="school" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest} className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400">
                            <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-gray-200/50 dark:bg-gray-800/95 dark:border-gray-700/50">
                            {universities.map(uni => (
                                <SelectItem key={uni} value={uni} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">{uni}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="major" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Major</Label>
                    <Input
                      id="major"
                      type="text"
                      placeholder="Computer Science"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                      className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="graduationYear" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="2025"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                      min="2020"
                      max="2035"
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                      className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
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
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
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
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                  className="h-12 border-2 border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-purple-400"
                />
              </div>
              
              
              <Button type="submit" className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" size="lg" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (isSigningUp ? "Create Account" : "Sign In")}
              </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 border-gray-200/50 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:border-blue-400" size="lg" onClick={handleGoogleSignIn} disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmittingGoogle ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <GoogleLogo className="mr-3 h-6 w-6" />}
                Sign in with Google
              </Button>
             <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 border-gray-200/50 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:border-blue-500" size="lg" onClick={handleMicrosoftSignIn} disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmittingMicrosoft ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <MicrosoftLogo className="mr-3 h-6 w-6" />}
                Sign in with Outlook
            </Button>
            </div>
            <div className="space-y-4">
              <p className="text-center text-base text-gray-600 dark:text-gray-400">
                {isSigningUp ? (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setIsSigningUp(false)} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>Sign In</button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => setIsSigningUp(true)} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>Create one</button>
                  </>
                )}
              </p>
              

              {/* Guest login option for login mode */}
              {!isSigningUp && (
                <div className="text-center">
                  <button 
                    onClick={handleGuestLogin}
                    disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
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
      </div>
  );
}

