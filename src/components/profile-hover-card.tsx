"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ProfileCard, ProfileData } from './profile-card';
import { cn } from '@/lib/utils';

interface ProfileHoverCardProps {
  profile: ProfileData;
  children: React.ReactNode;
  className?: string;
  onAction?: () => void;
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function ProfileHoverCard({ 
  profile, 
  children, 
  className, 
  onAction,
  delay = 300,
  placement = 'top'
}: ProfileHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const showCard = () => {
    console.log('ProfileHoverCard showCard called for:', profile.name);
    console.log('ProfileHoverCard container element:', containerRef.current);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log('ProfileHoverCard setting isVisible to true');
      setIsVisible(true);
    }, delay);
  };

  const hideCard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Add a small delay before hiding to allow moving to the card
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const updatePosition = () => {
    if (!containerRef.current || !cardRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = containerRect.left + containerRect.width / 2 - cardRect.width / 2;
        y = containerRect.top - cardRect.height - 5;
        break;
      case 'bottom':
        x = containerRect.left + containerRect.width / 2 - cardRect.width / 2;
        y = containerRect.bottom + 5;
        break;
      case 'left':
        x = containerRect.left - cardRect.width - 12;
        y = containerRect.top + containerRect.height / 2 - cardRect.height / 2;
        break;
      case 'right':
        x = containerRect.right + 12;
        y = containerRect.top + containerRect.height / 2 - cardRect.height / 2;
        break;
    }

    // Adjust for viewport boundaries
    if (x < 12) x = 12;
    if (x + cardRect.width > viewportWidth - 12) {
      x = viewportWidth - cardRect.width - 12;
    }
    if (y < 12) y = 12;
    if (y + cardRect.height > viewportHeight - 12) {
      y = viewportHeight - cardRect.height - 12;
    }

    setPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, placement]);

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    const handleResize = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={cn("inline-block relative", className)}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
        style={{ zIndex: 1 }}
        onMouseOver={() => console.log('Mouse over ProfileHoverCard container for:', profile.name)}
      >
        {children}
      </div>

      {/* Profile Card */}
      {isVisible && (
        <div
          ref={cardRef}
          className={cn(
            "fixed z-[9999] transition-none",
            isVisible 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-95 translate-y-2"
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={hideCard}
        >
          <ProfileCard 
            profile={profile} 
            onAction={onAction}
            className=""
          />
        </div>
      )}
    </>
  );
}

// Convenience components for different profile types
export function StudentProfileCard({ 
  student, 
  children, 
  ...props 
}: Omit<ProfileHoverCardProps, 'profile'> & { 
  student: Omit<ProfileData, 'role'> 
}) {
  return (
    <ProfileHoverCard 
      profile={{ ...student, role: 'student' }} 
      {...props}
    >
      {children}
    </ProfileHoverCard>
  );
}

export function InstructorProfileCard({ 
  instructor, 
  children, 
  ...props 
}: Omit<ProfileHoverCardProps, 'profile'> & { 
  instructor: Omit<ProfileData, 'role'> 
}) {
  return (
    <ProfileHoverCard 
      profile={{ ...instructor, role: 'instructor' }} 
      {...props}
    >
      {children}
    </ProfileHoverCard>
  );
}

export function AITutorProfileCard({ 
  aiTutor, 
  children, 
  ...props 
}: Omit<ProfileHoverCardProps, 'profile'> & { 
  aiTutor: Omit<ProfileData, 'role'> 
}) {
  return (
    <ProfileHoverCard 
      profile={{ ...aiTutor, role: 'ai-tutor' }} 
      {...props}
    >
      {children}
    </ProfileHoverCard>
  );
}
