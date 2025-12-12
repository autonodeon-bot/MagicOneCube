import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const Labyrinth: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins } = useGame();
  
  const [win, setWin] = useState(false);

  // Level Map (1 = Wall, 0 = Path, S = Start, E = End)
  const mapLayout = [
      "1111111111",
      "1S00001001",
      "1011101011",
      "1000100001",
      "1110111101",
      "1000000001",
      "1011111101",
      "1000001E01",
      "1111111111"
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0c15);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5, 10, 5); // Isometric-ish view
    camera.lookAt(5, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 5);
    scene.add(dl);

    // Build Maze
    const walls: THREE.Box3[] = [];
    let startPos = new THREE.Vector3();
    let endPos = new THREE.Vector3();

    mapLayout.forEach((row, z) => {
        row.split('').forEach((char, x) => {
            if (char === '1') {
                const geo = new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
                const wall = new THREE.Mesh(geo, mat);
                wall.position.set(x, 0.5, z);
                scene.add(wall);
                walls.push(new THREE.Box3().setFromObject(wall));
            } else if (char === 'S') {
                startPos.set(x, 0.5, z);
            } else if (char === 'E') {
                endPos.set(x, 0.1, z);
                // Draw Goal
                const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
                const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const goal = new THREE.Mesh(geo, mat);
                goal.position.set(x, 0.05, z);
                scene.add(goal);
            }
        });
    });

    // Player Ball
    const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.8, roughness: 0.1 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.copy(startPos);
    scene.add(ball);

    // Physics State
    const velocity = new THREE.Vector3(0,0,0);
    const friction = 0.95;
    const attractor = new THREE.Vector3();
    let attracting = false;

    // Mouse/Touch Interaction
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); // Ground plane
    const mouse = new THREE.Vector2();

    const updateAttractor = (clientX: number, clientY: number) => {
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, attractor);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
        attracting = true;
        const x = (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
        const y = (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;
        updateAttractor(x, y);
    };
    const onUp = () => attracting = false;
    const onMove = (e: MouseEvent | TouchEvent) => {
        if (attracting) {
            const x = (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
            const y = (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;
            updateAttractor(x, y);
        }
    };

    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchstart', onDown);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchmove', onMove);

    // Visual Magnet Indicator
    const markerGeo = new THREE.RingGeometry(0.3, 0.4, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0055, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = Math.PI/2;
    marker.position.y = 0.1;
    scene.add(marker);

    const animate = () => {
        if (win) return;
        requestAnimationFrame(animate);

        // Update Marker
        marker.position.x = attractor.x;
        marker.position.z = attractor.z;
        marker.visible = attracting;

        // Physics
        if (attracting) {
            const dir = new THREE.Vector3().subVectors(attractor, ball.position);
            dir.y = 0; // Flat movement
            const dist = dir.length();
            if (dist > 0.1) {
                dir.normalize().multiplyScalar(0.015); // Force
                velocity.add(dir);
            }
        }

        velocity.multiplyScalar(friction);
        const nextPos = ball.position.clone().add(velocity);

        // Collision detection (Simple AABB-Sphere approx)
        const ballBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(0.6,0.6,0.6));
        let collided = false;
        
        for (const wall of walls) {
            if (wall.intersectsBox(ballBox)) {
                // Bounce logic simplified: just reverse velocity on collision
                velocity.multiplyScalar(-0.5);
                collided = true;
                break; 
            }
        }

        if (!collided) {
            ball.position.copy(nextPos);
        }

        // Camera Follow
        camera.position.x += (ball.position.x - camera.position.x + 0) * 0.1;
        camera.position.z += (ball.position.z - camera.position.z + 8) * 0.1;
        camera.lookAt(ball.position.x, 0, ball.position.z);

        // Check Win
        if (ball.position.distanceTo(endPos) < 0.5) {
            setWin(true);
            addCoins(300);
        }

        renderer.render(scene, camera);
    };
    animate();

    return () => {
        // Cleanup listeners
        window.removeEventListener('mousedown', onDown);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchstart', onDown);
        window.removeEventListener('touchend', onUp);
        window.removeEventListener('touchmove', onMove);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [win]);

  return (
    <div className="w-full h-full relative">
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       <div className="absolute top-4 w-full text-center pointer-events-none">
           <h2 className="text-xl font-bold text-white">LABYRINTH</h2>
           <p className="text-xs text-gray-400">Touch & Hold to attract the ball</p>
       </div>

       {win && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur z-50">
               <h1 className="text-4xl font-black text-green-400 mb-4">ESCAPED!</h1>
               <p className="text-white mb-6">+300 MC</p>
               <button onClick={() => navigate('/')} className="px-6 py-2 bg-neon-blue text-black font-bold rounded">Continue</button>
           </div>
       )}

       <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};