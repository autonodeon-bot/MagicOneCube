import React from 'react';
import { useGame } from '../store/GameContext';
import { BackgroundScene } from '../components/Three/BackgroundScene';

export const Shop: React.FC = () => {
  const { user, upgrades, purchaseUpgrade } = useGame();

  const handleBuy = (id: string) => {
    const success = purchaseUpgrade(id);
    if (!success) {
      // Visual feedback for fail could go here (e.g. shake animation)
      alert("Not enough MagCoins!");
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto pb-24">
      <BackgroundScene />
      
      <div className="pt-20 px-6">
        <h1 className="text-3xl font-black text-white mb-2">UPGRADE LAB</h1>
        <p className="text-sm text-gray-400 mb-6">Enhance your magnetic capabilities across all worlds.</p>

        <div className="flex flex-col gap-4">
          {upgrades.map((upgrade) => {
            const currentPrice = upgrade.basePrice * Math.pow(2, upgrade.currentLevel);
            const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
            const canAfford = user.magCoins >= currentPrice;

            return (
              <div 
                key={upgrade.id} 
                className="bg-mag-panel/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{upgrade.name}</h3>
                    <p className="text-xs text-gray-400">{upgrade.description}</p>
                  </div>
                  <div className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-neon-blue">
                    Lvl {upgrade.currentLevel} / {upgrade.maxLevel}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                   <div className="text-xs text-neon-purple font-bold">
                     Effect: {upgrade.effectPerLevel}
                   </div>
                   
                   {!isMaxed ? (
                     <button
                       onClick={() => handleBuy(upgrade.id)}
                       disabled={!canAfford}
                       className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                         canAfford 
                           ? 'bg-neon-blue text-black hover:scale-105 active:scale-95' 
                           : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                       }`}
                     >
                       {currentPrice.toLocaleString()} MC
                     </button>
                   ) : (
                     <span className="text-green-400 font-bold text-sm px-4 py-2">MAXED</span>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};