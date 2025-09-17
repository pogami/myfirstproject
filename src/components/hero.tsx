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

  // Rotating word in the title
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFading(false);
      }, 200); // fade out before switching
    }, 2600); // rotate every ~2.6s
    return () => clearInterval(interval);
  }, [words.length]);

  const backgroundStyle: React.CSSProperties = isClient
    ? ({ "--mouse-x": `${mouse.x}px`, "--mouse-y": `${mouse.y}px` } as React.CSSProperties)
    : {};

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 text-center"
      style={backgroundStyle}
    >
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
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

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-100" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-32 left-20 w-5 h-5 bg-indigo-400/30 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-pink-400/30 rounded-full animate-bounce delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-3 sm:px-6 flex flex-col items-center gap-6 sm:gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-primary/20 rounded-full text-sm font-medium text-primary shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Trusted by 50,000+ students worldwide
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter !leading-[1.05] px-2 sm:px-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          Ace your{" "}
          <span
            className={`bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block transition-all duration-500 ${
              fading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            aria-live="polite"
          >
            {words[index]}
          </span>
          , together.
        </h1>

        <p className="max-w-3xl text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 px-4 sm:px-0 leading-relaxed">{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-4">
          <Button size="lg" className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300" asChild>
            <Link href="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-8 sm:mt-12">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Universities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">94%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
