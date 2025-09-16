

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, OAuthProvider, GoogleAuthProvider, signInWithPopup, updateProfile, signInAnonymously } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc, getDoc, writeBatch } from "firebase/firestore";
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
  const router = useRouter();
  const { toast } = useToast();
  const { chats: guestChats, clearGuestData } = useChatStore();

  useEffect(() => {
    setIsSigningUp(initialState === 'signup');
  }, [initialState]);

  const migrateGuestData = async (userId: string) => {
    if (Object.keys(guestChats).length > 0) {
        const batch = writeBatch(db);
        const chatIds = Object.keys(guestChats);

        for (const chatId of chatIds) {
            const chat = guestChats[chatId];
            const chatDocRef = doc(db, "chats", chatId);
            const chatDocSnap = await getDoc(chatDocRef);

            if (!chatDocSnap.exists()) {
                 batch.set(chatDocRef, { name: chat.name, messages: chat.messages });
            }
        }
        
        const userDocRef = doc(db, "users", userId);
        batch.set(userDocRef, { chats: chatIds }, { merge: true });
        
        await batch.commit();
        clearGuestData();
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

      await migrateGuestData(user.uid);
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
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if this is a new user and create their profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
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
      } else {
        toast({ title: "Signed In!", description: "Welcome back." });
      }
      
      await migrateGuestData(user.uid);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        domain: window.location.hostname,
        port: window.location.port,
        fullUrl: window.location.href
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
      }

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: description,
      });
    } finally {
        setIsSubmittingGoogle(false);
    }
  }

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
      
      // Small delay to ensure toast shows
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
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
        <Card className="shadow-2xl rounded-3xl border-2">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 border-2 border-primary/20">
                <CourseConnectLogo className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold tracking-tight">
              {isSigningUp ? "Create an Account" : "Welcome to CourseConnect"}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {isSigningUp ? "Join to access your personalized dashboard." : "Sign in to continue."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-2">
            {/* Guest Login Button - Prominent for new users */}
            {isSigningUp && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-semibold border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" 
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
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isSigningUp && (
                <>
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                    />
                  </div>
                   <div>
                    <Label htmlFor="school">School</Label>
                     <Select onValueChange={setSchool} value={school} required>
                        <SelectTrigger id="school" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                            <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                            {universities.map(uni => (
                                <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div>
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      type="text"
                      placeholder="Computer Science"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required
                      disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                    />
                  </div>
                   <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
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
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : (isSigningUp ? "Create Account" : "Sign In")}
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
            <div className="space-y-3">
              <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmittingGoogle ? <Loader2 className="animate-spin" /> : <GoogleLogo className="mr-2 h-5 w-5" />}
                Sign in with Google
              </Button>
             <Button variant="outline" className="w-full" size="lg" onClick={handleMicrosoftSignIn} disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>
                {isSubmittingMicrosoft ? <Loader2 className="animate-spin" /> : <MicrosoftLogo className="mr-2 h-5 w-5" />}
                Sign in with Outlook
            </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              {isSigningUp ? (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setIsSigningUp(false)} className="font-semibold text-primary hover:underline" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>Sign In</button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setIsSigningUp(true)} className="font-semibold text-primary hover:underline" disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}>Create one</button>
                </>
              )}
            </p>
            
            {/* Guest login option for login mode */}
            {!isSigningUp && (
              <div className="text-center">
                <button 
                  onClick={handleGuestLogin}
                  disabled={isSubmitting || isSubmittingMicrosoft || isSubmittingGoogle || isSubmittingGuest}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 mx-auto"
                >
                  {isSubmittingGuest ? (
                    <Loader2 className="animate-spin h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  Try as Guest
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

