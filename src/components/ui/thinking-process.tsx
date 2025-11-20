"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ThinkingProcessProps {
  steps?: string[];
  status?: 'thinking' | 'complete' | 'error';
  defaultOpen?: boolean;
}

export function ThinkingProcess({ 
  steps = [], 
  status = 'thinking',
  defaultOpen = false
}: ThinkingProcessProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [elapsed, setElapsed] = useState(0);

  // Simple timer effect
  useEffect(() => {
    if (status !== 'thinking') return;
    
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50">
            {status === 'thinking' ? (
              <div className="flex items-center gap-2">
                 <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-3 h-3" />
                </motion.div>
                <span className="font-medium">Thinking</span>
                <span className="text-xs opacity-70 tabular-nums">
                   ({elapsed}s)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">Thought Process</span>
              </div>
            )}

            <ChevronDown 
              className={cn(
                "w-3 h-3 transition-transform duration-200 opacity-50 group-hover:opacity-100",
                isOpen ? "rotate-180" : ""
              )} 
            />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="ml-4 pl-4 border-l-2 border-muted space-y-3 py-2 my-1">
          {steps.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Initializing...</p>
          ) : (
            steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-sm text-muted-foreground flex items-start gap-3"
              >
                <span className="mt-1.5 min-w-[4px] h-[4px] rounded-full bg-muted-foreground/40" />
                <span className="leading-relaxed">{step}</span>
              </motion.div>
            ))
          )}
          {status === 'thinking' && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex gap-1 items-center h-6 pl-2"
             >
               <span className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <span className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <span className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-bounce" />
             </motion.div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

