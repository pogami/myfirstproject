"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import MathRender from './math-render';
import BotResponse from './bot-response';
import { TruncatedText } from './truncated-text';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIResponseRendererProps {
  content: string;
  className?: string;
  sources?: {
    title: string;
    url: string;
    snippet: string;
  }[];
}

interface ParsedResponse {
  type: 'text' | 'code' | 'graph' | 'math' | 'mixed';
  content: any;
  language?: string;
  graphData?: any[];
  graphType?: 'line' | 'bar' | 'pie' | 'area';
  mathExpressions?: string[];
}

export function AIResponseRenderer({ content, className = "", sources }: AIResponseRendererProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // First try the new BotResponse component for simple math and graph detection
  const isSimpleMathOrGraph = (text: string): boolean => {
    // Check for simple math patterns (single $ or $$)
    const hasSimpleMath = /\$[^$]+\$|\$\$[^$]+\$\$/.test(text);
    
    // Check for simple graph data (JSON array with x,y)
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) && parsed.every((p: any) => "x" in p && "y" in p);
    } catch {
      return false;
    }
    
    return hasSimpleMath;
  };

  // If it's simple math or graph, use the new BotResponse component
  if (isSimpleMathOrGraph(content)) {
    return <BotResponse content={content} className={className} sources={sources} />;
  }

  const parseResponse = (text: string): ParsedResponse => {
    // Check for code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeMatches = Array.from(text.matchAll(codeBlockRegex));
    
    // Check for graph data patterns
    const graphDataRegex = /\[(?:{[\s\S]*?},?\s*)*\]/g;
    const graphMatches = text.match(graphDataRegex);
    
    // Check for specific graph keywords
    const hasGraphKeywords = /chart|graph|plot|data visualization|line chart|bar chart|pie chart/i.test(text);
    
    // Check for math expressions
    const mathExpressions = extractMathExpressions(text);
    const hasMath = mathExpressions.length > 0;
    
    if (codeMatches.length > 0 && !hasGraphKeywords && !hasMath) {
      // Return first code block
      const match = codeMatches[0];
      return {
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text'
      };
    }
    
    if (hasGraphKeywords && graphMatches) {
      try {
        // Try to parse graph data
        const graphData = JSON.parse(graphMatches[0]);
        if (Array.isArray(graphData) && graphData.length > 0) {
          return {
            type: 'graph',
            content: text,
            graphData,
            graphType: determineGraphType(text, graphData)
          };
        }
      } catch (e) {
        // If parsing fails, try to extract data from text
        const extractedData = extractGraphDataFromText(text);
        if (extractedData.length > 0) {
          return {
            type: 'graph',
            content: text,
            graphData: extractedData,
            graphType: determineGraphType(text, extractedData)
          };
        }
      }
    }

    // Check for linear equation data (x,y coordinates)
    const linearData = extractLinearEquationData(text);
    if (linearData.length > 0) {
      console.log('Graph data detected:', linearData);
      return {
        type: 'graph',
        content: text,
        graphData: linearData,
        graphType: 'line'
      };
    }
    
    if (hasMath && !hasGraphKeywords && codeMatches.length === 0) {
      return {
        type: 'math',
        content: text,
        mathExpressions
      };
    }
    
    if (codeMatches.length > 0 && (hasGraphKeywords || hasMath)) {
      // Mixed content with code and graph/math
      return {
        type: 'mixed',
        content: text,
        language: codeMatches[0][1] || 'text',
        mathExpressions: hasMath ? mathExpressions : undefined
      };
    }
    
    return {
      type: 'text',
      content: text
    };
  };

  const determineGraphType = (text: string, data: any[]): 'line' | 'bar' | 'pie' | 'area' => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('pie chart') || lowerText.includes('pie')) {
      return 'pie';
    }
    if (lowerText.includes('bar chart') || lowerText.includes('bar')) {
      return 'bar';
    }
    if (lowerText.includes('area chart') || lowerText.includes('area')) {
      return 'area';
    }
    
    // Default to line chart
    return 'line';
  };

  const extractGraphDataFromText = (text: string): any[] => {
    // Try to extract data from common patterns
    const patterns = [
      // Pattern: "Jan: 30, Feb: 50, Mar: 40"
      /(\w+):\s*(\d+)/g,
      // Pattern: "January 30, February 50, March 40"
      /(\w+)\s+(\d+)/g
    ];
    
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        return matches.map(match => ({
          name: match[1],
          value: parseInt(match[2])
        }));
      }
    }
    
    return [];
  };

  const extractLinearEquationData = (text: string): any[] => {
    console.log('Extracting linear equation data from:', text);
    
    // Look for JSON arrays with x,y coordinates - improved pattern
    const jsonPatterns = [
      // Pattern 1: [{"x": -2, "y": 0}, {"x": -1, "y": 1}, ...]
      /\[\s*\{[^}]*"x"[^}]*"y"[^}]*\}(?:\s*,\s*\{[^}]*"x"[^}]*"y"[^}]*\})*\s*\]/g,
      // Pattern 2: More flexible pattern for JSON arrays
      /\[[\s\S]*?\{[\s\S]*?"x"[\s\S]*?"y"[\s\S]*?\}[\s\S]*?\]/g
    ];
    
    for (const pattern of jsonPatterns) {
      const jsonMatches = text.match(pattern);
      console.log('JSON matches found:', jsonMatches);
      
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            // Clean up the match to ensure valid JSON
            let cleanMatch = match.trim();
            console.log('Trying to parse:', cleanMatch);
            
            // Try to parse the JSON
            const data = JSON.parse(cleanMatch);
            if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('x') && data[0].hasOwnProperty('y')) {
              console.log('Successfully parsed JSON data:', data);
              return data.map(point => ({
                name: point.x.toString(),
                value: point.y
              }));
            }
          } catch (e) {
            console.log('JSON parse failed, trying coordinate extraction:', e);
            // Try to extract individual coordinate pairs
            const coordPattern = /\{"x":\s*(-?\d+(?:\.\d+)?),\s*"y":\s*(-?\d+(?:\.\d+)?)\}/g;
            const coordMatches = Array.from(match.matchAll(coordPattern));
            
            if (coordMatches.length > 0) {
              console.log('Coordinate matches found:', coordMatches);
              return coordMatches.map(match => ({
                name: match[1],
                value: parseFloat(match[2])
              }));
            }
          }
        }
      }
    }
    
    console.log('No graph data found');
    return [];
  };

  const extractMathExpressions = (text: string): string[] => {
    const mathExpressions: string[] = [];
    
    // Look for LaTeX math delimiters
    const latexPatterns = [
      // Display math: \[ ... \] or $$ ... $$
      /\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g,
      // Inline math: \( ... \) or $ ... $
      /\\\(([\s\S]*?)\\\)|\$([^$]+)\$/g
    ];
    
    for (const pattern of latexPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const expression = match[1] || match[2];
        if (expression && expression.trim()) {
          mathExpressions.push(expression.trim());
        }
      }
    }
    
    // Look for common math patterns that should be rendered
    const mathKeywords = [
      /sqrt\s*\([^)]+\)/gi,
      /\d+\/\d+/g,
      /[a-zA-Z]\^[0-9]+/g,
      /[a-zA-Z]\^\([^)]+\)/g,
      /integral|derivative|limit|sum|product/gi
    ];
    
    for (const pattern of mathKeywords) {
      const matches = text.match(pattern);
      if (matches) {
        mathExpressions.push(...matches);
      }
    }
    
    return mathExpressions;
  };

  const renderGraph = (data: any[], type: 'line' | 'bar' | 'pie' | 'area') => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    
    switch (type) {
      case 'line':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'bar':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'area':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderCode = (code: string, language: string) => {
    const blockId = `code-${Math.random().toString(36).substr(2, 9)}`;
    const isCopied = copiedStates[blockId];

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedStates(prev => ({ ...prev, [blockId]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [blockId]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    return (
      <div className="my-4 relative group">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          customStyle={{
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          {code}
        </SyntaxHighlighter>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={copyToClipboard}
          title="Copy code"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </Button>
      </div>
    );
  };

  const renderMath = (text: string, mathExpressions: string[]) => {
    let processedText = text;
    
    // Replace math expressions with placeholders
    const placeholders: { [key: string]: string } = {};
    mathExpressions.forEach((expr, index) => {
      const placeholder = `__MATH_${index}__`;
      placeholders[placeholder] = expr;
      processedText = processedText.replace(expr, placeholder);
    });
    
    // Split by placeholders and render
    const parts = processedText.split(/(__MATH_\d+__)/);
    
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.startsWith('__MATH_') && part.endsWith('__')) {
            const mathExpr = placeholders[part];
            return (
              <MathRender
                key={index}
                input={mathExpr}
                displayMode={mathExpr.includes('\\[') || mathExpr.includes('$$')}
                className="inline-block"
              />
            );
          }
          return part.trim() ? (
            <span key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
              {part}
            </span>
          ) : null;
        })}
      </div>
    );
  };

  const renderMixedContent = (text: string, language: string, mathExpressions?: string[]) => {
    // Split text by code blocks and render accordingly
    const parts = text.split(/```[\w]*\n[\s\S]*?```/);
    const codeBlocks = Array.from(text.matchAll(/```(\w+)?\n([\s\S]*?)```/g));
    
    return (
      <div className="space-y-4">
        {parts.map((part, index) => (
          <div key={index}>
            {part.trim() && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {mathExpressions && mathExpressions.length > 0 ? 
                  renderMath(part.trim(), mathExpressions) : 
                  part.trim()
                }
              </div>
            )}
            {codeBlocks[index] && renderCode(codeBlocks[index][2].trim(), codeBlocks[index][1] || language)}
          </div>
        ))}
      </div>
    );
  };

  const parsedResponse = parseResponse(content);

  return (
    <div className={`relative ${className}`}>
      {parsedResponse.type === 'text' && (
        <div className="relative">
          <TruncatedText 
            text={parsedResponse.content}
            maxLength={300}
            className="ai-response"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-background hover:bg-muted border border-border rounded-md shadow-sm"
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      {parsedResponse.type === 'code' && (
        renderCode(parsedResponse.content, parsedResponse.language || 'text')
      )}
      
      {parsedResponse.type === 'graph' && parsedResponse.graphData && (
        <div className="my-4">
          <div className="mb-2 text-sm text-muted-foreground">
            Data Visualization:
          </div>
          {renderGraph(parsedResponse.graphData, parsedResponse.graphType || 'line')}
        </div>
      )}
      
      {parsedResponse.type === 'math' && parsedResponse.mathExpressions && (
        <div className="my-4">
          {renderMath(parsedResponse.content, parsedResponse.mathExpressions)}
        </div>
      )}
      
      {parsedResponse.type === 'mixed' && (
        renderMixedContent(parsedResponse.content, parsedResponse.language || 'text', parsedResponse.mathExpressions)
      )}
    </div>
  );
}
