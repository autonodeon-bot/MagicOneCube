import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { TextureFactory } from '../utils/TextureFactory';
import { UpgradeType } from '../types';

export const CubeSurfer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, getUpgradeLevel } = useGame();
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const playerRef = useRef<THREE.Group>(new THREE.Group());
  const cubesStackRef = useRef<THREE.Mesh[]>([]);
  const obstaclesRef = useRef<THREE.Group>(new THREE.Group());
  
  const speedRef = useRef(0.2);
  const laneRef = useRef(0); // -1, 0, 1

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, -8);
    camera.lookAt(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(-10, 20, -10);
    dl.castShadow = true;
    scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 1000);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = 500;
    scene.add(floor);

    // Player
    scene.add(playerRef.current);
    addPlayerCube();

    // Obstacles Pool
    scene.add(obstaclesRef.current);
    
    // Shield Upgrade
    const hasShield = getUpgradeLevel(UpgradeType.MAGNET_SHIELD) > 0;

    let distance = 0;
    let nextSpawn = 20;

    const animate = () => {
        if (gameOver) return;
        requestAnimationFrame(animate);

        distance += speedRef.current;
        playerRef.current.position.z = distance;
        camera.position.z = distance - 8;
        
        // Smooth Lane Move
        playerRef.current.position.x += (laneRef.current * 2 - playerRef.current.position.x) * 0.1;

        // Spawn Obstacles
        if (distance > nextSpawn) {
            spawnChunk(distance + 50);
            nextSpawn += 20;
        }

        // Collision Check
        checkCollisions();

        renderer.render(scene, camera);
        setScore(Math.floor(distance));
    };
    animate();

    return () => {
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [gameOver]);

  const addPlayerCube = () => {
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = TextureFactory.getMaterial('MAGMA', 0xffaa00);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = cubesStackRef.current.length + 0.5;
      playerRef.current.add(mesh);
      cubesStackRef.current.push(mesh);
  };

  const removePlayerCube = () => {
      const mesh = cubesStackRef.current.shift(); // remove bottom
      if (mesh) {
          playerRef.current.remove(mesh);
          // shift others down
          cubesStackRef.current.forEach(c => c.position.y -= 1);
      }
      if (cubesStackRef.current.length === 0) {
          setGameOver(true);
          addCoins(Math.floor(score / 2));
      }
  };

  const spawnChunk = (z: number) => {
      const type = Math.random();
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      
      if (type > 0.5) {
          // Pickup Cube
          const geo = new THREE.BoxGeometry(1, 1, 1);
          const mat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(lane * 2, 0.5, z);
          mesh.userData = { type: 'pickup' };
          obstaclesRef.current.add(mesh);
      } else {
          // Wall
          const height = Math.floor(Math.random() * 3) + 1;
          const geo = new THREE.BoxGeometry(1, height, 1);
          const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(lane * 2, height/2, z);
          mesh.userData = { type: 'wall', height };
          obstaclesRef.current.add(mesh);
      }
  };

  const checkCollisions = () => {
      const playerBox = new THREE.Box3().setFromObject(playerRef.current);
      obstaclesRef.current.children.forEach(obj => {
          const box = new THREE.Box3().setFromObject(obj);
          if (box.intersectsBox(playerBox)) {
              if (obj.userData.type === 'pickup') {
                  addPlayerCube();
                  obstaclesRef.current.remove(obj);
              } else if (obj.userData.type === 'wall') {
                  // Hit wall logic
                  // Simplification: assume hit bottom
                  removePlayerCube();
                  obstaclesRef.current.remove(obj);
              }
          }
      });
  };

  const handleInput = (d: number) => {
      laneRef.current = Math.max(-1, Math.min(1, laneRef.current + d));
  };

  return (
    <div className="w-full h-full relative" onClick={(e) => {
        const x = e.clientX / window.innerWidth;
        handleInput(x > 0.5 ? 1 : -1);
    }}>
      <div ref={mountRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 text-white drop-shadow-md">
          <h1 className="text-2xl font-bold">CUBE SURFER</h1>
          <p>Distance: {score}m</p>
          <p className="text-xs">Tap Left/Right to move</p>
      </div>

      {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                  <h2 className="text-3xl font-bold text-red-500">WIPEOUT!</h2>
                  <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-neon-blue text-black rounded font-bold">RESTART</button>
                  <button onClick={() => navigate('/')} className="mt-2 block w-full text-gray-400">MENU</button>
              </div>
          </div>
      )}
      
       <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="absolute top-4 right-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};