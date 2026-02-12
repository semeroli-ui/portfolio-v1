import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Performance Config ---
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 3500 : 10000; // Optimize for mobile

    // --- Variables ---
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, points: THREE.Points;
    let positions: number[] = [];
    let targetPositions: number[] = [];
    let colors: number[] = [];
    let animationId: number;
    const animationSpeed = 0.04;
    let currentShapeIdx = 0;
    let intervalId: any;

    // Interaction variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.002, y: 0.002 };

    // --- Helpers ---
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; 
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();
      
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const generateGrid = () => {
      // Adjust grid density based on particle count approximation
      const size = isMobile ? 15 : 22; 
      const spacing = 22; 
      const offset = (size * spacing) / 2;
      let idx = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          for (let z = 0; z < size; z++) {
            if (idx < particleCount * 3) {
              targetPositions[idx] = x * spacing - offset;
              targetPositions[idx+1] = y * spacing - offset;
              targetPositions[idx+2] = z * spacing - offset;
              idx += 3;
            }
          }
        }
      }
    };

    const generateSphere = () => {
      const radius = 300;
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        targetPositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
        targetPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        targetPositions[i * 3 + 2] = radius * Math.cos(phi);
      }
    };

    const generateTorus = () => {
      const radius = 250; 
      const tube = 100;
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        targetPositions[i * 3] = (radius + tube * Math.cos(v)) * Math.cos(u);
        targetPositions[i * 3 + 1] = (radius + tube * Math.cos(v)) * Math.sin(u);
        targetPositions[i * 3 + 2] = tube * Math.sin(v);
      }
    };

    const autoChangeShape = () => {
      currentShapeIdx = (currentShapeIdx + 1) % 3;
      if (currentShapeIdx === 0) generateGrid();
      else if (currentShapeIdx === 1) generateSphere();
      else generateTorus();
    };

    // --- Init ---
    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 700;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      const geometry = new THREE.BufferGeometry();
      for (let i = 0; i < particleCount; i++) {
        positions.push(0, 0, 0);
        targetPositions.push(0, 0, 0);
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6); // Cyan/Blueish
        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 6.0,
        map: createCircleTexture(),
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.6
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      // Initial shape
      generateGrid();
    };

    const animate = () => {
      // Pause animation if tab is hidden to save battery
      if (document.hidden) {
        setTimeout(animate, 100); 
        return;
      }

      animationId = requestAnimationFrame(animate);
      
      const posAttr = points.geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] += (targetPositions[i] - posArray[i]) * animationSpeed;
      }
      posAttr.needsUpdate = true;
      
      if (!isDragging) {
        points.rotation.y += rotationVelocity.y;
        points.rotation.x += rotationVelocity.x;
      }
      
      renderer.render(scene, camera);
    };

    // --- Events ---
    const onWindowResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        points.rotation.y += (event.clientX - previousMousePosition.x) * 0.002;
        points.rotation.x += (event.clientY - previousMousePosition.y) * 0.002;
      }
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseDown = () => isDragging = true;
    const onMouseUp = () => isDragging = false;

    // --- Start ---
    init();
    animate();
    intervalId = setInterval(autoChangeShape, 8000);

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      clearInterval(intervalId);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        try {
            containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
            console.warn("Could not remove renderer canvas", e);
        }
      }
      // Dispose Three.js resources
      if (renderer) renderer.dispose();
      if (points) {
        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
};