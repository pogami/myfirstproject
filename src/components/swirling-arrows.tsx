"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";

interface SwirlingArrowsProps {
  targetSelector?: string;
  className?: string;
}

export function SwirlingArrows({ 
  targetSelector = 'a[href="/dashboard/upload"]', 
  className = "" 
}: SwirlingArrowsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show arrows after a delay
    const showTimer = setTimeout(() => setIsVisible(true), 2000);
    
    // Update target position
    const updatePosition = () => {
      const target = document.querySelector(targetSelector) as HTMLElement;
      if (target && containerRef.current) {
        const rect = target.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        setTargetPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial position update
    updatePosition();

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetSelector]);

  const arrows = [
    { icon: ArrowRight, angle: 0, delay: 0, color: 'text-blue-500' },
    { icon: ArrowUp, angle: 90, delay: 0.5, color: 'text-purple-500' },
    { icon: ArrowLeft, angle: 180, delay: 1, color: 'text-green-500' },
    { icon: ArrowDown, angle: 270, delay: 1.5, color: 'text-orange-500' },
  ];

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-40 ${className}`}
    >
      {isVisible && (
        <>
          {/* Swirling Arrows */}
          {arrows.map((arrow, index) => {
            const radius = 80;
            const angle = (arrow.angle + (Date.now() / 1000) * 30) * (Math.PI / 180);
            const x = targetPosition.x + Math.cos(angle) * radius;
            const y = targetPosition.y + Math.sin(angle) * radius;

            return (
              <div
                key={index}
                className={`absolute transition-all duration-1000 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${arrow.angle}deg)`,
                  animationDelay: `${arrow.delay}s`,
                }}
              >
                <div className={`w-8 h-8 ${arrow.color} animate-pulse`}>
                  <arrow.icon className="w-full h-full drop-shadow-lg" />
                </div>
              </div>
            );
          })}

          {/* Pulsing Ring around Target */}
          <div
            className={`absolute transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              transform: 'translate(-50%, -50%)',
              animationDelay: '2s',
            }}
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="absolute inset-0 w-24 h-24 border-2 border-primary/30 rounded-full animate-ping"></div>
              {/* Inner ring */}
              <div className="absolute inset-2 w-20 h-20 border-2 border-primary/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              {/* Center dot */}
              <div className="absolute inset-4 w-12 h-12 bg-primary/20 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Floating Text */}
          <div
            className={`absolute transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y - 60}px`,
              transform: 'translate(-50%, -50%)',
              animationDelay: '2.5s',
            }}
          >
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <span className="text-sm font-semibold">Click here!</span>
            </div>
          </div>

          {/* Particle Effects */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-primary/40 rounded-full animate-ping ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${targetPosition.x + Math.cos((i * 45) * Math.PI / 180) * 60}px`,
                top: `${targetPosition.y + Math.sin((i * 45) * Math.PI / 180) * 60}px`,
                animationDelay: `${3 + i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
