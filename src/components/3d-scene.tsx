"use client";

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 3D Floating Card Component
function FloatingCard({ position, rotation, children, ...props }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} {...props}>
      <boxGeometry args={[3, 2, 0.1]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      {children}
    </mesh>
  );
}

// 3D Progress Ring Component
function ProgressRing({ progress, position, color = "#3b82f6" }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.1, 16, 100]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(progress)}%
      </Text>
    </group>
  );
}

// 3D Particle System
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Float32Array | null>(null);

  useEffect(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    setParticles(positions);
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  if (!particles) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#3b82f6" transparent opacity={0.6} />
    </points>
  );
}

// 3D Background Scene
function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <ParticleField />
      
      {/* Floating Course Cards */}
      <FloatingCard position={[-3, 1, 0]} rotation={[0, 0.2, 0]} />
      <FloatingCard position={[3, -1, 0]} rotation={[0, -0.2, 0]} />
      <FloatingCard position={[0, 2, -1]} rotation={[0.1, 0, 0]} />
      
      {/* Progress Rings */}
      <ProgressRing progress={75} position={[-4, 0, 0]} color="#10b981" />
      <ProgressRing progress={60} position={[4, 0, 0]} color="#f59e0b" />
      <ProgressRing progress={90} position={[0, -2, 0]} color="#8b5cf6" />
      
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

export { Scene3D, FloatingCard, ProgressRing, ParticleField };
