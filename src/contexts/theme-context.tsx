"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#1e1b4b' : '#ffffff');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    const doc: any = typeof document !== 'undefined' ? document : undefined;

    // Use View Transitions if supported and motion isn't reduced
    if (
      doc &&
      'startViewTransition' in doc &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      doc.startViewTransition(() => {
        // Update state inside transition for smooth swap
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
      });
    } else {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    const doc: any = typeof document !== 'undefined' ? document : undefined;
    if (
      doc &&
      'startViewTransition' in doc &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      doc.startViewTransition(() => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
      });
    } else {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
