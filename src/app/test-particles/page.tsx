'use client';

import React from 'react';
import EnhancedParticleSystem from '@/components/enhanced-particle-system';

export default function TestParticlesPage() {
  return (
    <div className="relative min-h-screen">
      {/* Particle System Background */}
      <EnhancedParticleSystem
        particleCount={50}
        connectionDistance={100}
        mouseInfluence={0.3}
        colors={['#3B82F6', '#8B5CF6', '#EC4899']}
        showConnections={true}
        showParticles={true}
        pulseEffect={true}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Particle System Test
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Move your mouse to create waves!
          </p>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300">
              If you can see this text, the particle system is working behind it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
