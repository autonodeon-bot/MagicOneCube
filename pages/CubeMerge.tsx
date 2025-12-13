import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { TextureFactory } from '../utils/TextureFactory';

const COLS = 5;
const ROWS = 8;
const SPACING = 1.2;
const COLORS = [0x00f3ff, 0xbc13fe, 0xff0055, 0xffaa00, 0x00ff66, 0xffffff];

export const CubeMerge: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore, user } = useGame();
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextColorIdx, setNextColorIdx] = useState(0); // State for UI
  const [bombAvailable, setBombAvailable] = useState(false); // Ability
  const [bombMode, setBombMode] = useState(false);

  // Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubesRef = useRef<(THREE.Mesh | null)[][]>(Array(COLS).fill(null).map(() => Array(ROWS).fill(null)));
  const nextColorRef = useRef(0); // Ref for logic
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    // Random initial color
    const initColor = Math.floor(Math.random() * 3); // Start with simpler colors
    nextColorRef.current = initColor;
    setNextColorIdx(initColor);

    if (!mountRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151621);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 13);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040, 0.5));
    
    // Aesthetic Lights
    const pl = new THREE.PointLight(0xbc13fe, 1, 20);
    pl.position.set(-5, 5, 0);
    scene.add(pl);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(COLS * SPACING + 2, COLS, 0x333333, 0x111111);
    scene.add(gridHelper);

    // Slots Markers with Glow
    for(let i=0; i<COLS; i++) {
        const markerGeo = new THREE.PlaneGeometry(1, 0.2);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        const x = (i - Math.floor(COLS/2)) * SPACING;
        marker.position.set(x, 0.05, 1);
        marker.rotation.x = -Math.PI / 2;
        scene.add(marker);
    }

    // Loop
    let animationId: number;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Charge bomb based on score
  useEffect(() => {
      if (score > 500 && !bombAvailable) setBombAvailable(true);
  }, [score, bombAvailable]);

  const spawnCube = (colIndex: number, colorIdx: number, rowIndex: number) => {
      if (!sceneRef.current) return;
      
      const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95); // Slightly smaller for gap
      const material = TextureFactory.getMaterial('GLASS', COLORS[colorIdx % COLORS.length]);
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Position
      const x = (colIndex - Math.floor(COLS/2)) * SPACING;
      const y = rowIndex * 1.0 + 0.5;
      
      // Start high for animation
      cube.position.set(x, 10, 0); 
      cube.userData = { colorIdx, targetY: y };
      cube.castShadow = true;
      cube.receiveShadow = true;
      
      sceneRef.current.add(cube);
      
      // Simple Drop Animation
      const animateDrop = () => {
          if (!cube) return; // safety
          if (cube.position.y > cube.userData.targetY) {
              cube.position.y -= 0.6; // Faster drop
              requestAnimationFrame(animateDrop);
          } else {
              cube.position.y = cube.userData.targetY;
              // Bounce effect
              createBounceEffect(cube);
              checkMerge(colIndex, rowIndex);
          }
      };
      animateDrop();

      cubesRef.current[colIndex][rowIndex] = cube;
  };

  const createBounceEffect = (cube: THREE.Mesh) => {
      let bounce = 0;
      const originalY = cube.position.y;
      const anim = () => {
          bounce += 0.2;
          cube.position.y = originalY + Math.sin(bounce) * 0.2;
          if (bounce < Math.PI) requestAnimationFrame(anim);
          else cube.position.y = originalY;
      };
      anim();
  };

  const spawnParticles = (pos: THREE.Vector3, color: number) => {
      if (!sceneRef.current) return;
      const geo = new THREE.BufferGeometry();
      const count = 15;
      const positions = new Float32Array(count * 3);
      for(let i=0; i<count*3; i++) positions[i] = (Math.random() - 0.5) * 2;
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color, size: 0.2, transparent: true });
      const points = new THREE.Points(geo, mat);
      points.position.copy(pos);
      sceneRef.current.add(points);
      
      setTimeout(() => { sceneRef.current?.remove(points); }, 500);
  };

  const checkMerge = (col: number, row: number) => {
      const colStack = cubesRef.current[col];
      const currentCube = colStack[row];
      if (!currentCube || row === 0) {
          isAnimatingRef.current = false;
          return;
      }

      const belowCube = colStack[row - 1];
      if (belowCube && belowCube.userData.colorIdx === currentCube.userData.colorIdx) {
          // Merge!
          const newIdx = currentCube.userData.colorIdx + 1;
          const color = COLORS[newIdx % COLORS.length];

          spawnParticles(currentCube.position, color);

          // Remove both
          sceneRef.current?.remove(currentCube);
          sceneRef.current?.remove(belowCube);
          colStack[row] = null;
          colStack[row - 1] = null;

          // Score
          setScore(s => s + Math.pow(2, newIdx) * 10);

          // Create new merged cube at bottom position
          spawnCube(col, newIdx, row - 1);
          
          // Drop everything above down
          for(let r = row + 1; r < ROWS; r++) {
              if (colStack[r]) {
                  const c = colStack[r]!;
                  colStack[r] = null;
                  c.userData.targetY = (r - 1) * 1.0 + 0.5; // Update target
                  // We need to re-trigger drop animation or just snap + logic
                  // For simplicity, let's remove and respawn logically
                  sceneRef.current?.remove(c);
                  spawnCube(col, c.userData.colorIdx, r - 1);
              }
          }
      } else {
          isAnimatingRef.current = false;
      }
  };

  const useBomb = (colIndex: number) => {
      if (!bombAvailable || isAnimatingRef.current) return;
      
      isAnimatingRef.current = true;
      const colStack = cubesRef.current[colIndex];
      
      // Explosion Effect
      const x = (colIndex - Math.floor(COLS/2)) * SPACING;
      spawnParticles(new THREE.Vector3(x, 2, 0), 0xff0000);

      // Remove bottom 3 cubes
      let removedCount = 0;
      for(let r=0; r<3; r++) {
          if (colStack[r]) {
              sceneRef.current?.remove(colStack[r]!);
              colStack[r] = null;
              removedCount++;
          }
      }
      
      // Shift others down
      for(let r = 3; r < ROWS; r++) {
            if (colStack[r]) {
                const c = colStack[r]!;
                sceneRef.current?.remove(c);
                colStack[r] = null;
                spawnCube(colIndex, c.userData.colorIdx, r - removedCount);
            }
      }

      setBombAvailable(false);
      setBombMode(false);
      // Wait for animations
      setTimeout(() => { isAnimatingRef.current = false; }, 500);
  };

  const handleColumnClick = (e: React.MouseEvent) => {
      if (gameOver) return;
      
      // Calculate normalized X to find column
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const colWidth = 2 / COLS;
      const colIndex = Math.floor((x + 1) / colWidth);
      
      if (colIndex >= 0 && colIndex < COLS) {
          if (bombMode) {
              useBomb(colIndex);
              return;
          }

          if (isAnimatingRef.current) return;

          // Find first empty row
          const colStack = cubesRef.current[colIndex];
          let emptyRow = -1;
          for(let r=0; r<ROWS; r++) {
              if (!colStack[r]) {
                  emptyRow = r;
                  break;
              }
          }

          if (emptyRow === -1) {
              // Column full -> Game Over
              setGameOver(true);
              addCoins(Math.floor(score / 5));
              setGameScore('game2', score);
          } else {
              isAnimatingRef.current = true;
              spawnCube(colIndex, nextColorRef.current, emptyRow);
              
              // Randomize next color
              const newNext = Math.floor(Math.random() * COLORS.length);
              nextColorRef.current = newNext;
              setNextColorIdx(newNext);
          }
      }
  };

  return (
    <div className="w-full h-full relative" onClick={handleColumnClick}>
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       {/* UI Layer */}
       <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start">
           <div>
              <span className="block text-4xl font-black text-white drop-shadow-md">{score}</span>
              <span className="text-xs text-gray-400">СЧЕТ</span>
           </div>
           
           <div className="flex flex-col items-center bg-black/40 p-2 rounded-lg border border-white/10">
               <span className="text-[10px] text-gray-400 mb-1">ДАЛЕЕ</span>
               <div 
                 className="w-10 h-10 rounded border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                 style={{ backgroundColor: '#' + new THREE.Color(COLORS[nextColorIdx % COLORS.length]).getHexString() }}
               ></div>
           </div>
       </div>

       {/* Ability Button */}
       <div className="absolute bottom-20 w-full flex justify-center pointer-events-auto">
           <button 
             onClick={(e) => { e.stopPropagation(); if(bombAvailable) setBombMode(!bombMode); }}
             className={`px-6 py-3 rounded-full font-bold transition-all border-2 flex items-center gap-2 ${
                 bombAvailable 
                 ? (bombMode ? 'bg-red-600 border-white animate-pulse scale-110' : 'bg-neon-purple border-neon-blue hover:scale-105') 
                 : 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
             }`}
           >
               <span>💣</span>
               <span>{bombMode ? 'ВЫБЕРИ СТОЛБЕЦ' : 'БОМБА (500 pts)'}</span>
           </button>
       </div>

       <div className="absolute bottom-8 w-full text-center pointer-events-none text-gray-400 text-xs">
          {bombMode ? 'Нажми на столбец, чтобы взорвать низ!' : 'Нажимай на столбцы, чтобы бросить куб.'}
       </div>

       {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
           <div className="bg-mag-panel p-8 rounded-2xl text-center border border-neon-purple">
              <h2 className="text-3xl font-bold text-white mb-2">СТАК ЗАПОЛНЕН!</h2>
              <p className="text-gray-400">Счет: {score}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-neon-purple text-white rounded font-bold">Заново</button>
              <button onClick={() => navigate('/')} className="mt-2 block w-full text-sm text-gray-400">Меню</button>
           </div>
        </div>
      )}
       
       <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center pointer-events-auto">✕</button>
    </div>
  );
};