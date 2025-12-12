import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './store/GameContext';
import { Layout } from './components/Layout/Layout';
import { MainMenu } from './pages/MainMenu';
import { Shop } from './pages/Shop';
import { MagnetTower } from './pages/MagnetTower';
import { Admin } from './pages/Admin';
import { QrScanner } from './pages/QrScanner';
import { Profile } from './pages/Profile';

// Placeholder for games not yet implemented
const GamePlaceholder: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-mag-dark text-white p-6 text-center">
    <h1 className="text-3xl font-bold text-neon-purple mb-4">Coming Soon</h1>
    <p className="text-gray-400">This magnetic flux chamber is currently under construction.</p>
    <a href="#/" className="mt-8 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20">Return to Base</a>
  </div>
);

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
            <Route path="/game/placeholder/:id" element={<GamePlaceholder />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </GameProvider>
  );
};

export default App;