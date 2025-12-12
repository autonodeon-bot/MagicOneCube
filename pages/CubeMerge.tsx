import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

const COLS = 5;
const ROWS = 8;
const SPACING = 1.2;
const COLORS = [0x00f3ff, 0xbc13fe, 0xff0055, 0xffaa00, 0x00ff66, 0xffffff];

export const CubeMerge: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore } = useGame();
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubesRef = useRef<(THREE.Mesh | null)[][]>(Array(COLS).fill(null).map(() => Array(ROWS).fill(null)));
  const nextColorIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151621);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040));

    // Grid Floor
    const gridHelper = new THREE.GridHelper(COLS * SPACING + 2, COLS, 0x333333, 0x111111);
    scene.add(gridHelper);

    // Slots Markers
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

  const spawnCube = (colIndex: number, colorIdx: number, rowIndex: number) => {
      if (!sceneRef.current) return;
      
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ 
          color: COLORS[colorIdx % COLORS.length],
          metalness: 0.5,
          roughness: 0.2
      });
      const cube = new THREE.Mesh(geometry, material);
      
      // Position
      const x = (colIndex - Math.floor(COLS/2)) * SPACING;
      const y = rowIndex * 1.0 + 0.5;
      
      // Start high for animation
      cube.position.set(x, 10, 0); 
      cube.userData = { colorIdx, targetY: y };
      
      sceneRef.current.add(cube);
      
      // Simple Drop Animation
      const animateDrop = () => {
          if (cube.position.y > cube.userData.targetY) {
              cube.position.y -= 0.5;
              requestAnimationFrame(animateDrop);
          } else {
              cube.position.y = cube.userData.targetY;
              checkMerge(colIndex, rowIndex);
          }
      };
      animateDrop();

      cubesRef.current[colIndex][rowIndex] = cube;
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
          
          // Remove both
          sceneRef.current?.remove(currentCube);
          sceneRef.current?.remove(belowCube);
          colStack[row] = null;
          colStack[row - 1] = null;

          // Score
          setScore(s => s + Math.pow(2, newIdx) * 10);

          // Create new merged cube at bottom position
          spawnCube(col, newIdx, row - 1);
          
          // Drop everything above down? 
          // For simplicity in this jam version, we just merged top two. 
          // A full system would shift array. Let's do simple shift:
          for(let r = row + 1; r < ROWS; r++) {
              if (colStack[r]) {
                  const c = colStack[r]!;
                  colStack[r] = null;
                  spawnCube(col, c.userData.colorIdx, r - 1);
                  sceneRef.current?.remove(c);
              }
          }
      } else {
          isAnimatingRef.current = false;
      }
  };

  const handleColumnClick = (e: React.MouseEvent) => {
      if (gameOver || isAnimatingRef.current) return;
      
      // Calculate normalized X to find column
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      // Map -1..1 to 0..4 approximately
      // FOV math is complex, let's use simple sections
      const colWidth = 2 / COLS;
      const colIndex = Math.floor((x + 1) / colWidth);
      
      if (colIndex >= 0 && colIndex < COLS) {
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
              spawnCube(colIndex, nextColorIndexRef.current, emptyRow);
              // Randomize next color (simple weighted)
              nextColorIndexRef.current = Math.floor(Math.random() * 2);
          }
      }
  };

  return (
    <div className="w-full h-full relative" onClick={handleColumnClick}>
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       <div className="absolute top-4 left-0 w-full text-center pointer-events-none">
           <span className="text-4xl font-black text-white drop-shadow-md">{score}</span>
       </div>

       <div className="absolute bottom-10 w-full text-center pointer-events-none text-gray-400 text-sm">
          Tap columns to drop cubes. Merge same colors!
       </div>

       {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-mag-panel p-8 rounded-2xl text-center border border-neon-purple">
              <h2 className="text-3xl font-bold text-white mb-2">FULL STACK!</h2>
              <p className="text-gray-400">Score: {score}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-neon-purple text-white rounded font-bold">Restart</button>
              <button onClick={() => navigate('/')} className="mt-2 block w-full text-sm text-gray-400">Menu</button>
           </div>
        </div>
      )}
       
       <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};