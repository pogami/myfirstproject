
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, BookUser, MessageSquare, Users, Calendar, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import React from 'react';
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";

export default function ClassOverviewPage() {
    const { chats, setCurrentTab } = useChatStore();
    const router = useRouter();
    const [user] = useAuthState(auth);

    const classChats = Object.entries(chats).filter(([key]) => key !== 'general-chat');

    const handleCardClick = (chatId: string) => {
        setCurrentTab(chatId);
        router.push('/dashboard/chat');
    }

    const getRandomStats = () => ({
        students: Math.floor(Math.random() * 50) + 10,
        activity: Math.floor(Math.random() * 20) + 5,
        lastActive: Math.floor(Math.random() * 24) + 1
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
                            Browse all your classes, see activity levels, and connect with classmates. 
                            Join study groups and collaborate on assignments.
                        </p>
                    </div>
                </div>

                {/* Stats Overview - Mobile Optimized */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                                    <BookUser className="size-4 sm:size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{classChats.length}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Total Classes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                                    <MessageSquare className="size-4 sm:size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                                        {classChats.reduce((sum, [, chat]) => sum + chat.messages.length, 0)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Total Messages</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                                    <TrendingUp className="size-4 sm:size-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600">Active</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Study Groups</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classes Grid */}
                {classChats.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
                            <Badge variant="outline" className="text-xs">Click to Join</Badge>
                        </div>
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {classChats.map(([id, chat]) => {
                                const stats = getRandomStats();
                                return (
                                    <Card 
                                        key={id} 
                                        onClick={() => handleCardClick(id)}
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
                                                            {chat.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {stats.students} students enrolled
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    Active
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
                                                        <Users className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Activity</span>
                                                    </div>
                                                    <span className="font-medium">{stats.activity} today</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Last active</span>
                                                    </div>
                                                    <span className="font-medium">{stats.lastActive}h ago</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-border/50">
                                                <Button 
                                                    className="w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md font-medium" 
                                                    variant="outline"
                                                >
                                                    Join Study Group
                                                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                                </Button>
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
                                    <Sparkles className="size-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Want to Add More Classes?</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Upload additional syllabi to discover more study groups and connect with more classmates.
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
