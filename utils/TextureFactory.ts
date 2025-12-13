import * as THREE from 'three';

// Utility to generate procedural textures on the fly
export const TextureFactory = {
  createCircuitTexture: (color: string = '#00f3ff'): THREE.CanvasTexture => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, size, size);

    // Circuit Lines
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.moveTo(x, y);
        
        // Draw random path
        let cx = x;
        let cy = y;
        for(let j=0; j<3; j++) {
            if (Math.random() > 0.5) cx += (Math.random() - 0.5) * 200;
            else cy += (Math.random() - 0.5) * 200;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        
        // Node
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    // Tech borders
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.strokeRect(0,0,size,size);

    return new THREE.CanvasTexture(canvas);
  },

  createGridTexture: (color: string = '#ffffff'): THREE.CanvasTexture => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#151621';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;

    // Grid
    ctx.beginPath();
    for(let i=0; i<=size; i+=32) {
        ctx.moveTo(i, 0); ctx.lineTo(i, size);
        ctx.moveTo(0, i); ctx.lineTo(size, i);
    }
    ctx.stroke();

    // Emissive center
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);

    return new THREE.CanvasTexture(canvas);
  },
  
  // Creates a shiny metallic material setup
  getMaterial: (type: 'BASIC' | 'CIRCUIT' | 'GLASS', color: number): THREE.Material => {
     const colorStr = '#' + new THREE.Color(color).getHexString();
     
     if (type === 'CIRCUIT') {
         const tex = TextureFactory.createCircuitTexture(colorStr);
         return new THREE.MeshStandardMaterial({
             map: tex,
             color: color,
             roughness: 0.2,
             metalness: 0.8,
             emissive: color,
             emissiveIntensity: 0.4
         });
     }
     
     if (type === 'GLASS') {
         return new THREE.MeshPhysicalMaterial({
             color: color,
             metalness: 0.1,
             roughness: 0.05,
             transmission: 0.9, // Add transparency
             thickness: 1.0,
             emissive: color,
             emissiveIntensity: 0.2
         });
     }
     
     // Default improved basic
     const tex = TextureFactory.createGridTexture(colorStr);
     return new THREE.MeshStandardMaterial({
         map: tex,
         color: color,
         roughness: 0.4,
         metalness: 0.6
     });
  }
};