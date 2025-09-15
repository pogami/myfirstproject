
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap } from 'lucide-react';
import { useChatStore } from '@/hooks/use-chat-store';

export function StatCards() {
    const [user] = useAuthState(auth);
    const { chats } = useChatStore();
    
    const yourClassesCount = Object.keys(chats).filter(c => c !== 'general-chat').length;
    
    const statCards = [
        { title: "Your Classes", value: yourClassesCount, icon: <GraduationCap className="text-primary" />, loading: !user },
    ];

    if (!user) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-8 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {statCards.map(card => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <div className="h-6 w-6">{card.icon}</div>
                    </CardHeader>
                    <CardContent>
                        {card.loading ? (
                            <Skeleton className="h-8 w-12" />
                        ): (
                            <div className="text-2xl font-bold">{card.value ?? 0}</div>
                        )}
                    </CardContent>
                </Card>
            ))}
      </div>
    )
}
