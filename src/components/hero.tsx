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
      className="relative overflow-hidden py-16 md:py-24 text-center"
      style={backgroundStyle}
    >
      {/* Reactive radial background */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: isClient
            ? `radial-gradient(circle at var(--mouse-x) var(--mouse-y), hsla(var(--primary-hsl) / 0.12), hsl(var(--background-hsl)) 40%)`
            : "hsl(var(--background-hsl))",
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
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter !leading-[1.1]">
          Ace your{" "}
          <span
            className={`text-primary inline-block transition-opacity duration-300 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
            aria-live="polite"
          >
            {words[index]}
          </span>
          , together.
        </h1>

        <p className="max-w-2xl text-xl text-muted-foreground">{subtitle}</p>

        <div className="flex flex-wrap gap-4 mt-2">
          <Button size="lg" asChild>
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
