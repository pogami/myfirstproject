"use client";

import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * normalizeMath - converts casual math input into nicer LaTeX for KaTeX.
 * - converts a/b (simple numeric fractions) into \frac{a}{b}
 * - converts x^3 or x^10 into x^{3} (handles parenthesis and variables)
 * - converts sqrt(x) into \sqrt{x}
 * - converts * or x between tokens into \times
 * - converts " / " (when not simple fraction) to \div
 * - escapes characters KaTeX doesn't like in raw input
 *
 * Note: This is a lightweight normalizer for common cases. For complex math,
 * prefer sending actual LaTeX input from the user or let them type LaTeX directly.
 */
function normalizeMath(input: string): string {
  if (!input || typeof input !== "string") return "";

  let s = input.trim();

  // Common text replacements to make input friendlier
  s = s.replace(/\b×\b/g, "\\times");
  s = s.replace(/\btimes\b/gi, "\\times");
  s = s.replace(/\b÷\b/g, "\\div");
  s = s.replace(/\bdivided by\b/gi, "\\div");

  // sqrt(...) -> \sqrt{...}
  s = s.replace(/sqrt\s*\(\s*([^\)]+)\s*\)/gi, (_, inner) => `\\sqrt{${inner}}`);

  // Replace simple numeric fractions like 3/4 or 12 / 5 -> \frac{3}{4}
  // Use a regex that finds number / number with optional spaces
  s = s.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, "\\\\frac{$1}{$2}");

  // Handle variable/expression fractions like (a+b)/(c+d) -> \frac{(a+b)}{(c+d)}
  // This is conservative: only if both sides are parenthesized or alphanumeric groups
  s = s.replace(/(\([^\)]+\)|[A-Za-z0-9]+)\s*\/\s*(\([^\)]+\)|[A-Za-z0-9]+)/g, "\\\\frac{$1}{$2}");

  // Convert caret exponent a^b -> a^{b}
  // This handles a^3, x^(2+1), (x+1)^2, variable^y
  s = s.replace(/([A-Za-z0-9\)\]\}]+)\s*\^\s*([A-Za-z0-9\(\[\{]+)/g, (m, base, pow) => {
    // if pow starts with a parenthesis, keep it as-is; else wrap in braces
    if (/^[\(\[\{]/.test(pow)) return `${base}^{${pow}}`;
    return `${base}^{${pow}}`;
  });

  // Replace '*' or ' * ' with \times, but don't change when it's part of e.g. pointer syntax.
  // Use a token-based simple approach: replace instances where * is between non-space punctuation/words.
  s = s.replace(/([A-Za-z0-9\)\]\}])\s*\*\s*([A-Za-z0-9\(\[\{])/g, "$1\\\\times $2");

  // Also replace ' x ' (lowercase letter x used as multiply) between numbers/vars -> \times
  s = s.replace(/([0-9A-Za-z\)\]\}])\s+x\s+([0-9A-Za-z\(\[\{])/g, "$1\\\\times $2");

  // If any remaining standalone "/" (not handled above) convert to \div
  s = s.replace(/\/(?=[^\d\{])/g, "\\div ");

  // Escape stray backticks or HTML angle brackets (KaTeX doesn't like raw < >)
  s = s.replace(/</g, "\\lt ").replace(/>/g, "\\gt ");

  return s;
}

interface MathRenderProps {
  input?: string;
  displayMode?: boolean;
  autoDetectLaTeX?: boolean;
  className?: string;
}

/**
 * MathRender component
 *
 * props:
 *   - input: string (user's math expression in casual format or LaTeX)
 *   - displayMode: boolean (true => display math block, false => inline)
 *   - autoDetectLaTeX: boolean (if true, we will not rewrite if it looks like LaTeX)
 */
export default function MathRender({ 
  input = "", 
  displayMode = false, 
  autoDetectLaTeX = true,
  className = ""
}: MathRenderProps) {
  // If the user already provided explicit LaTeX delimiters, skip normalization
  const looksLikeLaTeX = /^\s*(\\\(|\\\[|\\begin|\\displaystyle|[$]{1,2})/.test(input);
  const source = (autoDetectLaTeX && looksLikeLaTeX) ? input : normalizeMath(input);

  try {
    if (displayMode) {
      return (
        <div className={`math-render ${className}`}>
          <BlockMath>{source}</BlockMath>
        </div>
      );
    } else {
      return (
        <div className={`math-render ${className}`}>
          <InlineMath>{source}</InlineMath>
        </div>
      );
    }
  } catch (err) {
    // fallback: render escaped text to avoid crash
    return (
      <div className={`math-render ${className}`}>
        <span>{escapeHtml(input)}</span>
      </div>
    );
  }
}

// small helper to escape html for fallback
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
