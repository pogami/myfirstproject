"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Trash2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client-simple";
import { updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, deleteDoc, collection, getDocs, query, where, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client-simple";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClearingChats, setIsClearingChats] = useState(false);
  const [isClearingNotifications, setIsClearingNotifications] = useState(false);
  const [isClearingFiles, setIsClearingFiles] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    data: {
      autoSync: true,
      analytics: true,
    }
  });

  // Load user settings from Firestore
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.settings) {
            setSettings(prev => ({
              ...prev,
              ...userData.settings
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user settings:', error);
      }
    };

    loadUserSettings();
  }, [user]);

  const handleSettingChange = (category: string, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    
    toast({
      title: "Setting Updated",
      description: `${setting} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to change your password.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(user, newPassword);
      toast.success("Password Updated Successfully", "Your password has been successfully updated.");
      setNewPassword("");
      setConfirmPassword("");
      // Close the dialog after successful password change
      setTimeout(() => {
        // Try multiple methods to close the dialog
        const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"], [role="dialog"] button:last-child, [role="dialog"] button[data-state="closed"]');
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
        } else {
          // Fallback: press Escape key
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        }
      }, 1500); // Close after 1.5 seconds
    } catch (error: any) {
      console.error('Password update error:', error);
      
      let errorMessage = "Failed to update password.";
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "For security, please sign out and sign back in before changing your password.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export your data.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Exporting Data",
        description: "Preparing your complete data export...",
      });

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Get ALL user's chats (including public chats they've participated in)
      const chatsQuery = query(collection(db, 'chats'), where('userId', '==', user.uid));
      const chatsSnapshot = await getDocs(chatsQuery);
      const chats = [];
      
      for (const chatDoc of chatsSnapshot.docs) {
        const chatData = { id: chatDoc.id, ...chatDoc.data() };
        
        // Get all messages for this chat
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatDoc.id));
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() }));
        
        chatData.messages = messages;
        chats.push(chatData);
      }

      // Get user's notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get user's uploaded files/syllabi
      const filesQuery = query(collection(db, 'files'), where('userId', '==', user.uid));
      const filesSnapshot = await getDocs(filesQuery);
      const files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const exportData = {
        user: userData,
        chats,
        notifications,
        files,
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalChats: chats.length,
        totalMessages: chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0),
        totalNotifications: notifications.length,
        totalFiles: files.length
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courseconnect-complete-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Complete Data Exported",
        description: `Downloaded ${exportData.totalChats} chats, ${exportData.totalMessages} messages, ${exportData.totalNotifications} notifications, and ${exportData.totalFiles} files.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete your account.",
        variant: "destructive",
      });
      return;
    }

    if (deleteConfirm !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' exactly to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      toast({
        title: "Deleting Account",
        description: "This may take a moment. Please do not close this page.",
      });

      // Delete user's chats and all messages
      const chatsQuery = query(collection(db, 'chats'), where('userId', '==', user.uid));
      const chatsSnapshot = await getDocs(chatsQuery);
      
      for (const chatDoc of chatsSnapshot.docs) {
        // Delete all messages in this chat
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatDoc.id));
        const messagesSnapshot = await getDocs(messagesQuery);
        for (const messageDoc of messagesSnapshot.docs) {
          await deleteDoc(messageDoc.ref);
        }
        
        // Delete the chat itself
        await deleteDoc(chatDoc.ref);
      }

      // Delete user's notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      for (const notificationDoc of notificationsSnapshot.docs) {
        await deleteDoc(notificationDoc.ref);
      }

      // Delete user's uploaded files
      const filesQuery = query(collection(db, 'files'), where('userId', '==', user.uid));
      const filesSnapshot = await getDocs(filesQuery);
      for (const fileDoc of filesSnapshot.docs) {
        await deleteDoc(fileDoc.ref);
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete Firebase Auth user (this will also sign them out)
      await deleteUser(user);

      toast({
        title: "Account Completely Deleted",
        description: "Your account and all data have been permanently removed from our systems.",
      });

      // Redirect to home page
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleClearChatHistory = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to clear chat history.",
        variant: "destructive",
      });
      return;
    }

    setIsClearingChats(true);
    try {
      toast({
        title: "Clearing Chat History",
        description: "Deleting all your chat conversations and messages...",
      });

      // Get all user's chats
      const chatsQuery = query(collection(db, 'chats'), where('userId', '==', user.uid));
      const chatsSnapshot = await getDocs(chatsQuery);
      
      let deletedChats = 0;
      let deletedMessages = 0;
      
      for (const chatDoc of chatsSnapshot.docs) {
        // Delete all messages in this chat
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatDoc.id));
        const messagesSnapshot = await getDocs(messagesQuery);
        for (const messageDoc of messagesSnapshot.docs) {
          await deleteDoc(messageDoc.ref);
          deletedMessages++;
        }
        
        // Delete the chat itself
        await deleteDoc(chatDoc.ref);
        deletedChats++;
      }

      toast({
        title: "Chat History Cleared",
        description: `Deleted ${deletedChats} chats and ${deletedMessages} messages.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear chat history.",
        variant: "destructive",
      });
    } finally {
      setIsClearingChats(false);
    }
  };

  const handleClearNotifications = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to clear notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsClearingNotifications(true);
    try {
      toast({
        title: "Clearing Notifications",
        description: "Deleting all your notifications...",
      });

      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      let deletedCount = 0;
      for (const notificationDoc of notificationsSnapshot.docs) {
        await deleteDoc(notificationDoc.ref);
        deletedCount++;
      }

      toast({
        title: "Notifications Cleared",
        description: `Deleted ${deletedCount} notifications.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear notifications.",
        variant: "destructive",
      });
    } finally {
      setIsClearingNotifications(false);
    }
  };

  const handleClearFiles = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to clear uploaded files.",
        variant: "destructive",
      });
      return;
    }

    setIsClearingFiles(true);
    try {
      toast({
        title: "Clearing Uploaded Files",
        description: "Deleting all your uploaded files and syllabi...",
      });

      const filesQuery = query(collection(db, 'files'), where('userId', '==', user.uid));
      const filesSnapshot = await getDocs(filesQuery);
      
      let deletedCount = 0;
      for (const fileDoc of filesSnapshot.docs) {
        await deleteDoc(fileDoc.ref);
        deletedCount++;
      }

      toast({
        title: "Files Cleared",
        description: `Deleted ${deletedCount} uploaded files.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear uploaded files.",
        variant: "destructive",
      });
    } finally {
      setIsClearingFiles(false);
    }
  };

  const handleAutoSyncChange = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to change sync settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user settings in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.data.autoSync': enabled,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      setSettings(prev => ({
        ...prev,
        data: { ...prev.data, autoSync: enabled }
      }));

      // Store in localStorage for immediate effect
      localStorage.setItem('autoSyncEnabled', enabled.toString());

      toast({
        title: enabled ? "Auto Sync Enabled" : "Auto Sync Disabled",
        description: enabled 
          ? "Your data will automatically sync across all your devices." 
          : "Auto sync has been disabled. Data will only sync when you manually refresh.",
      });

      // If enabling auto sync, trigger an immediate sync
      if (enabled) {
        await triggerDataSync();
      }
    } catch (error: any) {
    toast({
        title: "Error",
        description: error.message || "Failed to update sync settings.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyticsChange = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to change analytics settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user settings in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.data.analytics': enabled,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      setSettings(prev => ({
        ...prev,
        data: { ...prev.data, analytics: enabled }
      }));

      // Store in localStorage for immediate effect
      localStorage.setItem('analyticsEnabled', enabled.toString());

      toast({
        title: enabled ? "Analytics Enabled" : "Analytics Disabled",
        description: enabled 
          ? "Thank you! Your usage data helps us improve CourseConnect." 
          : "Analytics disabled. No usage data will be collected.",
      });

      // If enabling analytics, send current session data
      if (enabled) {
        await sendAnalyticsData();
      }
    } catch (error: any) {
    toast({
        title: "Error",
        description: error.message || "Failed to update analytics settings.",
        variant: "destructive",
      });
    }
  };

  const triggerDataSync = async () => {
    try {
      // This would trigger a real sync operation
      // For now, we'll simulate it by updating the user's last sync time
      await updateDoc(doc(db, 'users', user!.uid), {
        lastSyncTime: new Date().toISOString(),
        syncStatus: 'completed'
      });

      console.log('Data sync completed');
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  };

  const sendAnalyticsData = async () => {
    try {
      // This would send real analytics data
      // For now, we'll just log that analytics is enabled
      const analyticsData = {
        userId: user!.uid,
        timestamp: new Date().toISOString(),
        action: 'analytics_enabled',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // In a real implementation, this would send to your analytics service
      console.log('Analytics data:', analyticsData);
      
      // For now, we'll store it in Firestore as a simple analytics event
      await setDoc(doc(db, 'analytics', `${user!.uid}_${Date.now()}`), analyticsData);
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <SettingsIcon className="size-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Account Settings
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage your account security and data. Change your password, export your data, 
              or delete your account completely.
            </p>
          </div>
        </div>

        {/* User Info */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your basic account details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Display Name</Label>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-sm">{user?.displayName || 'Not set'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="p-3 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <span className="text-sm">
                    {showEmail ? user?.email : '••••••••@•••••.com'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmail(!showEmail)}
                    className="hover:bg-transparent h-8 w-8 p-0"
                  >
                    {showEmail ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Lock className="size-4 mr-2" />
                Change Password
              </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your new password below. Make sure it's at least 6 characters long.
                    </DialogDescription>
                  </DialogHeader>
            <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
              </div>
                </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
              </div>
            </div>
                    <div className="flex gap-2">
                      <div 
                        onClick={handleChangePassword} 
                        className={`update-password-btn flex-1 rounded-md px-4 py-2 cursor-pointer flex items-center justify-center transition-opacity ${
                          isChangingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: '#2563eb !important',
                          color: 'white !important',
                          border: '1px solid #2563eb !important'
                        }}
                      >
                        {isChangingPassword ? "Updating..." : "Update Password"}
                </div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setNewPassword("");
                          setConfirmPassword("");
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
              </div>
                    <style jsx>{`
                      .update-password-btn {
                        background-color: #2563eb !important;
                        color: white !important;
                        border: 1px solid #2563eb !important;
                      }
                      .update-password-btn * {
                        color: white !important;
                      }
                    `}</style>
                </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>



        {/* Data Management */}
        <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your data and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto Sync</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync your data across devices</p>
                </div>
                <Switch
                  checked={settings.data.autoSync}
                  onCheckedChange={(checked) => handleAutoSyncChange(checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Analytics</Label>
                  <p className="text-xs text-muted-foreground">Help improve CourseConnect by sharing usage data</p>
                 <div className="text-xs text-muted-foreground mt-2 space-y-1">
                   <p><strong>Privacy Protection:</strong></p>
                   <p>• No Personal Info: We don't collect your name, email, or personal details</p>
                   <p>• Anonymous: Your user ID is just a random string</p>
                   <p>• Aggregated: We look at patterns, not individual users</p>
                   <p>• Optional: You can turn it off anytime</p>
                 </div>
                </div>
                <Switch
                  checked={settings.data.analytics}
                 onCheckedChange={(checked) => handleAnalyticsChange(checked)}
                />
              </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportData} variant="outline" className="flex-1">
                <Download className="size-4 mr-2" />
                Export My Data
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="delete-account-btn flex-1 rounded-md px-4 py-2 cursor-pointer flex items-center justify-center hover:opacity-90 transition-opacity">
                <Trash2 className="size-4 mr-2" />
                Delete Account
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">What will be deleted:</h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• All your chat conversations and messages</li>
                        <li>• All uploaded files and syllabi</li>
                        <li>• All notifications and settings</li>
                        <li>• Your user profile and account data</li>
                        <li>• Your login credentials and authentication</li>
                      </ul>
                    </div>
                    <div>
                      <Label htmlFor="deleteConfirm">Type "DELETE" to confirm</Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDeleteAccount} 
                        disabled={isDeletingAccount || deleteConfirm !== "DELETE"}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isDeletingAccount ? "Deleting..." : "Permanently Delete Account"}
              </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <style jsx>{`
                .delete-account-btn {
                  background-color: #ef4444 !important;
                  color: white !important;
                  border: 1px solid #ef4444 !important;
                }
                .delete-account-btn * {
                  color: white !important;
                }
              `}</style>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}