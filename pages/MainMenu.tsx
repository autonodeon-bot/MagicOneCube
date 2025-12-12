import React, { useState } from 'react';
import { BackgroundScene } from '../components/Three/BackgroundScene';
import { GAMES_CONFIG } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { generateDailyFact } from '../services/geminiService';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGame();
  const [dailyFact, setDailyFact] = useState<string>("Loading magnetic knowledge...");

  // Fetch AI fact on mount
  React.useEffect(() => {
    generateDailyFact().then(setDailyFact);
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col items-center overflow-y-auto pb-24">
      <BackgroundScene />
      
      {/* Header Area */}
      <div className="pt-20 pb-6 px-6 text-center z-10 w-full max-w-md">
        <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          MAGNETIC<br />WORLD
        </h1>
        <div className="mt-4 p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-neon-blue uppercase font-bold mb-1">Daily Wisdom</p>
          <p className="text-sm text-gray-300 italic">"{dailyFact}"</p>
        </div>
      </div>

      {/* Game Grid */}
      <div className="w-full max-w-md px-4 grid grid-cols-1 gap-4 z-10">
        {GAMES_CONFIG.map((game, index) => (
          <div 
            key={game.id}
            onClick={() => navigate(game.id === 'game1' ? '/game/tower' : `/game/placeholder/${game.id}`)}
            className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: `0 0 15px ${game.color}20` }}
          >
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-mag-panel border border-white/10 transition-colors group-hover:border-white/40"></div>
            <div 
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-transparent to-white"
              style={{ background: `linear-gradient(45deg, transparent, ${game.color})` }}
            ></div>
            
            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                 <h2 className="text-xl font-bold text-white drop-shadow-md">{game.name}</h2>
                 <span className="text-xs px-2 py-1 rounded bg-black/50 text-white/80 border border-white/10">PLAY</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-[80%]">{game.description}</p>
            </div>

            {/* Decorative Cube Icon (2D representation) */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 opacity-50 group-hover:opacity-100 transition-all group-hover:rotate-12">
               <svg viewBox="0 0 100 100" fill="none" stroke={game.color} strokeWidth="2">
                 <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill={game.color} fillOpacity="0.2"/>
                 <path d="M50 5 L50 50 L90 75 M50 50 L10 75" />
                 <path d="M10 25 L50 50 L90 25" />
               </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Reward / QR CTA */}
      <div className="w-full max-w-md px-4 mt-6 z-10">
        <div 
          onClick={() => navigate('/scan')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 flex items-center justify-between cursor-pointer"
        >
          <div>
            <h3 className="font-bold text-yellow-400">Hunt for QR Codes!</h3>
            <p className="text-xs text-gray-300">Scan hidden codes to earn MagCoins.</p>
          </div>
          <div className="text-2xl animate-pulse">🎁</div>
        </div>
      </div>
    </div>
  );
};