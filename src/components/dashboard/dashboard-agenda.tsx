"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/hooks/use-chat-store';
import { Calendar, CheckCircle2, Clock, FileText, GraduationCap, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-simple';
import { useToast } from '@/hooks/use-toast';

export function DashboardAgenda() {
  const { chats } = useChatStore();
  const { toast } = useToast();
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  // Collect all items
  const allItems = React.useMemo(() => {
    const items: any[] = [];
    const now = new Date();

    Object.values(chats).forEach((chat: any) => {
      if (chat.chatType !== 'class' || !chat.courseData) return;
      const courseCode = chat.courseData.courseCode || chat.title;

      // Assignments
      (chat.courseData.assignments || []).forEach((a: any) => {
        if (!a?.dueDate || a?.dueDate === 'null' || a?.status === 'Completed') return;
        const d = new Date(a.dueDate);
        if (isNaN(d.getTime())) return;
        items.push({
          type: 'assignment',
          name: a.name,
          date: d,
          course: courseCode,
          chatId: chat.id,
          id: `${chat.id}-${a.name}`,
          status: a.status || 'Not Started'
        });
      });

      // Exams
      (chat.courseData.exams || []).forEach((e: any) => {
        if (!e?.date || e?.date === 'null') return;
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return;
        items.push({
          type: 'exam',
          name: e.name || 'Exam',
          date: d,
          course: courseCode,
          chatId: chat.id,
          id: `${chat.id}-${e.name}-exam`,
          status: 'Upcoming'
        });
      });
    });

    // Sort by date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [chats]);

  // Show only first 5 items in the card
  const items = allItems.slice(0, 5);

  // Function to mark assignment as complete
  const handleMarkComplete = async (item: any) => {
    if (item.type !== 'assignment') return;
    
    setMarkingComplete(item.id);
    try {
      const chatRef = doc(db, 'chats', item.chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        if (chatData.courseData?.assignments) {
          const updatedAssignments = chatData.courseData.assignments.map((assignment: any) => {
            if (assignment.name === item.name) {
              return { ...assignment, status: 'Completed' };
            }
            return assignment;
          });
          
          await updateDoc(chatRef, {
            'courseData.assignments': updatedAssignments
          });
          
          toast({
            title: "Assignment Completed!",
            description: `${item.name} has been marked as complete.`,
          });
        }
      }
    } catch (error) {
      console.error('Error marking assignment as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark assignment as complete.",
        variant: "destructive",
      });
    } finally {
      setMarkingComplete(null);
    }
  };

  if (allItems.length === 0) return null;

  return (
    <>
    <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200/70 dark:border-gray-800/70 shadow-xl hover:shadow-2xl transition-all rounded-3xl overflow-hidden mb-10">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Upcoming Agenda
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-gray-500 hover:text-blue-600"
            onClick={() => setShowAllDialog(true)}
          >
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const daysUntil = Math.ceil((item.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            let urgencyColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
            if (daysUntil <= 2) urgencyColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            else if (daysUntil <= 5) urgencyColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            else if (daysUntil <= 7) urgencyColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start gap-4 p-4 hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-all relative group ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center min-w-[3.5rem] p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-gray-500">
                    {item.date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                    {item.date.getDate()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${urgencyColor}`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} Days`}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                      {item.course}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {item.type === 'exam' ? (
                      <GraduationCap className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                    {item.name}
                  </h4>
                </div>

                {/* Action/Status */}
                <div className="self-center">
                  {item.type === 'assignment' ? (
                    <button
                      onClick={() => handleMarkComplete(item)}
                      disabled={markingComplete === item.id || item.status === 'Completed'}
                      className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 hover:border-green-500 hover:text-green-500 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mark Complete"
                    >
                      {markingComplete === item.id ? (
                        <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>

    {/* View All Dialog */}
    <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            All Upcoming Items
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {allItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No upcoming items found.
              </div>
            ) : (
              allItems.map((item, idx) => {
                const daysUntil = Math.ceil((item.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                let urgencyColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                if (daysUntil <= 2) urgencyColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                else if (daysUntil <= 5) urgencyColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                else if (daysUntil <= 7) urgencyColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-all border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[3.5rem] p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-gray-500">
                        {item.date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                        {item.date.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${urgencyColor}`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} Days`}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {item.course}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {item.type === 'exam' ? (
                          <GraduationCap className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                        {item.name}
                      </h4>
                    </div>

                    <div className="self-center">
                      {item.type === 'assignment' ? (
                        <button
                          onClick={() => handleMarkComplete(item)}
                          disabled={markingComplete === item.id || item.status === 'Completed'}
                          className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 hover:border-green-500 hover:text-green-500 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark Complete"
                        >
                          {markingComplete === item.id ? (
                            <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          )}
                        </button>
                      ) : (
                        <div className="h-8 w-8 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
}

