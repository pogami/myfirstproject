/**
 * @fileOverview Open Graph Meta Tags Utility
 * 
 * Comprehensive utility for generating dynamic Open Graph meta tags
 * for CourseConnect pages to ensure proper link previews across all platforms
 */

import { Metadata } from 'next';

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.courseconnectai.com';
const DEFAULT_IMAGE = 'https://courseconnectai.com/pageicon.png';
const DEFAULT_IMAGE_WIDTH = 400;
const DEFAULT_IMAGE_HEIGHT = 400;

// Types for different page types
export interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  courseCode?: string;
  department?: string;
  semester?: string;
  year?: string;
  image?: string;
  memberCount?: number;
}

export interface StudyGroupData {
  id: string;
  name: string;
  description: string;
  course?: string;
  memberCount: number;
  maxMembers?: number;
  image?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ProfileData {
  id: string;
  displayName: string;
  school?: string;
  major?: string;
  graduationYear?: string;
  profilePicture?: string;
  bio?: string;
}

export interface PageData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

/**
 * Generate Open Graph meta tags for any page
 */
export function generateOpenGraphMeta(data: PageData): Metadata {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url,
    type = 'website'
  } = data;

  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return {
    title,
    description,
    openGraph: {
      type,
      url: fullUrl,
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: DEFAULT_IMAGE_WIDTH,
          height: DEFAULT_IMAGE_HEIGHT,
          alt: `${title} - CourseConnect`,
        },
      ],
      siteName: 'CourseConnect',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@courseconnectai',
      site: '@courseconnectai',
    },
    other: {
      'twitter:domain': 'courseconnectai.com',
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Generate Open Graph meta tags for course pages
 */
export function generateCourseMeta(course: CourseData): Metadata {
  const title = `${course.title} - CourseConnect`;
  const description = course.description || 
    `Join ${course.title}${course.instructor ? ` with ${course.instructor}` : ''} on CourseConnect. ${course.memberCount ? `${course.memberCount} students` : 'Students'} are already studying together!`;
  
  const subtitle = course.instructor ? `with ${course.instructor}` : `${course.memberCount || 0} students`;
  const image = course.image || createOGImageUrl(course.title, subtitle, undefined, 'course');
  const url = `/course/${course.id}`;

  return generateOpenGraphMeta({
    title,
    description,
    image,
    url,
    type: 'article',
  });
}

/**
 * Generate Open Graph meta tags for study group pages
 */
export function generateStudyGroupMeta(group: StudyGroupData): Metadata {
  const title = `${group.name} - Study Group`;
  const description = group.description || 
    `Join ${group.name} study group${group.course ? ` for ${group.course}` : ''} on CourseConnect. ${group.memberCount}/${group.maxMembers || 'unlimited'} members. ${group.isPublic ? 'Open to all students!' : 'Private group.'}`;
  
  const subtitle = `${group.memberCount}/${group.maxMembers || '∞'} members`;
  const image = group.image || createOGImageUrl(group.name, subtitle, undefined, 'group');
  const url = `/group/${group.id}`;

  return generateOpenGraphMeta({
    title,
    description,
    image,
    url,
    type: 'article',
  });
}

/**
 * Generate Open Graph meta tags for profile pages
 */
export function generateProfileMeta(profile: ProfileData): Metadata {
  const title = `${profile.displayName} - CourseConnect Profile`;
  const description = profile.bio || 
    `${profile.displayName}${profile.school ? ` from ${profile.school}` : ''}${profile.major ? ` studying ${profile.major}` : ''}${profile.graduationYear ? ` (Class of ${profile.graduationYear})` : ''} on CourseConnect.`;
  
  const subtitle = profile.school ? `${profile.school} • ${profile.major || 'Student'}` : 'CourseConnect Student';
  const image = profile.profilePicture || createOGImageUrl(profile.displayName, subtitle, undefined, 'profile');
  const url = `/profile/${profile.id}`;

  return generateOpenGraphMeta({
    title,
    description,
    image,
    url,
    type: 'profile',
  });
}

/**
 * Generate Open Graph meta tags for homepage
 */
export function generateHomepageMeta(): Metadata {
  return generateOpenGraphMeta({
    title: 'CourseConnect - AI College Platform',
    description: 'Your unified platform for college success with AI-powered study tools, collaborative study groups, and intelligent course management.',
    image: DEFAULT_IMAGE,
    url: '/',
    type: 'website',
  });
}

/**
 * Generate Open Graph meta tags for dashboard
 */
export function generateDashboardMeta(): Metadata {
  return generateOpenGraphMeta({
    title: 'Dashboard - CourseConnect',
    description: 'Access your courses, study groups, AI chat, and academic tools all in one place.',
    image: DEFAULT_IMAGE,
    url: '/dashboard',
    type: 'website',
  });
}

/**
 * Generate Open Graph meta tags for chat pages
 */
export function generateChatMeta(chatType: 'general' | 'course' | 'group' = 'general', context?: string): Metadata {
  const titles = {
    general: 'AI Chat - CourseConnect',
    course: `Course Chat - ${context || 'CourseConnect'}`,
    group: `Study Group Chat - ${context || 'CourseConnect'}`,
  };

  const descriptions = {
    general: 'Chat with CourseConnect AI for study help, homework assistance, and academic guidance.',
    course: `Join the discussion for ${context || 'your course'} with classmates and AI assistance.`,
    group: `Collaborate with your study group${context ? ` for ${context}` : ''} using AI-powered tools.`,
  };

  return generateOpenGraphMeta({
    title: titles[chatType],
    description: descriptions[chatType],
    image: DEFAULT_IMAGE,
    url: '/dashboard/chat',
    type: 'website',
  });
}

/**
 * Generate Open Graph meta tags for about page
 */
export function generateAboutMeta(): Metadata {
  return generateOpenGraphMeta({
    title: 'About CourseConnect - AI College Platform',
    description: 'Learn about CourseConnect, the AI-powered platform revolutionizing college education with intelligent study tools and collaborative features.',
    image: DEFAULT_IMAGE,
    url: '/about',
    type: 'website',
  });
}

/**
 * Generate Open Graph meta tags for pricing page
 */
export function generatePricingMeta(): Metadata {
  return generateOpenGraphMeta({
    title: 'Pricing - CourseConnect',
    description: 'Choose the perfect plan for your academic journey. Free tier available with premium features for enhanced study experience.',
    image: DEFAULT_IMAGE,
    url: '/pricing',
    type: 'website',
  });
}

/**
 * Generate Open Graph meta tags for contact page
 */
export function generateContactMeta(): Metadata {
  return generateOpenGraphMeta({
    title: 'Contact Us - CourseConnect',
    description: 'Get in touch with the CourseConnect team. We\'re here to help with support, feedback, and partnership opportunities.',
    image: DEFAULT_IMAGE,
    url: '/contact',
    type: 'website',
  });
}

/**
 * Utility to create optimized Open Graph image URLs
 */
export function createOGImageUrl(
  text: string,
  subtitle?: string,
  imageUrl?: string,
  type: 'course' | 'group' | 'profile' | 'general' = 'general',
  width: number = DEFAULT_IMAGE_WIDTH,
  height: number = DEFAULT_IMAGE_HEIGHT
): string {
  // If custom image is provided, use it
  if (imageUrl) {
    return imageUrl;
  }
  
  // For now, use static images. In production, you can enable dynamic generation:
  // const params = new URLSearchParams({
  //   title: text,
  //   subtitle: subtitle || '',
  //   type: type,
  // });
  // return `${BASE_URL}/api/og?${params.toString()}`;
  
  // Static fallback images
  const staticImages = {
    course: `${BASE_URL}/og-images/course-default.png`,
    group: `${BASE_URL}/og-images/group-default.png`,
    profile: `${BASE_URL}/og-images/profile-default.png`,
    general: DEFAULT_IMAGE,
  };
  
  return staticImages[type] || DEFAULT_IMAGE;
}

/**
 * Validate Open Graph image dimensions and format
 */
export function validateOGImage(imageUrl: string): boolean {
  // Basic validation - in production, you might want to check actual image dimensions
  return imageUrl.includes('.') && (
    imageUrl.includes('.png') || 
    imageUrl.includes('.jpg') || 
    imageUrl.includes('.jpeg') || 
    imageUrl.includes('.webp')
  );
}

/**
 * Get fallback image for different page types
 */
export function getFallbackImage(pageType: 'course' | 'group' | 'profile' | 'general'): string {
  const fallbackImages = {
    course: `${BASE_URL}/og-images/course-default.png`,
    group: `${BASE_URL}/og-images/group-default.png`,
    profile: `${BASE_URL}/og-images/profile-default.png`,
    general: DEFAULT_IMAGE,
  };

  return fallbackImages[pageType] || DEFAULT_IMAGE;
}
