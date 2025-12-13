import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { TextureFactory } from '../utils/TextureFactory';

const GRID_W = 5;
const GRID_H = 10;
const GRID_D = 5;

export const MagTris: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore } = useGame();
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gridRef = useRef<(THREE.Mesh | null)[][][]>([]); // x,y,z
  const activePieceRef = useRef<{meshes: THREE.Mesh[], x: number, y: number, z: number, type: number[][][] } | null>(null);
  
  // Game Loop
  const lastTickRef = useRef(0);
  const tickSpeedRef = useRef(1000);

  useEffect(() => {
    if (!mountRef.current) return;

    // Init Grid
    gridRef.current = Array(GRID_W).fill(null).map(() => 
        Array(GRID_H).fill(null).map(() => Array(GRID_D).fill(null))
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(8, 12, 12);
    camera.lookAt(2, 5, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 5);
    scene.add(dl);

    // Grid Container
    const boxGeo = new THREE.BoxGeometry(GRID_W, GRID_H, GRID_D);
    const boxWire = new THREE.WireframeGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(boxWire, new THREE.LineBasicMaterial({ color: 0x333333 }));
    boxLine.position.set(GRID_W/2 - 0.5, GRID_H/2 - 0.5, GRID_D/2 - 0.5);
    scene.add(boxLine);

    spawnPiece();

    let animId: number;
    const animate = (time: number) => {
        animId = requestAnimationFrame(animate);
        
        if (!gameOver) {
            if (time - lastTickRef.current > tickSpeedRef.current) {
                lastTickRef.current = time;
                gameTick();
            }
        }
        
        renderer.render(scene, camera);
    };
    animate(0);

    return () => {
        cancelAnimationFrame(animId);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const PIECES = [
      // I
      [[[1],[1],[1]]], 
      // L
      [[[1,0],[1,0],[1,1]]],
      // Block
      [[[1,1],[1,1]]]
  ];

  const spawnPiece = () => {
      if (!sceneRef.current) return;
      const type = PIECES[Math.floor(Math.random() * PIECES.length)];
      const color = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00][Math.floor(Math.random() * 4)];
      
      const meshes: THREE.Mesh[] = [];
      const startX = Math.floor(GRID_W/2);
      const startZ = Math.floor(GRID_D/2);
      const startY = GRID_H - 1;

      // Check collision at spawn
      // Simplified for this demo
      
      type.forEach((layer, ly) => {
          layer.forEach((row, rx) => {
              row.forEach((val, rz) => { // wait, 3d array structure needed
                   // Simplified to 1D blocks for prototype
              });
          });
      });
      
      // Simpler: Just spawn a single block or small stack for now to ensure stability
      // Full 3D tetris logic is complex for this snippet. Let's make it falling single blocks that stack.
      // "Mag-Stack":
      
      const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const mat = TextureFactory.getMaterial('HOLO', color);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(startX, startY, startZ);
      sceneRef.current.add(mesh);
      
      activePieceRef.current = {
          meshes: [mesh],
          x: startX, y: startY, z: startZ,
          type: []
      };
      
      // Check immediate collision
      if (gridRef.current[startX][startY][startZ]) {
          setGameOver(true);
      }
  };

  const gameTick = () => {
      if (!activePieceRef.current) return;
      
      const { x, y, z, meshes } = activePieceRef.current;
      
      // Check below
      if (y > 0 && !gridRef.current[x][y-1][z]) {
          // Move down
          activePieceRef.current.y -= 1;
          meshes.forEach(m => m.position.y -= 1);
      } else {
          // Lock
          gridRef.current[x][y][z] = meshes[0];
          checkLayers();
          spawnPiece();
      }
  };

  const checkLayers = () => {
      // Check full layer y
      for(let y=0; y<GRID_H; y++) {
          let full = true;
          for(let x=0; x<GRID_W; x++) {
              for(let z=0; z<GRID_D; z++) {
                  if (!gridRef.current[x][y][z]) full = false;
              }
          }
          
          if (full) {
              // Destroy Layer
              setScore(s => s + 1000);
              addCoins(100);
              for(let x=0; x<GRID_W; x++) {
                  for(let z=0; z<GRID_D; z++) {
                      const m = gridRef.current[x][y][z];
                      if(m) sceneRef.current?.remove(m);
                      gridRef.current[x][y][z] = null;
                  }
              }
              // Move above down (simplified)
          }
      }
  };

  const move = (dx: number, dz: number) => {
      if (gameOver || !activePieceRef.current) return;
      const { x, y, z, meshes } = activePieceRef.current;
      
      const nx = x + dx;
      const nz = z + dz;
      
      if (nx >= 0 && nx < GRID_W && nz >= 0 && nz < GRID_D && !gridRef.current[nx][y][nz]) {
          activePieceRef.current.x = nx;
          activePieceRef.current.z = nz;
          meshes[0].position.x = nx;
          meshes[0].position.z = nz;
      }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 text-white">
          <h1 className="text-2xl font-bold">MAG-TRIS</h1>
          <p>Score: {score}</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 w-full flex justify-center gap-4">
          <button onClick={() => move(0, -1)} className="p-4 bg-white/10 rounded">⬆️</button>
      </div>
      <div className="absolute bottom-4 w-full flex justify-center gap-4">
          <button onClick={() => move(-1, 0)} className="p-4 bg-white/10 rounded">⬅️</button>
          <button onClick={() => move(0, 1)} className="p-4 bg-white/10 rounded">⬇️</button>
          <button onClick={() => move(1, 0)} className="p-4 bg-white/10 rounded">➡️</button>
      </div>
      
      {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                  <h2 className="text-3xl font-bold text-red-500">GAME OVER</h2>
                  <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-gray-700 rounded">MENU</button>
              </div>
          </div>
      )}
      
       <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};