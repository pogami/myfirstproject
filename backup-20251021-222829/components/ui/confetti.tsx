'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  colors?: string[];
  particleCount?: number;
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  gravity: number;
  opacity: number;
}

export function Confetti({ 
  trigger, 
  onComplete, 
  colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
  particleCount = 50,
  duration = 3000
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>(0);

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    
    // Simple square confetti
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    
    ctx.restore();
  };

  useEffect(() => {
    if (!trigger) return;

    console.log('Simple confetti triggered!', { trigger, colors, particleCount, duration });

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create simple particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const life = Math.random() * 2000 + 2000;
      
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: life,
        maxLife: life,
        gravity: 0.1,
        opacity: 1
      });
    }

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed > duration) {
        if (onComplete) onComplete();
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.rotation += particle.rotationSpeed;
        particle.life -= 16; // Assuming 60fps

        // Calculate opacity based on life
        particle.opacity = Math.max(0, particle.life / particle.maxLife);

        // Remove dead particles
        if (particle.life <= 0 || particle.opacity <= 0) {
          particlesRef.current.splice(index, 1);
          return;
        }

        // Draw particle
        drawParticle(ctx, particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, colors, particleCount, duration, onComplete]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
