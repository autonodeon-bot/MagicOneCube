import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

// Game Constants
const BOX_HEIGHT = 1;
const MOVE_SPEED = 0.15;
const ERROR_MARGIN = 0.1;

export const MagnetTower: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore } = useGame();

  // React State for UI Overlay
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Game Logic Refs (mutable state outside react render cycle for performance)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stackRef = useRef<THREE.Mesh[]>([]);
  const currentCubeRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Gameplay State Refs
  const directionRef = useRef<'x' | 'z'>('x');
  const moveDeltaRef = useRef(MOVE_SPEED);
  const stackTopRef = useRef({ width: 3, depth: 3, x: 0, z: 0 }); // Current platform size/pos

  // Initialize Game
  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151621);
    sceneRef.current = scene;

    // CAMERA (Orthographic for tower)
    const aspect = window.innerWidth / window.innerHeight;
    const d = 10;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 0);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // BASE
    const baseGeo = new THREE.BoxGeometry(3, BOX_HEIGHT * 5, 3);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.5;
    scene.add(base);
    stackRef.current = [base];

    // Initial Stack State
    stackTopRef.current = { width: 3, depth: 3, x: 0, z: 0 };

    // Function to spawn new block
    const spawnBlock = (yPos: number) => {
        const { width, depth } = stackTopRef.current;
        const geometry = new THREE.BoxGeometry(width, BOX_HEIGHT, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5) 
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Decide spawn position based on direction
        const spawnDist = 6;
        if (directionRef.current === 'x') {
            mesh.position.set(-spawnDist, yPos, stackTopRef.current.z);
        } else {
            mesh.position.set(stackTopRef.current.x, yPos, -spawnDist);
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        currentCubeRef.current = mesh;
    };

    // Render Loop
    const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (!currentCubeRef.current || gameOver) {
            renderer.render(scene, camera);
            return;
        }

        const cube = currentCubeRef.current;
        
        // Move Cube
        if (directionRef.current === 'x') {
            cube.position.x += moveDeltaRef.current;
            if (cube.position.x > 6 || cube.position.x < -6) moveDeltaRef.current *= -1;
        } else {
            cube.position.z += moveDeltaRef.current;
            if (cube.position.z > 6 || cube.position.z < -6) moveDeltaRef.current *= -1;
        }

        renderer.render(scene, camera);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameRef.current);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        // Cleanup geometries/materials could go here
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game Logic Action
  const handleTap = useCallback(() => {
    if (gameOver) return;
    
    if (!started) {
        setStarted(true);
        // Spawn first block
        spawnBlockRef.current?.(0.5); // Y position just above base (-2.5 top is 0, so base top is at 0. But base height is 5, centered at -2.5. Top is 0. First block at 0.5 (height 1))
        return;
    }

    const currentBlock = currentCubeRef.current;
    if (!currentBlock) return;

    const { width: prevW, depth: prevD, x: prevX, z: prevZ } = stackTopRef.current;
    const { x: currX, z: currZ } = currentBlock.position;

    // Check Overlap
    let delta = 0;
    let newWidth = prevW;
    let newDepth = prevD;
    let newX = prevX;
    let newZ = prevZ;

    const isX = directionRef.current === 'x';

    if (isX) {
        delta = currX - prevX;
        newWidth = prevW - Math.abs(delta);
        newX = prevX + delta / 2;
    } else {
        delta = currZ - prevZ;
        newDepth = prevD - Math.abs(delta);
        newZ = prevZ + delta / 2;
    }

    // GAME OVER CONDITION
    if (isX && newWidth <= 0) { endGame(); return; }
    if (!isX && newDepth <= 0) { endGame(); return; }

    // SUCCESS: Trim the block
    currentBlock.scale.set(
        isX ? newWidth / prevW : 1, 
        1, 
        !isX ? newDepth / prevD : 1
    );
    currentBlock.position.set(newX, currentBlock.position.y, newZ);

    // Update Global Refs
    stackTopRef.current = { width: newWidth, depth: newDepth, x: newX, z: newZ };
    stackRef.current.push(currentBlock);
    
    // Score
    setScore(s => s + 1);

    // Switch Direction & Speed up slightly
    directionRef.current = directionRef.current === 'x' ? 'z' : 'x';
    // spawn next
    const nextY = 0.5 + (stackRef.current.length - 1) * 1; // Base is in stack
    
    // Move Camera Up
    if (cameraRef.current) {
        cameraRef.current.position.y += 1;
    }

    spawnBlockRef.current?.(nextY);

  }, [gameOver, started]);

  // Helper to bridge the gap between effect closure and callback
  const spawnBlockRef = useRef<(y: number) => void>();
  useEffect(() => {
     spawnBlockRef.current = (yPos: number) => {
        if (!sceneRef.current) return;
        const { width, depth } = stackTopRef.current;
        const geometry = new THREE.BoxGeometry(width, BOX_HEIGHT, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5) 
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Reset speed logic for difficulty could go here
        
        const spawnDist = 6;
        if (directionRef.current === 'x') {
            mesh.position.set(-spawnDist, yPos, stackTopRef.current.z);
        } else {
            mesh.position.set(stackTopRef.current.x, yPos, -spawnDist);
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneRef.current.add(mesh);
        currentCubeRef.current = mesh;
    };
  }, []);


  const endGame = () => {
    setGameOver(true);
    setStarted(false);
    
    // Award Coins based on score
    const coinsEarned = Math.floor(score * 10);
    addCoins(coinsEarned);
    setGameScore('game1', score);
    
    // Visual Fall Effect (Simple physics sim)
    if (currentCubeRef.current) {
        currentCubeRef.current.position.y -= 10;
        currentCubeRef.current.rotation.x = Math.random();
    }
  };

  const restart = () => {
    window.location.reload(); // Simple reload for this prototype to clear three.js state cleanly
  };

  return (
    <div className="relative w-full h-full bg-mag-dark">
      <div ref={mountRef} className="w-full h-full" onClick={handleTap} />
      
      {/* HUD */}
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none">
        <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            {score}
        </div>
      </div>

      {!started && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-black/60 p-6 rounded-xl backdrop-blur-md text-center animate-pulse">
              <h2 className="text-2xl font-bold text-neon-blue">НАЖМИ ЧТОБЫ НАЧАТЬ</h2>
              <p className="text-sm text-gray-300">Строй башню идеально ровно!</p>
           </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-mag-panel p-8 rounded-2xl border border-neon-purple text-center max-w-xs w-full">
              <h2 className="text-3xl font-bold text-white mb-2">ИГРА ОКОНЧЕНА</h2>
              <p className="text-gray-400 mb-4">Счет: {score}</p>
              <p className="text-neon-blue font-bold mb-6">+{Math.floor(score * 10)} MC</p>
              
              <div className="flex flex-col gap-3">
                <button 
                    onClick={restart}
                    className="w-full py-3 bg-neon-purple text-white font-bold rounded-lg hover:bg-purple-600 transition-colors"
                >
                    Ещё раз
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Главное меню
                </button>
              </div>
           </div>
        </div>
      )}
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
};