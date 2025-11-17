
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, BookUser, MessageSquare, Users, Calendar, TrendingUp, ArrowRight, Sparkles, LogOut, Globe, Zap, UserPlus, Plus, FileText } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client-simple";
import { toast } from "sonner";
import { UnifiedLoadingAnimation } from "@/components/unified-loading-animation";

export default function ClassOverviewPage() {
    const { chats, setCurrentTab, deleteChat, addChat, joinPublicGeneralChat, subscribeToChat } = useChatStore();
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitioningTo, setTransitioningTo] = useState("");
    const [liveStats, setLiveStats] = useState({
        totalClasses: 0,
        upcomingExams: 0,
        totalMessages: 0,
        assignmentsDue: 0
    });
    const [recentJoins, setRecentJoins] = useState<Array<{name: string, time: string, class: string}>>([]);

    // Filter chats - exclude private-general-chat, only show General and user-uploaded classes
    const classChats = Object.entries(chats).filter(([key, chat]) => 
        key !== 'private-general-chat' && 
        key !== 'private-general-chat-guest' &&
        chat.chatType === 'class'
    );
    const publicChat = chats['public-general-chat'];

    // Calculate real-time stats from actual chat data
    useEffect(() => {
        const calculateRealStats = () => {
            // Total messages across all chats today
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const totalMessagesToday = Object.values(chats).reduce((total, chat) => {
                return total + (chat.messages || []).filter(msg => 
                    msg.timestamp && new Date(msg.timestamp) >= todayStart
                ).length;
            }, 0);

            // Count class chats
            const totalClasses = classChats.length;

            // Count upcoming exams (within next 30 days)
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            const now = new Date();
            
            let upcomingExams = 0;
            Object.values(chats).forEach(chat => {
                if (chat.chatType === 'class' && chat.courseData?.exams) {
                    chat.courseData.exams.forEach(exam => {
                        if (exam.date) {
                            const examDate = new Date(exam.date);
                            if (examDate >= now && examDate <= thirtyDaysFromNow) {
                                upcomingExams++;
                            }
                        }
                    });
                }
            });

            // Count assignments due (within next 7 days)
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            let assignmentsDue = 0;
            Object.values(chats).forEach(chat => {
                if (chat.chatType === 'class' && chat.courseData?.assignments) {
                    chat.courseData.assignments.forEach(assignment => {
                        if (assignment.dueDate) {
                            const dueDate = new Date(assignment.dueDate);
                            if (dueDate >= now && dueDate <= sevenDaysFromNow) {
                                assignmentsDue++;
                            }
                        }
                    });
                }
            });

            setLiveStats({
                totalClasses: totalClasses,
                upcomingExams: upcomingExams,
                totalMessages: totalMessagesToday,
                assignmentsDue: assignmentsDue
            });
        };

        calculateRealStats();
        const interval = setInterval(calculateRealStats, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [chats, classChats.length]);

    // Subscribe to public chat for real stats
    useEffect(() => {
        subscribeToChat('public-general-chat');
    }, [subscribeToChat]);

    const handleJoinPublicChat = async () => {
        try {
            await joinPublicGeneralChat();
            router.push('/dashboard/chat?tab=public-general-chat');
            toast({
                title: "Joined Public Chat",
                description: "You can now chat with everyone. Type @ai to call the AI.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to join public chat. Please try again.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        // Prefetch chat page to reduce navigation latency
        try { (router as any).prefetch?.('/dashboard/chat'); } catch {}
    }, [router]);

    const handleCardClick = (chatId: string, chatTitle: string) => {
        // Navigate immediately for snappy UX
        setCurrentTab(chatId);
        router.push('/dashboard/chat?tab=' + encodeURIComponent(chatId));
    }

    const handleLeaveClass = async (chatId: string, chatTitle: string, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        console.log('🔴 Leave button clicked:', { chatId, chatTitle });
        try {
            await deleteChat(chatId);
            console.log('✅ Chat deleted successfully');
            toast.error(`You left ${chatTitle}`, {
                description: "You have successfully left the class",
                duration: 3000,
            });
            // No redirect - stay on overview page
        } catch (error) {
            console.error('❌ Error deleting chat:', error);
            toast.error("Failed to leave class", {
                description: "Please try again",
                duration: 3000,
            });
        }
    }

    // Get clean display name for chat
    const getChatDisplayName = (chat: any, chatId: string) => {
        // If chat has a proper title, use it
        if (chat.title && !chat.title.includes('private-general-chat')) {
            return chat.title;
        }
        
        // If it's a class chat with course data, use course name
        if (chat.courseData?.courseName) {
            return chat.courseData.courseName;
        }
        
        // If it's the public general chat, show "Community"
        if (chatId === 'public-general-chat') {
            return 'Community';
        }
        
        // If it's private general chat, show "General"
        if (chatId === 'private-general-chat') {
            return 'General';
        }
        
        // Fallback to cleaned chat ID
        return chatId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Calculate real-time stats for each class
    const getRealTimeStats = (chat: any) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Messages today
        const messagesToday = (chat.messages || []).filter((msg: any) => 
            msg.timestamp && new Date(msg.timestamp) >= todayStart
        ).length;

        // Last active time and status
        const lastMessage = chat.messages?.[chat.messages.length - 1];
        let lastActive = '—';
        let status: 'active' | 'recent' | 'inactive' = 'inactive';
        let statusText = 'Inactive';
        let statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
        
        if (lastMessage?.timestamp) {
            const timeDiff = Date.now() - lastMessage.timestamp;
            if (timeDiff < 60000) {
                lastActive = 'just now';
                status = 'active';
                statusText = 'Active';
                statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            } else if (timeDiff < 3600000) {
                lastActive = `${Math.floor(timeDiff / 60000)}m ago`;
                status = 'active';
                statusText = 'Active';
                statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            } else if (timeDiff < 86400000) {
                lastActive = `${Math.floor(timeDiff / 3600000)}h ago`;
                status = 'recent';
                statusText = 'Recent';
                statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            } else if (timeDiff < 604800000) {
                lastActive = `${Math.floor(timeDiff / 86400000)}d ago`;
                status = 'recent';
                statusText = 'Recent';
                statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            } else {
                lastActive = `${Math.floor(timeDiff / 86400000)}d ago`;
                status = 'inactive';
                statusText = 'Inactive';
                statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
            }
        }

        // Calculate real students enrolled (use members array or count unique user IDs from messages)
        let studentsEnrolled = 1; // Default to 1 (at least the current user)
        
        if (chat.members && Array.isArray(chat.members)) {
            // Use actual members array if available
            studentsEnrolled = Math.max(chat.members.length, 1);
        } else {
            // Count unique user IDs from messages (excluding bot messages)
            const uniqueUserIds = new Set(
                (chat.messages || [])
                    .filter((msg: any) => msg.sender === 'user' && msg.userId)
                    .map((msg: any) => msg.userId)
            );
            // Also count unique senders who are users (for backward compatibility)
            const uniqueUserSenders = new Set(
                (chat.messages || [])
                    .filter((msg: any) => msg.sender === 'user')
                    .map((msg: any) => msg.userId || msg.name || msg.sender)
            );
            studentsEnrolled = Math.max(uniqueUserIds.size || uniqueUserSenders.size, 1);
        }

        return {
            students: studentsEnrolled,
            activity: messagesToday,
            lastActive: lastActive,
            status: status,
            statusText: statusText,
            statusClass: statusClass
        };
    };

    return (
        <div className="min-h-screen bg-transparent">
            {/* Transition Loader */}
            {isTransitioning && (
                <UnifiedLoadingAnimation 
                    mode="transition"
                    fromPage="Dashboard" 
                    toPage={transitioningTo}
                />
            )}
            <div className="space-y-8 animate-in fade-in-50">
                {/* Hero Section - Mobile Optimized */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 md:p-8 border border-primary/20">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10">
                                <BookUser className="size-5 sm:size-6 text-primary" />
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                                {classChats.length} Active Classes
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Class Overview
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
                            Upload your syllabi to create AI-powered class chats. Get personalized help, 
                            track assignments, and access course-specific study tools.
                        </p>
                    </div>
                </div>

                {/* Live Stats Overview - Real-time Updates */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/10">
                                    <BookUser className="size-4 sm:size-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-indigo-600">{liveStats.totalClasses}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Your Classes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                                    <Calendar className="size-4 sm:size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{liveStats.upcomingExams}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Upcoming Exams</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                                    <MessageSquare className="size-4 sm:size-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{liveStats.totalMessages}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Messages Today</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
                                    <FileText className="size-4 sm:size-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{liveStats.assignmentsDue}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Due This Week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Removed Live Activity feed per request */}

                {/* Classes Grid */}
                {classChats.length > 0 ? (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">Click to Join</Badge>
                                <p className="text-xs text-muted-foreground hidden sm:block">Click any class card to open its chat</p>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {classChats.map(([id, chat]) => {
                                const stats = getRealTimeStats(chat);
                                return (
                                    <Card 
                                        key={id} 
                                        onClick={() => handleCardClick(id, chat.title)}
                                        className="group cursor-pointer border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-card/80"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                                                        <BookUser className="size-6 text-primary"/>
                                                    </div>
                                                    <div className="flex-1">
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                        {getChatDisplayName(chat, id)}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {stats.students} students enrolled
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className={stats.statusClass}>
                                                    {stats.statusText}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Messages</span>
                                                    </div>
                                                    <span className="font-medium">{chat.messages.length}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Messages Today</span>
                                                    </div>
                                                    <span className="font-medium">{stats.activity}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Last active</span>
                                                    </div>
                                                    <span className="font-medium">{stats.lastActive}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-border/50">
                                                <div className="flex gap-2">
                                                    <Button 
                                                        className="flex-1 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md font-medium" 
                                                        variant="outline"
                                                        onClick={() => handleCardClick(id, getChatDisplayName(chat, id))}
                                                    >
                                                        Join Chat
                                                        <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                                    </Button>
                                                    <Button 
                                                        className="bg-gradient-to-r from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/30 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md font-medium" 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => handleLeaveClass(id, getChatDisplayName(chat, id), e)}
                                                    >
                                                        <LogOut className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <Card className="border-0 bg-gradient-to-br from-card to-card/50">
                        <CardContent className="py-16">
                            <div className="text-center space-y-6">
                                <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit mx-auto border border-primary/20">
                                    <BookUser className="size-16 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">No Classes Found</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Get started by uploading your first syllabus to discover and join study groups for your classes.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 font-medium">
                                        <Link href="/dashboard/upload">
                                            <Upload className="mr-2 h-5 w-5" />
                                            Upload Syllabus
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="bg-gradient-to-r from-background to-background/80 hover:from-primary/5 hover:to-primary/10 text-foreground border-border hover:border-primary/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md font-medium">
                                        <Link href="/dashboard/chat">
                                            <MessageSquare className="mr-2 h-5 w-5" />
                                            Browse General Chat
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Call to Action */}
                {classChats.length > 0 && (
                    <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                        <CardContent className="p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Plus className="size-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Want to Add More Classes?</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Upload additional syllabi to create course-specific AI chats, track assignments and exams, and get personalized study help for each class.
                            </p>
                            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                <Link href="/dashboard/upload">
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload Another Syllabus
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
