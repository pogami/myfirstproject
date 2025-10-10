"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, CheckCircle, XCircle } from 'lucide-react';

interface GuestUsernamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameSet: (username: string) => void;
}

// Basic profanity filter - you can expand this list
const PROFANITY_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell', 'crap', 'piss',
  'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut', 'bitch',
  'stupid', 'idiot', 'moron', 'dumb', 'loser', 'hate', 'kill', 'die'
];

// Reserved usernames
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'moderator', 'mod', 'staff', 'support',
  'system', 'bot', 'ai', 'courseconnect', 'guest', 'anonymous',
  'user', 'test', 'demo', 'example', 'null', 'undefined'
];

export function GuestUsernamePopup({ isOpen, onClose, onUsernameSet }: GuestUsernamePopupProps) {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [usedUsernames, setUsedUsernames] = useState<Set<string>>(new Set());

  // Load used usernames from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('usedGuestUsernames');
    if (stored) {
      try {
        const usernames = JSON.parse(stored);
        setUsedUsernames(new Set(usernames));
      } catch (error) {
        console.warn('Failed to load used usernames:', error);
      }
    }
  }, []);

  // Save used usernames to localStorage
  const saveUsedUsername = (username: string) => {
    const newUsedUsernames = new Set(usedUsernames);
    newUsedUsernames.add(username.toLowerCase());
    setUsedUsernames(newUsedUsernames);
    localStorage.setItem('usedGuestUsernames', JSON.stringify(Array.from(newUsedUsernames)));
  };

  // Validate username
  const validateUsername = (value: string): { isValid: boolean; error: string } => {
    const trimmed = value.trim();
    
    // Check length
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Username must be at least 2 characters long' };
    }
    
    if (trimmed.length > 20) {
      return { isValid: false, error: 'Username must be 20 characters or less' };
    }
    
    // Check for valid characters (letters, numbers, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }
    
    // Check for profanity
    const lowerValue = trimmed.toLowerCase();
    for (const word of PROFANITY_WORDS) {
      if (lowerValue.includes(word)) {
        return { isValid: false, error: 'Username contains inappropriate content' };
      }
    }
    
    // Check for reserved usernames
    if (RESERVED_USERNAMES.includes(lowerValue)) {
      return { isValid: false, error: 'This username is reserved' };
    }
    
    // Check for duplicates
    if (usedUsernames.has(lowerValue)) {
      return { isValid: false, error: 'This username is already taken' };
    }
    
    return { isValid: true, error: '' };
  };

  // Handle username input change
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Don't show validation errors while typing - only clear them
    if (error) {
      setError('');
      setIsValid(null);
    }
  };

  // Handle username input blur (when user stops typing)
  const handleUsernameBlur = () => {
    if (username.trim()) {
      const validation = validateUsername(username);
      setIsValid(validation.isValid);
      if (!validation.isValid) {
        setError(validation.error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setIsChecking(true);
    
    // Simulate a brief check (in real app, you might check against a server)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save the username as used
    saveUsedUsername(username.trim());
    
    // Set the username and close popup
    onUsernameSet(username.trim());
    onClose();
  };

  // Handle popup close
  const handleClose = () => {
    if (!isChecking) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Choose Your Username
          </DialogTitle>
          <DialogDescription>
            Enter a unique username to join the chat as a guest. This username will be visible to other users.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              onBlur={handleUsernameBlur}
              disabled={isChecking}
              className="w-full"
              maxLength={20}
            />
            
            {/* Validation indicator - only show after blur or submit */}
            {error && (
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            )}
            {isValid === true && !error && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Username is available</span>
              </div>
            )}
            
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isChecking}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!username.trim() || isValid !== true || isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Join Chat'
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Username must be 2-20 characters</p>
          <p>• Only letters, numbers, underscores, and hyphens allowed</p>
          <p>• No inappropriate content</p>
          <p>• Must be unique</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
