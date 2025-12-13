import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const Labyrinth: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addCoins, setGameScore } = useGame();
  
  const [gameState, setGameState] = useState<'PLAYING' | 'WIN' | 'LOSE'>('PLAYING');
  const [collectedCoins, setCollectedCoins] = useState(0);

  // Level Map (1 = Wall, 0 = Path, S = Start, E = End, X = Enemy Horizontal, Y = Enemy Vertical, C = Coin)
  const mapLayout = [
      "1111111111",
      "1S000X0C01",
      "1011101011",
      "1C00100001",
      "1110111101",
      "100Y00C001",
      "1011111101",
      "1C00X01E01",
      "1111111111"
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0c15);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5, 12, 8); // Isometric-ish view
    camera.lookAt(5, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 15, 5);
    dl.castShadow = true;
    scene.add(dl);

    // Objects Lists
    const walls: THREE.Box3[] = [];
    const enemies: { mesh: THREE.Mesh, axis: 'x' | 'z', origin: THREE.Vector3, dir: number }[] = [];
    const coins: { mesh: THREE.Mesh, active: boolean, id: number }[] = [];
    
    let startPos = new THREE.Vector3();
    let endPos = new THREE.Vector3();

    // Parse Map
    mapLayout.forEach((row, z) => {
        row.split('').forEach((char, x) => {
            const posX = x;
            const posZ = z;

            if (char === '1') {
                const geo = new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshStandardMaterial({ color: 0x333344 });
                const wall = new THREE.Mesh(geo, mat);
                wall.position.set(posX, 0.5, posZ);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
                walls.push(new THREE.Box3().setFromObject(wall));
            } else if (char === 'S') {
                startPos.set(posX, 0.5, posZ);
            } else if (char === 'E') {
                endPos.set(posX, 0.1, posZ);
                // Goal
                const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
                const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const goal = new THREE.Mesh(geo, mat);
                goal.position.set(posX, 0.05, posZ);
                scene.add(goal);
                
                // Goal Beacon
                const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
                const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
                const beam = new THREE.Mesh(beamGeo, beamMat);
                beam.position.set(posX, 2.5, posZ);
                scene.add(beam);
            } else if (char === 'X' || char === 'Y') {
                // Enemy Drone
                const geo = new THREE.SphereGeometry(0.25, 16, 16);
                const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
                const drone = new THREE.Mesh(geo, mat);
                drone.position.set(posX, 0.5, posZ);
                scene.add(drone);
                
                // Drone Ring
                const ringGeo = new THREE.RingGeometry(0.3, 0.35, 16);
                const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2;
                drone.add(ring);

                enemies.push({
                    mesh: drone,
                    axis: char === 'X' ? 'x' : 'z',
                    origin: new THREE.Vector3(posX, 0.5, posZ),
                    dir: 1
                });
            } else if (char === 'C') {
                // Coin
                const geo = new THREE.OctahedronGeometry(0.2, 0);
                const mat = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 1, roughness: 0.1 });
                const coin = new THREE.Mesh(geo, mat);
                coin.position.set(posX, 0.5, posZ);
                scene.add(coin);
                coins.push({ mesh: coin, active: true, id: coins.length });
            }
        });
    });

    // Player Ball
    const ballGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.8, roughness: 0.1 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.copy(startPos);
    ball.castShadow = true;
    scene.add(ball);

    // Physics State
    const velocity = new THREE.Vector3(0,0,0);
    const friction = 0.95;
    const attractor = new THREE.Vector3();
    let attracting = false;

    // Interaction
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
    const mouse = new THREE.Vector2();

    const updateAttractor = (clientX: number, clientY: number) => {
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, attractor);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
        if (gameState !== 'PLAYING') return;
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

    // Marker
    const markerGeo = new THREE.RingGeometry(0.3, 0.4, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.5 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = Math.PI/2;
    marker.position.y = 0.1;
    scene.add(marker);

    // GAME LOOP
    let stopGame = false;
    const animate = () => {
        if (stopGame) return;
        requestAnimationFrame(animate);

        if (gameState !== 'PLAYING') return;

        // 1. Update Marker
        marker.position.x = attractor.x;
        marker.position.z = attractor.z;
        marker.visible = attracting;
        if (attracting) marker.rotation.z += 0.1;

        // 2. Player Physics
        if (attracting) {
            const dir = new THREE.Vector3().subVectors(attractor, ball.position);
            dir.y = 0;
            const dist = dir.length();
            if (dist > 0.1) {
                dir.normalize().multiplyScalar(0.02); // Force
                velocity.add(dir);
            }
        }
        velocity.multiplyScalar(friction);
        const nextPos = ball.position.clone().add(velocity);

        // 3. Collision (Walls)
        const ballBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(0.6,0.6,0.6));
        let collided = false;
        for (const wall of walls) {
            if (wall.intersectsBox(ballBox)) {
                velocity.multiplyScalar(-0.6); // Bounce
                collided = true;
                break; 
            }
        }
        if (!collided) ball.position.copy(nextPos);

        // 4. Enemies Logic
        const time = Date.now() * 0.002;
        enemies.forEach(enemy => {
            const range = 1.5;
            const offset = Math.sin(time) * range;
            
            if (enemy.axis === 'x') enemy.mesh.position.x = enemy.origin.x + offset;
            else enemy.mesh.position.z = enemy.origin.z + offset;

            // Check collision with player
            if (enemy.mesh.position.distanceTo(ball.position) < 0.6) {
                setGameState('LOSE');
                stopGame = true;
            }
        });

        // 5. Coins Logic
        coins.forEach(coin => {
            if (coin.active) {
                coin.mesh.rotation.y += 0.05;
                if (coin.mesh.position.distanceTo(ball.position) < 0.5) {
                    coin.active = false;
                    coin.mesh.visible = false;
                    setCollectedCoins(c => c + 1);
                }
            }
        });

        // 6. Camera Follow
        camera.position.x += (ball.position.x - camera.position.x) * 0.1;
        camera.position.z += (ball.position.z - camera.position.z + 8) * 0.1;
        camera.lookAt(ball.position.x, 0, ball.position.z);

        // 7. Check Win
        if (ball.position.distanceTo(endPos) < 0.5) {
            setGameState('WIN');
            stopGame = true;
            addCoins(300 + (collectedCoins * 50));
            setGameScore('game5', 300 + (collectedCoins * 50));
        }

        renderer.render(scene, camera);
    };
    animate();

    return () => {
        stopGame = true;
        window.removeEventListener('mousedown', onDown);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchstart', onDown);
        window.removeEventListener('touchend', onUp);
        window.removeEventListener('touchmove', onMove);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full relative">
       <div ref={mountRef} className="w-full h-full bg-mag-dark" />
       
       <div className="absolute top-4 w-full flex justify-between px-6 pointer-events-none">
           <div>
               <h2 className="text-xl font-bold text-white">ЛАБИРИНТ</h2>
               <p className="text-xs text-gray-400">Избегай дронов!</p>
           </div>
           <div className="text-yellow-400 font-bold text-xl">
               🪙 {collectedCoins}
           </div>
       </div>

       {gameState === 'WIN' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur z-50">
               <h1 className="text-4xl font-black text-green-400 mb-4">ПОБЕДА!</h1>
               <p className="text-white mb-2">Найдено монет: {collectedCoins}</p>
               <p className="text-neon-blue font-bold mb-6">+{300 + collectedCoins * 50} MC</p>
               <button onClick={() => navigate('/')} className="px-6 py-2 bg-neon-blue text-black font-bold rounded">Меню</button>
           </div>
       )}

       {gameState === 'LOSE' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur z-50">
               <h1 className="text-4xl font-black text-red-500 mb-4">ВАС ЗАМЕТИЛИ!</h1>
               <p className="text-gray-400 mb-6">Дрон охраны перехватил магнит.</p>
               <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white font-bold rounded">Рестарт</button>
           </div>
       )}

       <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/30 rounded-full text-white border border-white/20 flex items-center justify-center">✕</button>
    </div>
  );
};