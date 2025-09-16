
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase/client";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Camera, Loader2, User, Mail, GraduationCap, Calendar, Bell, MessageSquare, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { universities } from "@/lib/universities";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthState } from "react-firebase-hooks/auth";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function ProfilePage() {
    const { toast } = useToast();
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [school, setSchool] = useState("");
    const [major, setMajor] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [profilePicture, setProfilePicture] = useState<string>("");
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState([
        {
            id: "chat",
            icon: <MessageSquare className="size-5 text-blue-500" />,
            title: "Chat Notifications",
            description: "New messages and mentions in study groups",
            enabled: true
        },
        {
            id: "assignments",
            icon: <Calendar className="size-5 text-green-500" />,
            title: "Assignment Reminders",
            description: "Deadlines and important dates",
            enabled: true
        },
        {
            id: "groups",
            icon: <User className="size-5 text-purple-500" />,
            title: "Study Group Updates",
            description: "New members and group activities",
            enabled: false
        }
    ]);

    useEffect(() => {
        if (loading) return; // Wait for auth to load
        if (!user) {
            router.push('/login');
            return;
        }
        
        const fetchUserData = async () => {
            setIsLoading(true);
            setDisplayName(user.displayName || "");
            setProfilePicture(user.photoURL || "");
            
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setSchool(userData.school || "");
                    setMajor(userData.major || "");
                    setGraduationYear(userData.graduationYear || "");
                    if (userData.profilePicture) {
                        setProfilePicture(userData.profilePicture);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your profile data.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();

    }, [user, loading, toast]);


    const getInitials = (name: string | null | undefined) => {
      if (!name) return "U";
      const parts = name.split(' ');
      if (parts.length > 1) {
          return parts[0][0] + parts[parts.length - 1][0];
      }
      return name[0];
    }

    const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const uploadWithTimeout = async (imageRef: any, file: File, timeoutMs: number = 30000): Promise<void> => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Upload timeout - please try again'));
            }, timeoutMs);

            uploadBytes(imageRef, file)
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch((error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    };

    const handleProfilePictureUpload = async (file: File) => {
        if (!user) {
            console.error("No user found");
            return;
        }
        
        console.log("Starting profile picture upload for user:", user.uid);
        console.log("Original file details:", { name: file.name, size: file.size, type: file.type });
        
        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus("Preparing image...");
        
        let compressedFile: File | null = null;
        
        try {
            // Show immediate preview
            const previewURL = URL.createObjectURL(file);
            setProfilePicture(previewURL);
            setUploadProgress(10);
            setUploadStatus("Showing preview...");
            
            // Compress the image
            console.log("Compressing image...");
            setUploadStatus("Compressing image...");
            compressedFile = await compressImage(file);
            setUploadProgress(30);
            console.log("Compressed file details:", { name: compressedFile.name, size: compressedFile.size, type: compressedFile.type });
            
            // Create a reference to the file in Firebase Storage
            const imageRef = ref(storage, `profile-pictures/${user.uid}`);
            console.log("Created storage reference:", imageRef.fullPath);
            setUploadProgress(40);
            setUploadStatus("Uploading to cloud...");
            
            // Try alternative path if main path fails
            let finalImageRef = imageRef;
            
            // Upload the compressed file
            console.log("Uploading compressed file...");
            setUploadStatus("Uploading to cloud...");
            
            let uploadAttempts = 0;
            const maxAttempts = 3;
            let uploadSuccess = false;
            
            while (uploadAttempts < maxAttempts && !uploadSuccess) {
                try {
                    uploadAttempts++;
                    console.log(`Upload attempt ${uploadAttempts}/${maxAttempts}`);
                    
                    if (uploadAttempts > 1) {
                        setUploadStatus(`Retrying upload... (${uploadAttempts}/${maxAttempts})`);
                        // Try alternative path on retry
                        finalImageRef = ref(storage, `users/${user.uid}/profile-picture`);
                        console.log("Trying alternative path:", finalImageRef.fullPath);
                    }
                    
                    await uploadWithTimeout(finalImageRef, compressedFile, 20000); // 20 second timeout
                    uploadSuccess = true;
                    console.log("File uploaded successfully");
                } catch (error) {
                    console.error(`Upload attempt ${uploadAttempts} failed:`, error);
                    
                    if (uploadAttempts >= maxAttempts) {
                        throw new Error(`Upload failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            setUploadProgress(70);
            
            // Get the download URL
            console.log("Getting download URL...");
            setUploadStatus("Finalizing...");
            const downloadURL = await getDownloadURL(finalImageRef);
            setUploadProgress(85);
            console.log("Download URL:", downloadURL);
            
            // Update the user's profile picture in Auth
            console.log("Updating Firebase Auth profile...");
            setUploadStatus("Updating profile...");
            await updateProfile(user, { photoURL: downloadURL });
            setUploadProgress(95);
            console.log("Firebase Auth profile updated");
            
            // Update the local state with the final URL
            setProfilePicture(downloadURL);
            
            // Update user data in Firestore
            console.log("Updating Firestore document...");
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                profilePicture: downloadURL,
            }, { merge: true });
            setUploadProgress(100);
            console.log("Firestore document updated");

            // Clean up the preview URL
            URL.revokeObjectURL(previewURL);

            toast({
                title: "Profile Picture Updated",
                description: "Your profile picture has been successfully updated.",
            });
        } catch (error) {
            console.error("Profile picture upload error:", error);
            
            // Fallback: Use data URL for immediate display
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataURL = e.target?.result as string;
                    setProfilePicture(dataURL);
                    
                    // Update Firestore with data URL (temporary solution)
                    const userDocRef = doc(db, "users", user.uid);
                    setDoc(userDocRef, {
                        profilePicture: dataURL,
                    }, { merge: true });
                };
                reader.readAsDataURL(compressedFile || file);
                
                toast({
                    title: "Profile Picture Updated (Local)",
                    description: "Your profile picture has been saved locally. Cloud sync will retry automatically.",
                });
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: `Could not upload your profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`,
                });
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus("");
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // Update displayName in Auth
            if (user.displayName !== displayName) {
                await updateProfile(user, { displayName });
            }

            // Update user data in Firestore
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                displayName,
                email: user.email,
                school,
                major,
                graduationYear,
                profilePicture,
            }, { merge: true });

            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            console.error("Profile update error:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update your profile. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNotificationSetting = (id: string) => {
        setNotificationSettings(prev => 
            prev.map(setting => 
                setting.id === id 
                    ? { ...setting, enabled: !setting.enabled }
                    : setting
            )
        );
        
        const setting = notificationSettings.find(s => s.id === id);
        toast({
            title: `${setting?.title} ${setting?.enabled ? 'Disabled' : 'Enabled'}`,
            description: `You will ${setting?.enabled ? 'no longer' : 'now'} receive ${setting?.title.toLowerCase()}.`,
        });
    };

    if (loading || isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-9 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-7 w-40" />
                                <Skeleton className="h-5 w-48" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                         <Skeleton className="h-11 w-32" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <User className="size-6 text-primary" />
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                Profile Settings
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Your Profile
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Manage your account details, academic information, and profile preferences. 
                            Keep your information up to date to connect with the right study groups.
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="size-5 text-primary" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal details and academic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 p-6 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-border/50">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={profilePicture || user?.photoURL || ''} alt={user?.displayName || ''} />
                                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                                        {getInitials(user?.displayName || user?.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        console.log("File input changed:", e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            console.log("File selected:", file.name);
                                            handleProfilePictureUpload(file);
                                        } else {
                                            console.log("No file selected");
                                        }
                                    }}
                                    className="hidden"
                                    id="profile-picture-upload"
                                    disabled={isUploading}
                                />
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    disabled={isUploading}
                                    onClick={() => {
                                        console.log("Camera button clicked");
                                        const fileInput = document.getElementById('profile-picture-upload') as HTMLInputElement;
                                        if (fileInput) {
                                            console.log("File input found, triggering click");
                                            fileInput.click();
                                        } else {
                                            console.log("File input not found");
                                        }
                                    }}
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4"/>
                                    )}
                                    <span className="sr-only">Change Photo</span>
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-foreground">{displayName || 'Student User'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="size-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">{user?.email}</p>
                                </div>
                                {isUploading && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-primary font-medium">{uploadStatus}</span>
                                            <span className="text-muted-foreground">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                                <Input 
                                    id="displayName" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your Name"
                                    disabled={isSaving}
                                    className="bg-background/50 border-border/50 focus:border-primary/50"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="school" className="text-sm font-medium flex items-center gap-2">
                                        <GraduationCap className="size-4 text-primary" />
                                        School
                                    </Label>
                                    <Select onValueChange={setSchool} value={school} disabled={isSaving}>
                                        <SelectTrigger id="school" className="bg-background/50 border-border/50 focus:border-primary/50">
                                            <SelectValue placeholder="Select your university" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map(uni => (
                                                <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="graduationYear" className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="size-4 text-primary" />
                                        Graduation Year
                                    </Label>
                                    <Input
                                        id="graduationYear"
                                        type="number"
                                        placeholder="2025"
                                        value={graduationYear}
                                        onChange={(e) => setGraduationYear(e.target.value)}
                                        min="2020"
                                        max="2035"
                                        disabled={isSaving}
                                        className="bg-background/50 border-border/50 focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="major" className="text-sm font-medium">Major</Label>
                                <Input
                                    id="major"
                                    type="text"
                                    placeholder="Computer Science"
                                    value={major}
                                    onChange={(e) => setMajor(e.target.value)}
                                    disabled={isSaving}
                                    className="bg-background/50 border-border/50 focus:border-primary/50"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <Input 
                                    id="email" 
                                    value={user?.email || ""} 
                                    disabled 
                                    className="bg-muted/30 border-border/50 text-muted-foreground"
                                />
                                <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 border-t border-border/50">
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 font-medium"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" /> 
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="size-5 text-primary" />
                            Notification Settings
                        </CardTitle>
                        <CardDescription>
                            Customize what notifications you receive
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {notificationSettings.map((type, index) => (
                                <div 
                                    key={type.id} 
                                    onClick={() => toggleNotificationSetting(type.id)}
                                    className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm border border-transparent hover:border-primary/20 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
                                            {type.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base">{type.title}</h3>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                    </div>
                                    <Badge variant={type.enabled ? "default" : "secondary"} className="px-3 py-1 text-xs font-medium">
                                        {type.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
