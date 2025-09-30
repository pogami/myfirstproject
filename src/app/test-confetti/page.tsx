'use client';

import React, { useState } from 'react';
import { Confetti } from '@/components/ui/confetti';
import { Button } from '@/components/ui/button';

export default function TestConfettiPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBurstConfetti, setShowBurstConfetti] = useState(false);

  const triggerConfetti = () => {
    console.log('Triggering confetti test!');
    setShowConfetti(true);
  };

  const triggerBurstConfetti = () => {
    console.log('Triggering burst confetti test!');
    setShowBurstConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Enhanced Confetti Test
        </h1>
        
        <div className="space-y-4">
          <Button 
            onClick={triggerConfetti}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold"
          >
            🎉 Trigger Rain Confetti
          </Button>
          
          <Button 
            onClick={triggerBurstConfetti}
            className="bg-gradient-to-r from-green-500 to-pink-500 hover:from-green-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold"
          >
            ✨ Trigger Burst Confetti
          </Button>
        </div>
        
        <div className="max-w-md mx-auto text-gray-600 dark:text-gray-400 space-y-2">
          <p>✨ Simple confetti features:</p>
          <ul className="text-sm space-y-1">
            <li>• Basic square confetti pieces</li>
            <li>• Simple gravity physics</li>
            <li>• Fade-out effects</li>
            <li>• 5 vibrant colors</li>
            <li>• 50 particles for clean effect</li>
            <li>• 3-second duration</li>
          </ul>
        </div>
      </div>
      
      <Confetti 
        trigger={showConfetti} 
        onComplete={() => {
          console.log('Simple confetti animation completed!');
          setShowConfetti(false);
        }}
        colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
        particleCount={50}
        duration={3000}
      />
      
      <Confetti 
        trigger={showBurstConfetti} 
        onComplete={() => {
          console.log('Simple confetti animation completed!');
          setShowBurstConfetti(false);
        }}
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        particleCount={60}
        duration={2500}
      />
    </div>
  );
}
