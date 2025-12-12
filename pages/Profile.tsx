import React from 'react';
import { useGame } from '../store/GameContext';
import { BackgroundScene } from '../components/Three/BackgroundScene';

export const Profile: React.FC = () => {
  const { user, upgrades } = useGame();

  // Calculate stats
  const totalUpgrades = upgrades.reduce((acc, curr) => acc + curr.currentLevel, 0);
  const maxUpgrades = upgrades.reduce((acc, curr) => acc + curr.maxLevel, 0);
  const progress = Math.round((totalUpgrades / maxUpgrades) * 100);

  return (
    <div className="w-full h-full relative overflow-y-auto pb-24">
       <BackgroundScene />
       
       <div className="pt-24 px-6">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[2px]">
               <div className="w-full h-full rounded-full bg-mag-panel flex items-center justify-center text-2xl font-bold">
                 {user.username.substring(0, 2).toUpperCase()}
               </div>
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white">{user.username}</h1>
               <p className="text-gray-400">ID: {user.id}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
             <div className="bg-mag-panel/80 p-4 rounded-xl border border-white/10 text-center">
                <span className="block text-2xl font-bold text-neon-blue">{user.magCoins.toLocaleString()}</span>
                <span className="text-xs text-gray-400 uppercase">MagCoins</span>
             </div>
             <div className="bg-mag-panel/80 p-4 rounded-xl border border-white/10 text-center">
                <span className="block text-2xl font-bold text-neon-purple">{progress}%</span>
                <span className="text-xs text-gray-400 uppercase">Tech Level</span>
             </div>
          </div>

          <div className="bg-mag-panel/80 p-6 rounded-xl border border-white/10 mb-6">
             <h2 className="font-bold text-white mb-4">High Scores</h2>
             {Object.entries(user.highScores).length === 0 ? (
               <p className="text-sm text-gray-500 italic">No games played yet.</p>
             ) : (
               <div className="space-y-3">
                 {Object.entries(user.highScores).map(([gameId, score]) => (
                    <div key={gameId} className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-sm text-gray-300 capitalize">{gameId.replace('game', 'Game #')}</span>
                       <span className="font-mono text-neon-blue">{score}</span>
                    </div>
                 ))}
               </div>
             )}
          </div>
       </div>
    </div>
  );
};