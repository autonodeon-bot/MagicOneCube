import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './store/GameContext';
import { Layout } from './components/Layout/Layout';
import { MainMenu } from './pages/MainMenu';
import { Shop } from './pages/Shop';
import { Admin } from './pages/Admin';
import { QrScanner } from './pages/QrScanner';
import { Profile } from './pages/Profile';

// Games
import { MagnetTower } from './pages/MagnetTower';
import { CubeMerge } from './pages/CubeMerge';
import { MagneticPuzzle } from './pages/MagneticPuzzle';
import { Avalanche } from './pages/Avalanche';
import { Labyrinth } from './pages/Labyrinth';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial asset loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-mag-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-neon-blue font-bold tracking-widest animate-pulse">LOADING WORLD</div>
      </div>
    );
  }

  return (
    <GameProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/scan" element={<QrScanner />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Games */}
            <Route path="/game/tower" element={<MagnetTower />} />
            <Route path="/game/merge" element={<CubeMerge />} />
            <Route path="/game/puzzle" element={<MagneticPuzzle />} />
            <Route path="/game/avalanche" element={<Avalanche />} />
            <Route path="/game/labyrinth" element={<Labyrinth />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </GameProvider>
  );
};

export default App;