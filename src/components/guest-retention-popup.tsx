'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, Target, Award, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GuestRetentionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  guestData?: {
    chatsCount: number;
    studyTime: number;
    assignmentsCompleted: number;
    streak: number;
  };
}

export function GuestRetentionPopup({ isOpen, onClose, onSignUp, guestData }: GuestRetentionPopupProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleSignUp = () => {
    setIsLeaving(true);
    onSignUp();
    // Redirect to sign up page
    router.push('/auth?mode=signup');
  };

  const handleContinueAsGuest = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Save Your Progress! 🎓
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            You've made great progress! Sign up to keep all your data safe and accessible across devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Summary */}
          {guestData && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Progress:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {guestData.chatsCount} Classes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {Math.floor(guestData.studyTime / 60)}h {guestData.studyTime % 60}m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {guestData.assignmentsCompleted} Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {guestData.streak} Day Streak
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Sign up to:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Keep all your chats and progress forever</li>
              <li>• Access your data from any device</li>
              <li>• Get personalized study recommendations</li>
              <li>• Track your learning journey over time</li>
              <li>• Join study groups and connect with classmates</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              disabled={isLeaving}
            >
              {isLeaving ? 'Redirecting...' : 'Sign Up & Save Progress'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleContinueAsGuest}
              className="w-full text-gray-600 dark:text-gray-400"
            >
              Continue as Guest (Data may be lost)
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            Your data will be safely migrated when you sign up
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
