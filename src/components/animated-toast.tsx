"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface AnimatedToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const variants = {
  default: {
    icon: Info,
    bgColor: 'bg-background',
    borderColor: 'border-border',
    iconColor: 'text-foreground',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

export function AnimatedToast({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  duration = 5000,
  onClose 
}: AnimatedToastProps) {
  const { icon: Icon, bgColor, borderColor, iconColor } = variants[variant];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3 
      }}
      className={`
        relative w-80 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${bgColor} ${borderColor}
        cursor-pointer hover:shadow-xl transition-shadow duration-200
      `}
      onClick={() => onClose(id)}
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 15,
            delay: 0.1 
          }}
          className={`flex-shrink-0 ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h4
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold text-foreground"
          >
            {title}
          </motion.h4>
          
          {description && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-muted-foreground mt-1"
            >
              {description}
            </motion.p>
          )}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 origin-left"
      />
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: AnimatedToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <AnimatedToast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
