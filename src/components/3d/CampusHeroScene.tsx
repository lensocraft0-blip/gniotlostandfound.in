import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const CampusHeroScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;
    const floatingObjects: THREE.Object3D[] = [];

    try {
      const container = containerRef.current;
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 450;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x1d1020, 0.045);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // Clear container and attach canvas
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0x30152f, 1.8);
      scene.add(ambientLight);

      const mainGoldLight = new THREE.DirectionalLight(0xd9a441, 3.2);
      mainGoldLight.position.set(5, 6, 4);
      scene.add(mainGoldLight);

      const silverRimLight = new THREE.DirectionalLight(0xe8edf2, 2.5);
      silverRimLight.position.set(-6, -4, 2);
      scene.add(silverRimLight);

      const deepAccentPoint = new THREE.PointLight(0xf3c35c, 2, 10);
      deepAccentPoint.position.set(0, -1, 3);
      scene.add(deepAccentPoint);

      // --- MATERIALS ---
      const goldMetallicMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9a441,
        metalness: 0.9,
        roughness: 0.22,
      });

      const silverMetallicMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8edf2,
        metalness: 0.95,
        roughness: 0.15,
      });

      const darkMatteMaterial = new THREE.MeshStandardMaterial({
        color: 0x1d1020,
        metalness: 0.4,
        roughness: 0.5,
      });

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe8edf2,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 0.5,
        transparent: true,
        opacity: 0.8,
      });

      // --- 1. SMARTPHONE OBJECT ---
      const phoneGroup = new THREE.Group();
      const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.12), darkMatteMaterial);
      const phoneScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.08, 2.05),
        new THREE.MeshStandardMaterial({ color: 0x30152f, roughness: 0.1, metalness: 0.8 })
      );
      phoneScreen.position.z = 0.065;

      const phoneCamera = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16),
        goldMetallicMaterial
      );
      phoneCamera.rotation.x = Math.PI / 2;
      phoneCamera.position.set(0.35, 0.75, -0.07);

      phoneGroup.add(phoneBody, phoneScreen, phoneCamera);
      phoneGroup.position.set(-1.8, 0.6, 0.5);
      phoneGroup.rotation.set(0.3, -0.4, 0.2);
      scene.add(phoneGroup);
      floatingObjects.push(phoneGroup);

      // --- 2. CAMPUS ID CARD BADGE ---
      const badgeGroup = new THREE.Group();
      const badgeCard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, 0.04), silverMetallicMaterial);
      const badgeHolo = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.35),
        goldMetallicMaterial
      );
      badgeHolo.position.set(0, 0.5, 0.025);
      const badgeSlot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16),
        darkMatteMaterial
      );
      badgeSlot.position.set(0, 0.85, 0);

      badgeGroup.add(badgeCard, badgeHolo, badgeSlot);
      badgeGroup.position.set(1.9, 0.8, -0.2);
      badgeGroup.rotation.set(-0.25, 0.35, -0.15);
      scene.add(badgeGroup);
      floatingObjects.push(badgeGroup);

      // --- 3. WIRELESS EARBUDS CASE (CAPSULE) ---
      const earbudCaseGroup = new THREE.Group();
      const caseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.7, 32),
        silverMetallicMaterial
      );
      const caseGoldSeam = new THREE.Mesh(
        new THREE.TorusGeometry(0.405, 0.015, 16, 48),
        goldMetallicMaterial
      );
      earbudCaseGroup.add(caseMesh, caseGoldSeam);
      earbudCaseGroup.position.set(-0.9, -1.4, 1.2);
      earbudCaseGroup.rotation.set(0.6, 0.4, -0.3);
      scene.add(earbudCaseGroup);
      floatingObjects.push(earbudCaseGroup);

      // --- 4. KEY RING WITH KEYS ---
      const keyGroup = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 16, 32), goldMetallicMaterial);
      const key1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.03), goldMetallicMaterial);
      key1.position.set(0.2, -0.45, 0);
      key1.rotation.z = 0.2;
      const key2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.03), silverMetallicMaterial);
      key2.position.set(-0.15, -0.4, 0.05);
      key2.rotation.z = -0.3;

      keyGroup.add(ring, key1, key2);
      keyGroup.position.set(1.6, -1.2, 0.8);
      keyGroup.rotation.set(-0.4, -0.3, 0.4);
      scene.add(keyGroup);
      floatingObjects.push(keyGroup);

      // --- 5. FLOATING GLASS PANEL ---
      const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.08), glassMaterial);
      glassPanel.position.set(0.2, 0.2, -1.0);
      glassPanel.rotation.set(-0.15, 0.2, -0.1);
      scene.add(glassPanel);
      floatingObjects.push(glassPanel);

      // --- 6. PARTICLES (CAMPUS AMBIENT SPARKS) ---
      const particleCount = 65;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorGold = new THREE.Color(0xd9a441);
      const colorSilver = new THREE.Color(0xe8edf2);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

        const c = Math.random() > 0.5 ? colorGold : colorSilver;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // --- MOUSE TRACKING ---
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };

      window.addEventListener('mousemove', handleMouseMove);

      // --- RESIZE LISTENER ---
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // --- ANIMATION LOOP ---
      const startTime = performance.now();

      const animate = (currentTime: number = performance.now()) => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsed = (currentTime - startTime) * 0.001;

        // Smooth mouse damping
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        camera.position.x = targetX * 0.6;
        camera.position.y = targetY * 0.4;
        camera.lookAt(0, 0, 0);

        // Gentle organic floating oscillations
        floatingObjects.forEach((obj, idx) => {
          const speed = 0.8 + idx * 0.15;
          const offset = idx * 1.2;
          obj.position.y += Math.sin(elapsed * speed + offset) * 0.0025;
          obj.rotation.x += Math.cos(elapsed * 0.4 + offset) * 0.0015;
          obj.rotation.y += Math.sin(elapsed * 0.5 + offset) * 0.002;
        });

        // Slow particle rotation
        particles.rotation.y = elapsed * 0.02;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn('WebGL initialization failed, rendering static fallback:', err);
      setHasWebGL(false);
    }
  }, [reducedMotion]);

  if (reducedMotion || !hasWebGL) {
    return (
      <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden glass-card flex items-center justify-center p-8 border border-[#E8EDF2]/10">
        <div className="absolute inset-0 bg-radial from-[#30152F]/70 via-[#1D1020]/90 to-[#1D1020]" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D9A441] to-[#30152F] flex items-center justify-center shadow-xl border border-[#D9A441]/40">
            <svg className="w-10 h-10 text-[#E8EDF2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#E8EDF2] tracking-wide">GNIOT Intelligent Recovery</p>
          <p className="text-xs text-[#BFC8D2] mt-1">High-fidelity 3D spatial indexing for campus belongings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden pointer-events-auto">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D campus belongings visualization"
      />
      {/* Subtle bottom gradient vignette */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1D1020] to-transparent pointer-events-none" />
      <div className="absolute top-3 right-4 pointer-events-none">
        <span className="text-[11px] font-mono tracking-wider text-[#BFC8D2]/60 uppercase">
          Interactive 3D Canvas · Drag to Orbit
        </span>
      </div>
    </div>
  );
};
