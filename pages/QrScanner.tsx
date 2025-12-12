import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { useNavigate } from 'react-router-dom';

export const QrScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const { addCoins } = useGame();
  const navigate = useNavigate();

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setHasPermission(false);
      }
    };
    startCamera();

    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate scanning logic (since we don't have a real QR lib in this constrained response)
  const handleSimulateScan = () => {
    setScanning(false);
    const reward = Math.floor(Math.random() * 2000) + 500;
    
    setTimeout(() => {
        addCoins(reward);
        alert(`QR Код найден! Вы получили ${reward} MagCoins!`);
        navigate('/');
    }, 500);
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col items-center justify-center">
      {hasPermission === false ? (
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">Доступ к камере запрещен.</p>
          <button onClick={() => navigate('/')} className="text-white underline">Назад</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          
          {/* Overlay UI */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
             <div className="w-64 h-64 border-2 border-neon-blue rounded-lg relative animate-pulse">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neon-blue -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-neon-blue -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-neon-blue -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neon-blue -mb-1 -mr-1"></div>
             </div>
             <p className="mt-8 text-white font-bold bg-black/50 px-4 py-1 rounded">Наведите камеру на Mag-код</p>
          </div>

          {/* Dev Simulation Button */}
          <button 
            onClick={handleSimulateScan}
            className="absolute bottom-24 z-20 px-6 py-3 bg-neon-purple text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform"
          >
            [DEV] Симуляция Скана
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 rounded-full text-white border border-white/20"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};