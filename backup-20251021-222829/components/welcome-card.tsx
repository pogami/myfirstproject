"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Users, Brain, BookOpen, Sparkles, Zap, Calendar, Target, GraduationCap } from "lucide-react";

interface WelcomeCardProps {
  chatType: 'general' | 'community' | 'class';
  courseData?: {
    courseName?: string;
    courseCode?: string;
    professor?: string;
    university?: string;
    semester?: string;
    year?: string;
    department?: string;
    topics?: string[];
    assignments?: Array<{ name: string; dueDate?: string; description?: string }>;
    exams?: Array<{ name: string; date?: string; daysUntil?: number }>;
  };
  onDismiss?: () => void;
  onQuickAction?: (action: string) => void;
}

export function WelcomeCard({ chatType, courseData, onDismiss, onQuickAction }: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
  };

  const isGeneral = chatType === 'general';
  const isCommunity = chatType === 'community';
  const isClass = chatType === 'class';

  // Generate dynamic content based on chat type and course data
  const getWelcomeContent = () => {
    if (isClass && courseData) {
      const courseName = courseData.courseName || courseData.courseCode || 'this course';
      const professor = courseData.professor ? ` with ${courseData.professor}` : '';
      
      return {
        title: `Welcome to ${courseName}! 🎓`,
        description: `I'm your AI assistant for ${courseName}${professor}. I know your syllabus and can help with assignments, exams, and course topics.`,
        icon: GraduationCap,
        iconColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
      };
    } else if (isCommunity) {
      return {
        title: "Welcome to Community Chat! 👥",
        description: "Connect with fellow students, share knowledge, and study together.",
        icon: Users,
        iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      };
    } else {
      return {
        title: "Welcome to General Chat! 👋",
        description: "I'm your personal AI assistant, ready to help with any academic questions.",
        icon: Brain,
        iconColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      };
    }
  };

  const getQuickActions = () => {
    if (isClass && courseData) {
      const courseName = courseData.courseName || courseData.courseCode || 'this course';
      const topics = courseData.topics || [];
      const assignments = courseData.assignments || [];
      const exams = courseData.exams || [];
      
      // Generate course-specific actions
      const actions = [];
      
      // Study help with course context
      if (topics.length > 0) {
        actions.push({
          icon: BookOpen,
          label: "Study Help",
          action: `help me understand ${topics[0]} in ${courseName}`
        });
      } else {
        actions.push({
          icon: BookOpen,
          label: "Study Help",
          action: `help me study for ${courseName}`
        });
      }
      
      // Exam prep if there are exams
      if (exams.length > 0) {
        const nextExam = exams[0];
        actions.push({
          icon: Target,
          label: "Exam Prep",
          action: `help me prepare for ${nextExam.name} in ${courseName}`
        });
      } else {
        actions.push({
          icon: Target,
          label: "Exam Prep",
          action: `help me prepare for exams in ${courseName}`
        });
      }
      
      // Assignment help if there are assignments
      if (assignments.length > 0) {
        const nextAssignment = assignments[0];
        actions.push({
          icon: Calendar,
          label: "Assignment Help",
          action: `help me with ${nextAssignment.name} in ${courseName}`
        });
      } else {
        actions.push({
          icon: Brain,
          label: "Ask AI",
          action: `help me with ${courseName}`
        });
      }
      
      return actions;
    } else if (isCommunity) {
      return [
        { icon: Users, label: "Say Hi", action: "Hello everyone!" },
        { icon: MessageSquare, label: "Ask Question", action: "Can someone help me with..." },
        { icon: Brain, label: "Get AI Help", action: "@ai help me with" }
      ];
    } else {
      return [
        { icon: Brain, label: "Ask AI", action: "help me understand calculus" },
        { icon: BookOpen, label: "Study Help", action: "explain photosynthesis" },
        { icon: Sparkles, label: "Exam Prep", action: "best way to study for exams" }
      ];
    }
  };

  const welcomeContent = getWelcomeContent();
  const quickActions = getQuickActions();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-4"
        >
          <div className="relative bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border/30">
            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-md ${welcomeContent.iconColor}`}>
                <welcomeContent.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">
                {welcomeContent.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3">
              {welcomeContent.description}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="h-7 px-3 text-xs hover:bg-primary/10 hover:border-primary/20"
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Hint */}
            <p className="text-xs text-muted-foreground/70 mt-2">
              {isClass 
                ? "Or just type your question about this course below!"
                : isCommunity 
                ? "Type @ai for AI help, or start chatting!"
                : "Or just type your question below!"
              }
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
