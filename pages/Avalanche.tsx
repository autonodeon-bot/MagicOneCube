import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { TextureFactory } from '../utils/TextureFactory';

const ROWS = 9;
const COLS = 6;
const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

export const Avalanche: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore } = useGame();
  
  const [score, setScore] = useState(0);
  const [fever, setFever] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  
  // Grid Data: [col][row] -> Mesh | null
  const gridRef = useRef<(THREE.Mesh | null)[][]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  // Use generic return type to support both browser and node environments
  const feverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Init Grid
    gridRef.current = Array(COLS).fill(null).map(() => Array(ROWS).fill(null));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151621);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(COLS/2 - 0.5, ROWS/2, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(2, 5, 5);
    scene.add(dl);

    // Initial Fill
    fillGrid(scene);

    // Click Handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const meshes: THREE.Mesh[] = [];
        gridRef.current.forEach(col => col.forEach(m => { if(m) meshes.push(m) }));
        
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            const hit = intersects[0].object as THREE.Mesh;
            handleBlockClick(hit);
        }
    };
    window.addEventListener('click', onClick);

    const animate = () => {
        requestAnimationFrame(animate);
        // Lerp positions
        gridRef.current.forEach((col, x) => {
            col.forEach((mesh, y) => {
                if (mesh) {
                    mesh.position.y += (y - mesh.position.y) * 0.2; 
                    mesh.position.x += (x - mesh.position.x) * 0.2;
                    
                    if (isFeverMode) {
                        mesh.rotation.z += 0.1;
                        mesh.scale.setScalar(0.8 + Math.sin(Date.now() * 0.01) * 0.1);
                    } else {
                        mesh.rotation.z = 0;
                        mesh.scale.setScalar(0.9);
                    }
                }
            });
        });
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        window.removeEventListener('click', onClick);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [isFeverMode]); // Re-bind if fever mode changes (mostly for state access if needed, though using refs usually)

  // Use a ref for fever mode logic inside event handler if state is stale
  const isFeverRef = useRef(false);
  useEffect(() => { isFeverRef.current = isFeverMode; }, [isFeverMode]);

  const fillGrid = (scene: THREE.Scene) => {
      for(let x=0; x<COLS; x++) {
          for(let y=0; y<ROWS; y++) {
              if (!gridRef.current[x][y]) {
                  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                  const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
                  const mat = TextureFactory.getMaterial('BASIC', color); // Use existing factory
                  const mesh = new THREE.Mesh(geo, mat);
                  mesh.position.set(x, 15 + y, 0); // Start high
                  mesh.userData = { color, gridPos: {x, y} };
                  scene.add(mesh);
                  gridRef.current[x][y] = mesh;
              }
          }
      }
  };

  const handleBlockClick = (mesh: THREE.Mesh) => {
      const color = mesh.userData.color;
      const {x, y} = mesh.userData.gridPos;
      
      let toRemove: {x:number, y:number}[] = [];

      if (isFeverRef.current) {
          // Fever Mode: Explosion!
          // Remove 3x3 area
          for(let dx=-1; dx<=1; dx++) {
              for(let dy=-1; dy<=1; dy++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >=0 && nx < COLS && ny >=0 && ny < ROWS && gridRef.current[nx][ny]) {
                      toRemove.push({x: nx, y: ny});
                  }
              }
          }
      } else {
          // Standard Logic: Connected components
          const queue = [{x, y}];
          const visited = new Set<string>();
          
          while(queue.length > 0) {
              const curr = queue.pop()!;
              const key = `${curr.x},${curr.y}`;
              if (visited.has(key)) continue;
              visited.add(key);
              toRemove.push(curr);

              const neighbors = [{x:curr.x+1, y:curr.y}, {x:curr.x-1, y:curr.y}, {x:curr.x, y:curr.y+1}, {x:curr.x, y:curr.y-1}];
              neighbors.forEach(n => {
                  if (n.x>=0 && n.x<COLS && n.y>=0 && n.y<ROWS) {
                      const m = gridRef.current[n.x][n.y];
                      if (m && m.userData.color === color) {
                          queue.push(n);
                      }
                  }
              });
          }
          if (toRemove.length < 2) return; 
      }

      // Remove
      toRemove.forEach(({x, y}) => {
          const m = gridRef.current[x][y];
          if (m) sceneRef.current?.remove(m);
          gridRef.current[x][y] = null;
      });

      // Score & Fever
      const points = toRemove.length * (isFeverRef.current ? 20 : 10);
      setScore(s => s + points);
      setGameScore('game4', score + points);
      
      if (!isFeverRef.current) {
          setFever(prev => {
              const next = prev + toRemove.length * 5;
              if (next >= 100) {
                  triggerFever();
                  return 100;
              }
              return next;
          });
      }

      // Drop Logic
      for(let cx=0; cx<COLS; cx++) {
          const newCol: (THREE.Mesh | null)[] = [];
          for(let cy=0; cy<ROWS; cy++) {
              if (gridRef.current[cx][cy]) newCol.push(gridRef.current[cx][cy]);
          }
          // Refill
          while(newCol.length < ROWS) {
               const color = COLORS[Math.floor(Math.random() * COLORS.length)];
               const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
               const mat = TextureFactory.getMaterial('BASIC', color);
               const mesh = new THREE.Mesh(geo, mat);
               mesh.position.set(cx, ROWS + newCol.length + 2, 0);
               mesh.userData = { color, gridPos: {x:cx, y:0} };
               sceneRef.current?.add(mesh);
               newCol.push(mesh);
          }
          for(let cy=0; cy<ROWS; cy++) {
              gridRef.current[cx][cy] = newCol[cy];
              if (newCol[cy]) newCol[cy]!.userData.gridPos = {x:cx, y:cy};
          }
      }
  };

  const triggerFever = () => {
      setIsFeverMode(true);
      if (feverTimerRef.current) clearTimeout(feverTimerRef.current);
      
      // Countdown fever
      let duration = 5000;
      const interval = setInterval(() => {
          duration -= 100;
          setFever(f => Math.max(0, (duration / 5000) * 100));
          if (duration <= 0) {
              clearInterval(interval);
              setIsFeverMode(false);
              setFever(0);
          }
      }, 100);
      feverTimerRef.current = setTimeout(() => {}, 5000); // just holder
  };

  return (
    <div className="w-full h-full relative">
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-center pointer-events-none">
           <div>
              <span className="block text-4xl font-black text-white drop-shadow-md">{score}</span>
              <span className="text-xs text-gray-400">СЧЕТ</span>
           </div>

           <div className="flex flex-col items-end w-32">
               <span className={`text-xs font-bold ${isFeverMode ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                   {isFeverMode ? 'FEVER MODE!' : 'FEVER'}
               </span>
               <div className="w-full h-4 bg-black/50 border border-white/20 rounded-full overflow-hidden mt-1">
                   <div 
                     className={`h-full transition-all duration-200 ${isFeverMode ? 'bg-gradient-to-r from-yellow-500 to-red-600' : 'bg-neon-blue'}`} 
                     style={{ width: `${fever}%` }}
                   ></div>
               </div>
           </div>
       </div>

       {isFeverMode && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-ping opacity-20">
                   X2
               </h1>
           </div>
       )}
       
       <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center pointer-events-auto">✕</button>
    </div>
  );
};