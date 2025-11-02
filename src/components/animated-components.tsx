"use client";

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Animated Card Component with Hover Effects
export function AnimatedCard({ children, className = "", ...props }: any) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 }
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scroll Animated Stats Cards
export function ScrollAnimatedStats({ children, delay = 0 }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { 
        opacity: 1, 
        scale: 1, 
        rotateY: 0,
        transition: { 
          duration: 0.6, 
          delay: delay,
          ease: "easeOut"
        }
      } : {}}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Page Transition Wrapper
export function PageTransition({ children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Micro-interaction Button
export function AnimatedButton({ children, onClick, className = "", ...props }: any) {
  return (
    <motion.button
      className={className}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Status Change Animation
export function AnimatedStatus({ status, children, ...props }: any) {
  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Skeleton Loader
export function SkeletonLoader({ className = "" }: any) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      animate={{ 
        opacity: [0.5, 1, 0.5],
        transition: { 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      }}
    />
  );
}

// Floating Animation for Elements
export function FloatingElement({ children, intensity = 0.1, speed = 1 }: any) {
  return (
    <motion.div
      animate={{ 
        y: [0, -10 * intensity, 0],
        transition: { 
          duration: 2 / speed, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger Animation Container
export function StaggerContainer({ children, staggerDelay = 0.1 }: any) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax Scroll Effect
export function ParallaxElement({ children, offset = 50 }: any) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
