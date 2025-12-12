import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const MagneticPuzzle: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins } = useGame();
  
  const [level, setLevel] = useState(1);
  const [completed, setCompleted] = useState(false);

  // Puzzle State
  // Target shape: simplified array of vectors
  const targets = [
      [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:0,y:1,z:0}], // L shape
      [{x:0,y:0,z:0}, {x:0,y:1,z:0}, {x:0,y:2,z:0}, {x:1,y:1,z:0}], // T shape
      [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:1,y:1,z:0}, {x:0,y:1,z:1}], // Twisted
  ];

  const currentTargetRef = useRef<THREE.Vector3[]>([]);
  const placedBlocksRef = useRef<THREE.Mesh[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Load level
    const targetIdx = (level - 1) % targets.length;
    currentTargetRef.current = targets[targetIdx].map(p => new THREE.Vector3(p.x, p.y, p.z));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151621);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0xffaa00, 1, 20);
    pl.position.set(5,5,5);
    scene.add(pl);

    // Build "Ghost" Target (Visual Guide)
    const ghostGroup = new THREE.Group();
    // Offset ghost to left
    ghostGroup.position.x = -2;
    currentTargetRef.current.forEach(pos => {
        const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        ghostGroup.add(mesh);
    });
    scene.add(ghostGroup);
    
    // Ghost Label
    // (In pure three.js text is hard, we rely on UI overlay)

    // Build Grid for placing (Invisible click targets)
    const gridGroup = new THREE.Group();
    gridGroup.position.x = 2; // Offset workspace to right
    for(let x=-1; x<=2; x++) {
        for(let y=-1; y<=2; y++) {
            for(let z=-1; z<=2; z++) {
                const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
                const mat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.1, visible: false }); // Invisible hitboxes
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(x,y,z);
                mesh.userData = { isGrid: true, gridPos: new THREE.Vector3(x,y,z) };
                gridGroup.add(mesh);
            }
        }
    }
    scene.add(gridGroup);

    // Helpers
    const axesHelper = new THREE.AxesHelper(1);
    gridGroup.add(axesHelper);

    // Interaction Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        if (completed) return;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(gridGroup.children);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const gridPos = hit.object.userData.gridPos as THREE.Vector3;
            
            // Check if block already exists there
            const existingIdx = placedBlocksRef.current.findIndex(b => b.position.equals(gridPos.clone().add(gridGroup.position)));
            
            if (existingIdx >= 0) {
                // Remove
                scene.remove(placedBlocksRef.current[existingIdx]);
                placedBlocksRef.current.splice(existingIdx, 1);
            } else {
                // Add
                const geo = new THREE.BoxGeometry(1,1,1);
                const mat = new THREE.MeshStandardMaterial({ color: 0xff0055 });
                const mesh = new THREE.Mesh(geo, mat);
                // Adjust for group offset manually since we add to Scene root
                mesh.position.copy(gridPos).add(gridGroup.position);
                scene.add(mesh);
                placedBlocksRef.current.push(mesh);
                
                // Sound effect logic would go here
            }
        }
    };
    window.addEventListener('click', onClick);

    const animate = () => {
        requestAnimationFrame(animate);
        ghostGroup.rotation.y += 0.01; // Rotate target for visibility
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        window.removeEventListener('click', onClick);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [level, completed]);

  const checkSolution = () => {
      // Normalize placed blocks relative to their center/min? 
      // Simplified: Just match relative coords.
      // We placed blocks at gridGroup.position + local. 
      // Ghost is at -2. We need to check if pattern matches.
      
      const placed = placedBlocksRef.current.map(b => b.position.clone().sub(new THREE.Vector3(2,0,0)).round());
      const target = currentTargetRef.current; // Relative to 0,0,0

      if (placed.length !== target.length) {
          alert("Incorrect number of blocks!");
          return;
      }

      // Very naive match: check if every target point exists in placed array
      // (This requires user to build in exact same relative coordinates, which is hard. 
      // Better: find offset)
      
      // Find min bounds
      const getMin = (arr: THREE.Vector3[]) => {
          const min = new THREE.Vector3(Infinity, Infinity, Infinity);
          arr.forEach(v => min.min(v));
          return min;
      };

      const minP = getMin(placed);
      const minT = getMin(target);
      const offset = minT.clone().sub(minP);

      const normalizedPlaced = placed.map(p => p.clone().add(offset));

      let matchCount = 0;
      normalizedPlaced.forEach(p => {
          if (target.find(t => t.distanceTo(p) < 0.1)) matchCount++;
      });

      if (matchCount === target.length) {
          setCompleted(true);
          addCoins(500);
          setTimeout(() => {
              setLevel(l => l + 1);
              setCompleted(false);
              // Clean scene manual reload
              placedBlocksRef.current = [];
          }, 1500);
      } else {
          alert("Shape doesn't match! Try to align it like the ghost.");
      }
  };

  return (
    <div className="w-full h-full relative">
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       <div className="absolute top-4 w-full text-center pointer-events-none">
           <h2 className="text-xl font-bold text-white">LEVEL {level}</h2>
           <p className="text-xs text-gray-400">Replicate the rotating shape on the right grid</p>
       </div>

       {completed && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur pointer-events-none">
               <h1 className="text-4xl font-black text-green-400 animate-bounce">MATCHED!</h1>
           </div>
       )}

       <div className="absolute bottom-10 w-full flex justify-center gap-4">
           <button onClick={() => { placedBlocksRef.current.forEach(b => sceneRef.current?.remove(b)); placedBlocksRef.current = []; }} className="px-6 py-2 bg-red-900/80 text-white rounded font-bold border border-red-500">
               CLEAR
           </button>
           <button onClick={checkSolution} className="px-6 py-2 bg-neon-blue text-black rounded font-bold hover:scale-105 transition-transform">
               CHECK MAGNETISM
           </button>
       </div>

       <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};