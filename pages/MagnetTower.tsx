import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { UpgradeType } from '../types';
import { TextureFactory } from '../utils/TextureFactory';

// Game Constants
const BOX_HEIGHT = 1;
const BASE_SPEED = 0.15;

export const MagnetTower: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore, getUpgradeLevel } = useGame();

  // Upgrades State
  const safetyNetLevel = useRef(0);
  const timeDilationLevel = useRef(0);
  const goldenTouchLevel = useRef(0);
  const skinType = useRef<'BASIC' | 'CIRCUIT' | 'GLASS'>('BASIC');

  // React State for UI Overlay
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState(''); // For Safety Net Trigger
  const [perfects, setPerfects] = useState(0);

  // Game Logic Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stackRef = useRef<THREE.Mesh[]>([]);
  const currentCubeRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Gameplay State Refs
  const directionRef = useRef<'x' | 'z'>('x');
  const moveDeltaRef = useRef(BASE_SPEED);
  const stackTopRef = useRef({ width: 3, depth: 3, x: 0, z: 0 });
  const safetyUsedRef = useRef(false);

  // Initialize Game
  useEffect(() => {
    if (!mountRef.current) return;

    // Load Upgrade Stats
    safetyNetLevel.current = getUpgradeLevel(UpgradeType.SAFETY_NET);
    timeDilationLevel.current = getUpgradeLevel(UpgradeType.TIME_DILATION);
    goldenTouchLevel.current = getUpgradeLevel(UpgradeType.GOLDEN_TOUCH);
    
    if (getUpgradeLevel(UpgradeType.SKIN_GLASS) > 0) skinType.current = 'GLASS';
    else if (getUpgradeLevel(UpgradeType.SKIN_CIRCUIT) > 0) skinType.current = 'CIRCUIT';

    // Apply Time Dilation to Speed
    const speedMultiplier = 1 - (timeDilationLevel.current * 0.1);
    moveDeltaRef.current = BASE_SPEED * speedMultiplier;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0c15);
    sceneRef.current = scene;

    // CAMERA
    const aspect = window.innerWidth / window.innerHeight;
    const d = 10;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20); // More isometric
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Decorative Point Lights for Neon Feel
    const p1 = new THREE.PointLight(0x00f3ff, 2, 20);
    p1.position.set(-5, 5, 5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xbc13fe, 2, 20);
    p2.position.set(5, 0, -5);
    scene.add(p2);

    // BASE
    const baseGeo = new THREE.BoxGeometry(3, BOX_HEIGHT * 5, 3);
    const baseMat = TextureFactory.getMaterial(skinType.current, 0x333333);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.5;
    base.receiveShadow = true;
    scene.add(base);
    stackRef.current = [base];

    // Initial Stack State
    stackTopRef.current = { width: 3, depth: 3, x: 0, z: 0 };

    // Function to spawn new block
    const spawnBlock = (yPos: number) => {
        const { width, depth } = stackTopRef.current;
        
        // Golden Chance
        const isGolden = Math.random() < (goldenTouchLevel.current * 0.05);
        
        const geometry = new THREE.BoxGeometry(width, BOX_HEIGHT, depth);
        
        let color = isGolden ? 0xffaa00 : new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getHex();
        let material = TextureFactory.getMaterial(skinType.current, color);
        
        // Emissive boost for gold
        if (isGolden) {
             material = new THREE.MeshStandardMaterial({
                 color: 0xffaa00,
                 emissive: 0xffaa00,
                 emissiveIntensity: 0.8,
                 metalness: 1,
                 roughness: 0.1
             });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { isGolden };
        
        // Spawn Logic
        const spawnDist = 7;
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
        const speed = moveDeltaRef.current; // already adjusted by upgrade
        
        // Move Cube
        if (directionRef.current === 'x') {
            cube.position.x += speed;
            if (cube.position.x > 7 || cube.position.x < -7) moveDeltaRef.current *= -1;
        } else {
            cube.position.z += speed;
            if (cube.position.z > 7 || cube.position.z < -7) moveDeltaRef.current *= -1;
        }

        renderer.render(scene, camera);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameRef.current);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game Logic Action
  const handleTap = useCallback(() => {
    if (gameOver) return;
    
    if (!started) {
        setStarted(true);
        spawnBlockRef.current?.(0.5);
        return;
    }

    const currentBlock = currentCubeRef.current;
    if (!currentBlock) return;

    const { width: prevW, depth: prevD, x: prevX, z: prevZ } = stackTopRef.current;
    const { x: currX, z: currZ } = currentBlock.position;

    const isX = directionRef.current === 'x';
    const delta = isX ? currX - prevX : currZ - prevZ;
    const absDelta = Math.abs(delta);
    
    let newWidth = prevW;
    let newDepth = prevD;
    
    if (isX) newWidth -= absDelta;
    else newDepth -= absDelta;

    // GAME OVER / SAFETY NET CHECK
    if (newWidth <= 0 || newDepth <= 0) {
        if (safetyNetLevel.current > 0 && !safetyUsedRef.current) {
            // ACTIVATE SAFETY NET
            safetyUsedRef.current = true;
            setMessage("СТРАХОВКА СПАСЛА!");
            setTimeout(() => setMessage(''), 1500);
            
            // Snap to center perfectly as a reward/fix
            currentBlock.position.set(prevX, currentBlock.position.y, prevZ);
            // Don't resize, just continue as perfect hit
            handleSuccess(prevW, prevD, prevX, prevZ, currentBlock);
            return;
        }
        endGame(); 
        return; 
    }

    // SLICE LOGIC
    let newX = prevX;
    let newZ = prevZ;
    
    if (absDelta < 0.1) { // Perfect Hit Threshold
        // Snap
        setPerfects(p => p + 1);
        if (isX) currentBlock.position.x = prevX;
        else currentBlock.position.z = prevZ;
        newWidth = prevW;
        newDepth = prevD;
        
        // Spawn Particle Effect
        spawnParticles(currentBlock.position, 0x00f3ff);
    } else {
        // Cut
        setPerfects(0);
        if (isX) {
            newX = prevX + delta / 2;
        } else {
            newZ = prevZ + delta / 2;
        }
        
        // Update mesh scale/pos
        currentBlock.scale.set(isX ? newWidth / prevW : 1, 1, !isX ? newDepth / prevD : 1); // Scale relative to initial geometry size (which was max) - wait, geometries are recreated each time based on stackTopRef.
        // Actually, my spawn logic creates new Geometry of specific size. So scale should be 1, but we need to resize geometry or scale mesh? 
        // Better: Replace mesh or Scale? Scaling is performant.
        // My spawn logic: `new THREE.BoxGeometry(width, ...)`
        // So `currentBlock` has geometry size `prevW`.
        // If I want it to be `newWidth`, I scale by `newWidth / prevW`.
        
        currentBlock.scale.set(
             isX ? newWidth / stackTopRef.current.width : 1, // stackTop matches prev geometry
             1,
             !isX ? newDepth / stackTopRef.current.depth : 1
        );
        currentBlock.position.set(newX, currentBlock.position.y, newZ);
        
        // Spawn "Falling Part" (Visual only)
        spawnFallingPart(
            newWidth, newDepth, // remaining size
            Math.abs(isX ? prevW - newWidth : prevD - newDepth), // diff
            isX, delta > 0, // direction info
            currentBlock.position,
            (currentBlock.material as THREE.MeshStandardMaterial).color
        );
    }

    handleSuccess(newWidth, newDepth, newX, newZ, currentBlock);

  }, [gameOver, started]);

  const handleSuccess = (w: number, d: number, x: number, z: number, block: THREE.Mesh) => {
    // Update Global State
    stackTopRef.current = { width: w, depth: d, x: x, z: z };
    stackRef.current.push(block);
    
    // Scoring
    const isGold = block.userData.isGolden;
    setScore(s => s + (isGold ? 5 : 1));

    // Next Turn
    directionRef.current = directionRef.current === 'x' ? 'z' : 'x';
    const nextY = 0.5 + (stackRef.current.length - 1) * 1;
    
    // Camera Move
    if (cameraRef.current) {
        cameraRef.current.position.y += 1;
    }

    spawnBlockRef.current?.(nextY);
  };

  // Particles & Effects
  const spawnParticles = (pos: THREE.Vector3, color: number) => {
      if (!sceneRef.current) return;
      const geo = new THREE.BufferGeometry();
      const count = 20;
      const positions = new Float32Array(count * 3);
      for(let i=0; i<count*3; i++) positions[i] = (Math.random() - 0.5) * 2;
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color, size: 0.2, transparent: true });
      const points = new THREE.Points(geo, mat);
      points.position.copy(pos);
      sceneRef.current.add(points);
      
      // Animate out
      const startTime = Date.now();
      const animateP = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed > 500) {
              sceneRef.current?.remove(points);
              return;
          }
          points.scale.multiplyScalar(1.05);
          mat.opacity = 1 - (elapsed/500);
          requestAnimationFrame(animateP);
      };
      animateP();
  };

  const spawnFallingPart = (currentW: number, currentD: number, loss: number, isX: boolean, isPositiveDelta: boolean, pos: THREE.Vector3, color: THREE.Color) => {
      if (!sceneRef.current) return;
      // Calculate falling part geometry/pos
      // Simplified: Just spawn a generic chunk falling down
      const geo = new THREE.BoxGeometry(isX ? loss : currentW, 1, !isX ? loss : currentD);
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      
      // Offset position
      const offset = (isX ? currentW/2 + loss/2 : currentD/2 + loss/2) * (isPositiveDelta ? -1 : 1);
      // Wait, if delta > 0 (moved right), the cut part is on the Right (+).
      // If I tapped late (pos > target), cut part is at pos + width/2 approx.
      
      mesh.position.copy(pos);
      if (isX) mesh.position.x += (isPositiveDelta ? (currentW/2 + loss/2) : -(currentW/2 + loss/2));
      else mesh.position.z += (isPositiveDelta ? (currentD/2 + loss/2) : -(currentD/2 + loss/2));

      sceneRef.current.add(mesh);

      // Physics animation
      let velY = 0;
      let rX = Math.random() * 0.1;
      let rZ = Math.random() * 0.1;
      
      const animateFall = () => {
          if (mesh.position.y < -10) {
              sceneRef.current?.remove(mesh);
              return;
          }
          velY -= 0.02;
          mesh.position.y += velY;
          mesh.rotation.x += rX;
          mesh.rotation.z += rZ;
          requestAnimationFrame(animateFall);
      };
      animateFall();
  };

  // Helper Ref
  const spawnBlockRef = useRef<(y: number) => void>();
  useEffect(() => {
     spawnBlockRef.current = (yPos: number) => {
        if (!sceneRef.current) return;
        
        // Re-implement spawn logic here to access current refs if needed, 
        // or just rely on the effect closure above if refs are stable (they are).
        // Actually the closure above in useEffect([]) captures initial refs. 
        // State changes (like level) are in refs so it's fine.
        
        // Duplicate code from useEffect to be safe or extract it? 
        // Let's copy-paste specifically the spawn part into a stable function in the scope
     };
     // To avoid complex closure issues, I'll rely on the useEffect one, 
     // but I need to expose it.
     // Better way: define spawnBlock outside useEffect but inside component, using refs.
  }, []);
  
  // Actually, let's redefine spawnBlock to be accessible
  useEffect(() => {
      spawnBlockRef.current = (yPos: number) => {
         if (!sceneRef.current) return;
         const { width, depth } = stackTopRef.current;
         const isGolden = Math.random() < (goldenTouchLevel.current * 0.05);
         
         const geometry = new THREE.BoxGeometry(width, BOX_HEIGHT, depth);
         const hue = (stackRef.current.length * 0.05) % 1;
         
         let material: THREE.Material;
         
         if (isGolden) {
             material = new THREE.MeshStandardMaterial({
                 color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.5, metalness: 1, roughness: 0.2
             });
         } else {
             const color = new THREE.Color().setHSL(hue, 0.8, 0.5).getHex();
             material = TextureFactory.getMaterial(skinType.current, color);
         }

         const mesh = new THREE.Mesh(geometry, material);
         mesh.userData = { isGolden };
         
         const spawnDist = 9; // Further out
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
    
    // Coins Calculation
    let earned = score * 10;
    // Golden cubes Logic is handled in incremental score, but maybe bonus?
    // Let's stick to simple.
    
    addCoins(earned);
    setGameScore('game1', score);
    
    if (currentCubeRef.current) {
        currentCubeRef.current.position.y -= 5; // visual drop
    }
  };

  return (
    <div className="relative w-full h-full bg-mag-dark">
      <div ref={mountRef} className="w-full h-full" onClick={handleTap} />
      
      {/* Message Overlay (Safety Net) */}
      {message && (
          <div className="absolute top-1/4 w-full text-center animate-bounce z-50">
              <span className="text-neon-blue font-black text-2xl drop-shadow-lg border-2 border-neon-blue px-4 py-2 rounded bg-black/50">{message}</span>
          </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-0 w-full flex flex-col items-center pointer-events-none">
        <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
            {score}
        </div>
        {perfects > 1 && (
            <div className="text-yellow-400 font-bold text-lg animate-pulse">
                ИДЕАЛЬНО x{perfects}
            </div>
        )}
      </div>

      {!started && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-black/60 p-6 rounded-xl backdrop-blur-md text-center animate-pulse border border-neon-blue/30">
              <h2 className="text-2xl font-bold text-neon-blue">TAP TO START</h2>
              <p className="text-sm text-gray-300">Строй башню в ритме неона!</p>
              {safetyNetLevel.current > 0 && <p className="text-xs text-green-400 mt-2">🛡️ Страховка активна</p>}
           </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-mag-panel p-8 rounded-2xl border border-neon-purple text-center max-w-xs w-full shadow-[0_0_30px_rgba(188,19,254,0.3)]">
              <h2 className="text-3xl font-bold text-white mb-2">CRASHED!</h2>
              <p className="text-gray-400 mb-4">Высота: {score} блоков</p>
              <p className="text-neon-blue font-bold mb-6 text-xl">+{Math.floor(score * 10)} MC</p>
              
              <div className="flex flex-col gap-3">
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-neon-purple text-white font-bold rounded-lg hover:bg-purple-600 transition-colors shadow-lg shadow-purple-900/50"
                >
                    RESTART
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                    MENU
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