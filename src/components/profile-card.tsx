"use client";

import React from 'react';
import { Star, BookOpen, GraduationCap, DollarSign, Clock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileData {
  id: string;
  name: string;
  role: 'student' | 'instructor' | 'ai-tutor';
  avatar?: string;
  school?: string;
  major?: string;
  year?: string;
  subjects?: string[];
  skills?: string[];
  coursesCreated?: number;
  rating?: number;
  hourlyRate?: number;
  earnings?: number;
  bio?: string;
  capabilities?: string[];
  experience?: string;
}

interface ProfileCardProps {
  profile: ProfileData;
  className?: string;
  onAction?: () => void;
}

export function ProfileCard({ profile, className, onAction }: ProfileCardProps) {
  const getRoleTitle = () => {
    switch (profile.role) {
      case 'student':
        return 'Student';
      case 'instructor':
        return 'Instructor';
      case 'ai-tutor':
        return 'AI Tutor';
      default:
        return 'User';
    }
  };

  const getActionButtonText = () => {
    switch (profile.role) {
      case 'student':
        return 'Connect';
      case 'instructor':
        return 'Connect';
      case 'ai-tutor':
        return 'Ask';
      default:
        return 'Contact';
    }
  };

  const getStats = () => {
    const stats = [];
    
    // Student stats
    if (profile.role === 'student') {
      if (profile.year) {
        stats.push({
          icon: GraduationCap,
          value: profile.year,
          label: 'year',
          color: 'text-blue-400'
        });
      }
      if (profile.skills && profile.skills.length > 0) {
        stats.push({
          icon: BookOpen,
          value: profile.skills.length.toString(),
          label: 'skills',
          color: 'text-green-400'
        });
      }
    }
    
    // Instructor stats
    if (profile.role === 'instructor') {
      if (profile.coursesCreated) {
        stats.push({
          icon: BookOpen,
          value: profile.coursesCreated.toString(),
          label: 'courses',
          color: 'text-purple-400'
        });
      }
      if (profile.subjects && profile.subjects.length > 0) {
        stats.push({
          icon: GraduationCap,
          value: profile.subjects.length.toString(),
          label: 'subjects',
          color: 'text-blue-400'
        });
      }
    }
    
    // AI Tutor stats
    if (profile.role === 'ai-tutor') {
      if (profile.capabilities && profile.capabilities.length > 0) {
        stats.push({
          icon: BookOpen,
          value: profile.capabilities.length.toString(),
          label: 'capabilities',
          color: 'text-purple-400'
        });
      }
      if (profile.subjects && profile.subjects.length > 0) {
        stats.push({
          icon: GraduationCap,
          value: profile.subjects.length.toString(),
          label: 'subjects',
          color: 'text-blue-400'
        });
      }
    }
    
    return stats.slice(0, 3); // Limit to 3 stats
  };

  const getSkills = () => {
    if (profile.role === 'ai-tutor') {
      return profile.capabilities?.slice(0, 2) || ['AI Assistant', 'Study Help'];
    }
    return profile.skills?.slice(0, 2) || [];
  };

  return (
    <div className={cn(
      "relative w-80 h-96 rounded-2xl overflow-hidden shadow-2xl",
      "bg-gradient-to-b from-purple-900 via-blue-800 to-purple-900",
      "backdrop-blur-sm border border-white/10",
      className
    )}>
      {/* Abstract 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large light blue star-like shape */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-xl" />
        
        {/* Metallic blue torus */}
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-blue-400/30 rounded-full" />
        <div className="absolute top-6 left-6 w-12 h-12 border-2 border-blue-300/40 rounded-full" />
        
        {/* Teal sphere with speckles */}
        <div className="absolute top-8 left-1/2 w-12 h-12 bg-teal-400/30 rounded-full blur-sm" />
        <div className="absolute top-10 left-1/2 w-2 h-2 bg-orange-400/60 rounded-full" />
        <div className="absolute top-12 left-1/2 w-1 h-1 bg-orange-300/80 rounded-full" />
        
        {/* Pinkish-purple ribbed shape */}
        <div className="absolute bottom-16 left-2 w-20 h-16 bg-pink-400/20 rounded-lg transform rotate-12 blur-sm" />
        
        {/* Dark purple wavy surface */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-purple-800/30 rounded-t-full" />
      </div>

      {/* Profile Image */}
      <div className="relative z-10 flex items-start p-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-gradient-to-br from-pink-400/30 to-purple-400/30">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-white/10 blur-md" />
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          {/* Name and Role */}
          <h3 className="text-white text-xl font-bold mb-1">{profile.name}</h3>
          <p className="text-white/80 text-sm mb-3">{getRoleTitle()}</p>

          {/* Skills/Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getSkills().map((skill, index) => (
              <span
                key={index}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  index === 0 
                    ? "bg-purple-500/80 text-white" 
                    : "bg-white/20 text-white border border-white/30"
                )}
              >
                {skill}
              </span>
            ))}
            {getSkills().length > 2 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                +{getSkills().length - 2}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6">
            {getStats().map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <stat.icon className={cn("w-3 h-3", stat.color)} />
                  <span className="text-white font-semibold text-sm">{stat.value}</span>
                </div>
                <span className="text-white/60 text-xs">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          {profile.school && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{profile.school}</span>
              </div>
            </div>
          )}

          {profile.major && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{profile.major}</span>
              </div>
            </div>
          )}

          {/* Bio for AI Tutor */}
          {profile.role === 'ai-tutor' && profile.bio && (
            <p className="text-white/70 text-xs mb-4 line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Call-to-Action Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onAction}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {getActionButtonText()}
          </div>
        </button>
      </div>

      {/* Bookmark Icon */}
      <div className="absolute bottom-4 left-4 w-6 h-6 border border-white/30 rounded-sm flex items-center justify-center">
        <div className="w-3 h-3 border-l-2 border-r-2 border-t-2 border-white/50 rounded-t-sm" />
      </div>
    </div>
  );
}
