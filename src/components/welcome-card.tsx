"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Users, Brain, BookOpen, Sparkles, Zap } from "lucide-react";

interface WelcomeCardProps {
  chatType: 'general' | 'community';
  onDismiss?: () => void;
  onQuickAction?: (action: string) => void;
}

export function WelcomeCard({ chatType, onDismiss, onQuickAction }: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
  };

  const isGeneral = chatType === 'general';

  const quickActions = isGeneral ? [
    { icon: Brain, label: "Ask AI", action: "help me understand calculus" },
    { icon: BookOpen, label: "Study Help", action: "explain photosynthesis" },
    { icon: Sparkles, label: "Exam Prep", action: "best way to study for exams" }
  ] : [
    { icon: Users, label: "Say Hi", action: "Hello everyone!" },
    { icon: MessageSquare, label: "Ask Question", action: "Can someone help me with..." },
    { icon: Brain, label: "Get AI Help", action: "@ai help me with" }
  ];

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
              <div className={`p-1.5 rounded-md ${
                isGeneral 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isGeneral ? (
                  <Brain className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </div>
              <h3 className="text-sm font-semibold">
                {isGeneral ? "Welcome to General Chat! 👋" : "Welcome to Community Chat! 👥"}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3">
              {isGeneral 
                ? "I'm your personal AI assistant, ready to help with any academic questions."
                : "Connect with fellow students, share knowledge, and study together."
              }
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
              {isGeneral 
                ? "Or just type your question below!"
                : "Type @ai for AI help, or start chatting!"
              }
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
