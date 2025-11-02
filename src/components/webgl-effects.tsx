"use client";

import { useEffect, useRef } from 'react';

// WebGL Particle System
export function WebGLParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particle system
    const particleCount = 1000;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.01,
        life: Math.random(),
        maxLife: 1
      });
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec3 position;
      attribute float alpha;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      varying float vAlpha;
      
      void main() {
        vAlpha = alpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      varying float vAlpha;
      
      void main() {
        gl_FragColor = vec4(0.2, 0.5, 1.0, vAlpha);
      }
    `;

    // Create shader
    function createShader(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    // Create program
    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      return program;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    const alphaLocation = gl.getAttribLocation(program, 'alpha');
    const modelViewMatrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');

    // Create buffers
    const positionBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();

    // Animation loop
    function animate() {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Update particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.life -= 0.01;

        if (particle.life <= 0) {
          particle.x = (Math.random() - 0.5) * 2;
          particle.y = (Math.random() - 0.5) * 2;
          particle.z = (Math.random() - 0.5) * 2;
          particle.life = particle.maxLife;
        }
      });

      // Update position buffer
      const positions = new Float32Array(particles.length * 3);
      const alphas = new Float32Array(particles.length);
      
      particles.forEach((particle, i) => {
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;
        positions[i * 3 + 2] = particle.z;
        alphas[i] = particle.life;
      });

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(alphaLocation);
      gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);

      // Set matrices
      const modelViewMatrix = new Float32Array(16);
      const projectionMatrix = new Float32Array(16);
      
      // Simple identity matrices for now
      for (let i = 0; i < 16; i++) {
        modelViewMatrix[i] = i % 5 === 0 ? 1 : 0;
        projectionMatrix[i] = i % 5 === 0 ? 1 : 0;
      }

      gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, particles.length);

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}

// WebGL Data Visualization
export function WebGLDataViz({ data, type = 'bar' }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Simple bar chart implementation
    const bars = data.map((value: number, index: number) => ({
      x: (index / data.length) * 2 - 1,
      y: (value / Math.max(...data)) * 2 - 1,
      height: (value / Math.max(...data)) * 2,
      color: [0.2 + index * 0.1, 0.5, 0.8, 1.0]
    }));

    // Clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw bars
    bars.forEach(bar => {
      const vertices = new Float32Array([
        bar.x, -1, 0,
        bar.x + 0.1, -1, 0,
        bar.x, bar.y, 0,
        bar.x + 0.1, bar.y, 0
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // Simple rendering without shaders for now
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    });

  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64"
      width={400}
      height={200}
    />
  );
}
