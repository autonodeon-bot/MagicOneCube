import React, { useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { BackgroundScene } from '../components/Three/BackgroundScene';
import { UpgradeType, Upgrade } from '../types';

export const Shop: React.FC = () => {
  const { user, upgrades, purchaseUpgrade } = useGame();

  const handleBuy = (id: string) => {
    const success = purchaseUpgrade(id);
    if (!success) {
      alert("Недостаточно MagCoins!");
    }
  };

  // Group upgrades
  const categories: Record<string, Upgrade[]> = useMemo(() => ({
      'Способности': upgrades.filter(u => [UpgradeType.MAGNET_STRENGTH, UpgradeType.SAFETY_NET, UpgradeType.TIME_DILATION, UpgradeType.PULSE_TECH].includes(u.type)),
      'Экономика': upgrades.filter(u => [UpgradeType.SCORE_MULTIPLIER, UpgradeType.GOLDEN_TOUCH, UpgradeType.PASSIVE_INCOME, UpgradeType.COMBO_MASTER].includes(u.type)),
      'Скины': upgrades.filter(u => [UpgradeType.SKIN_CIRCUIT, UpgradeType.SKIN_GLASS].includes(u.type)),
  }), [upgrades]);

  return (
    <div className="w-full h-full relative overflow-y-auto pb-24 bg-mag-dark">
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <BackgroundScene />
      </div>
      
      <div className="pt-20 px-6 pb-6">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
            МАГ-ЛАБОРАТОРИЯ
        </h1>
        <div className="flex justify-between items-center mb-6 p-4 bg-mag-panel/50 rounded-xl border border-white/5">
             <div>
                 <p className="text-gray-400 text-xs">Баланс</p>
                 <p className="text-2xl font-bold text-white">{user.magCoins.toLocaleString()} MC</p>
             </div>
             <div className="text-right">
                 <p className="text-gray-400 text-xs">Доход</p>
                 <p className="text-green-400 font-bold">
                    {upgrades.find(u => u.type === UpgradeType.PASSIVE_INCOME)?.currentLevel || 0 * 10}/ч
                 </p>
             </div>
        </div>

        <div className="flex flex-col gap-8">
          {Object.entries(categories).map(([catName, catUpgrades]) => (
             <div key={catName}>
                 <h2 className="text-xl font-bold text-white mb-3 border-l-4 border-neon-blue pl-3">{catName}</h2>
                 <div className="flex flex-col gap-4">
                    {catUpgrades.map((upgrade) => {
                        const price = Math.floor(upgrade.basePrice * Math.pow(1.5, upgrade.currentLevel));
                        const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
                        const canAfford = user.magCoins >= price;
                        
                        return (
                          <div 
                            key={upgrade.id} 
                            className="bg-mag-panel/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-2 relative overflow-hidden"
                          >
                            <div className={`absolute top-0 right-0 p-20 bg-gradient-to-bl ${isMaxed ? 'from-green-500/20' : 'from-neon-purple/10'} to-transparent rounded-full -mr-10 -mt-10 pointer-events-none`}></div>
                            
                            <div className="flex justify-between items-start z-10">
                              <div>
                                <h3 className="font-bold text-white text-lg">{upgrade.name}</h3>
                                <p className="text-xs text-gray-400 max-w-[200px]">{upgrade.description}</p>
                              </div>
                              <div className="text-xs font-mono bg-black/60 px-2 py-1 rounded text-neon-blue border border-white/10">
                                Lvl {upgrade.currentLevel}/{upgrade.maxLevel}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 z-10">
                               <div className="text-xs text-neon-purple font-bold">
                                 Эффект: {upgrade.effectPerLevel}
                               </div>
                               
                               {!isMaxed ? (
                                 <button
                                   onClick={() => handleBuy(upgrade.id)}
                                   disabled={!canAfford}
                                   className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                                     canAfford 
                                       ? 'bg-gradient-to-r from-neon-blue to-cyan-400 text-black hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                                       : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                   }`}
                                 >
                                   <span>UPGRADE</span>
                                   <span className="text-[10px] bg-black/20 px-1 rounded">{price.toLocaleString()}</span>
                                 </button>
                               ) : (
                                 <span className="text-green-400 font-bold text-sm px-4 py-2 bg-green-900/30 rounded border border-green-500/30">MAXED</span>
                               )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-black/50 mt-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-neon-blue" 
                                    style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                                ></div>
                            </div>
                          </div>
                        );
                    })}
                 </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};