import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const BackgroundScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c15, 0.03);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xbc13fe, 2, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x222222, 
      roughness: 0.2, 
      metalness: 0.8,
      emissive: 0x111111,
      emissiveIntensity: 0.2
    });

    const cubes: { mesh: THREE.Mesh, speed: number, axis: THREE.Vector3 }[] = [];

    for (let i = 0; i < 30; i++) {
      const cube = new THREE.Mesh(geometry, material.clone());
      cube.position.x = (Math.random() - 0.5) * 30;
      cube.position.y = (Math.random() - 0.5) * 30;
      cube.position.z = (Math.random() - 0.5) * 10 - 5;
      
      const scale = Math.random() * 0.5 + 0.5;
      cube.scale.set(scale, scale, scale);

      // Random specific accent colors
      if (Math.random() > 0.7) {
        (cube.material as THREE.MeshStandardMaterial).emissive.setHex(Math.random() > 0.5 ? 0x00f3ff : 0xbc13fe);
        (cube.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
      }

      scene.add(cube);
      cubes.push({
        mesh: cube,
        speed: (Math.random() * 0.02) + 0.005,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
      });
    }

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      cubes.forEach(c => {
        c.mesh.rotateOnAxis(c.axis, c.speed);
        // Gentle float
        c.mesh.position.y += Math.sin(Date.now() * 0.001 + c.mesh.position.x) * 0.01;
      });

      // Mouse parallax simulation
      const time = Date.now() * 0.0005;
      camera.position.x = Math.sin(time) * 2;
      camera.position.y = Math.cos(time) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full -z-10 bg-mag-dark" />;
};