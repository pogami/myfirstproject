"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroProps = {
  // Optional props if you want to customize later
  words?: string[];
  subtitle?: string;
  ctaHref?: string;
  ctaText?: string;
};

export function Hero({
  words = ["homework", "tests", "quizzes", "projects", "labs", "classes"],
  subtitle = "Join AI-powered study groups for your classes. Just upload your syllabus to get started.",
  ctaHref = "/dashboard/upload",
  ctaText = "Upload Your Syllabus",
}: HeroProps) {
  // Reactive background (mouse-follow radial gradient)
  const [isClient, setIsClient] = useState(false);
  const [mouse, setMouse] = useState({ x: -100, y: -100 });

  // Typewriter effect states
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  // Solutions only
  const solutions = [
    "homework",
    "tests", 
    "quizzes",
    "projects",
    "labs",
    "classes"
  ];

  useEffect(() => {
    setIsClient(true);
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const typewriterInterval = setInterval(() => {
      const currentWord = solutions[textIndex];
      
      if (!isDeleting && charIndex < currentWord.length) {
        // Typing
        setCurrentText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        // Deleting
        setCurrentText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        // Finished typing, wait then start deleting
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        // Finished deleting, wait a moment then move to next word
        setTimeout(() => {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % solutions.length);
        }, 500);
      }
    }, isDeleting ? 50 : 100); // Faster deleting, slower typing

    return () => clearInterval(typewriterInterval);
  }, [charIndex, isDeleting, textIndex, solutions]);

  const backgroundStyle: React.CSSProperties = isClient
    ? ({ "--mouse-x": `${mouse.x}px`, "--mouse-y": `${mouse.y}px` } as React.CSSProperties)
    : {};

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 text-center"
      style={backgroundStyle}
    >
      {/* Transparent background to show page-level gradient */}
      <div className="absolute inset-0 bg-transparent" />
      
      {/* Animated gradient orbs - purple to blue transition */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Reactive radial background */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: isClient
            ? `radial-gradient(circle at var(--mouse-x) var(--mouse-y), hsla(var(--primary-hsl) / 0.15), transparent 50%)`
            : "transparent",
        }}
      />
      {/* Decorative icon that subtly follows the mouse */}
      {isClient && (
        <BookOpen
          className="pointer-events-none absolute -left-1/2 -top-1/2 z-0 text-primary/5 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mouse.x}px, ${mouse.y}px) scale(8) rotate(-30deg)`,
            opacity: mouse.x > 0 ? 1 : 0,
          }}
        />
      )}
      {/* Local CSS variables with safe defaults */}
      <style>
        {`
          :root {
            --primary-hsl: 203 76% 70%;
            --background-hsl: 204 100% 96%;
          }
          .dark {
            --primary-hsl: 203 70% 65%;
            --background-hsl: 210 15% 12%;
          }
        `}
      </style>


      {/* Content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-3 sm:px-6 flex flex-col items-center gap-6 sm:gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-primary/20 rounded-full text-sm font-medium text-primary shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Trusted by students across the U.S.
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter !leading-[1.15] px-2 sm:px-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          Ace your{" "}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {currentText}
            <span className="animate-pulse text-purple-600">|</span>
          </span>
          <span style={{ marginLeft: '0.1em' }}>, together.</span>
        </h1>

        <p className="max-w-3xl text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4 sm:px-0 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-4">
          <Button size="lg" className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300" asChild>
            <Link href="/features">
              View Features
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-8 sm:mt-12">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">AI-Powered</div>
            <div className="text-sm text-muted-foreground">Study Tools</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">U.S.</div>
            <div className="text-sm text-muted-foreground">Universities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">Free</div>
            <div className="text-sm text-muted-foreground">To Start</div>
          </div>
        </div>
      </div>
    </section>
  );
}
