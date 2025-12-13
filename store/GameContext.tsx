import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Upgrade, UpgradeType } from '../types';
import { INITIAL_UPGRADES } from '../constants';

interface GameContextType {
  user: UserProfile;
  upgrades: Upgrade[];
  addCoins: (amount: number) => void;
  purchaseUpgrade: (upgradeId: string) => boolean;
  unlockSkin: (skinId: string) => void;
  setGameScore: (gameId: string, score: number) => void;
  getUpgradeLevel: (type: UpgradeType) => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_USER: UserProfile = {
  id: 'user_123',
  username: 'МагнитныйМастер',
  magCoins: 5000,
  isAdmin: true,
  inventory: ['default'],
  highScores: {},
  lastLogin: Date.now()
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);

  // Load & Passive Income
  useEffect(() => {
    const saved = localStorage.getItem('mc_user');
    const savedUpgrades = localStorage.getItem('mc_upgrades');
    
    let currentUser = saved ? JSON.parse(saved) : INITIAL_USER;
    let currentUpgrades = savedUpgrades ? JSON.parse(savedUpgrades) : INITIAL_UPGRADES;

    // Handle updates to upgrades list (if new ones added in code but not in local storage)
    if (currentUpgrades.length !== INITIAL_UPGRADES.length) {
       // Merge logic: keep existing levels, add new
       currentUpgrades = INITIAL_UPGRADES.map(initU => {
          const existing = currentUpgrades.find((u: Upgrade) => u.id === initU.id);
          return existing || initU;
       });
    }

    // Passive Income Calculation
    const passiveUpgrade = currentUpgrades.find((u: Upgrade) => u.type === UpgradeType.PASSIVE_INCOME);
    if (passiveUpgrade && passiveUpgrade.currentLevel > 0 && currentUser.lastLogin) {
        const hoursPassed = (Date.now() - currentUser.lastLogin) / (1000 * 60 * 60);
        const rate = passiveUpgrade.currentLevel * 10;
        const earned = Math.floor(hoursPassed * rate);
        if (earned > 0) {
            currentUser.magCoins += earned;
            // Ideally show a notification here, but we'll just add it silently for now
            console.log("Passive Income Earned:", earned);
        }
    }
    currentUser.lastLogin = Date.now();

    setUser(currentUser);
    setUpgrades(currentUpgrades);
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('mc_user', JSON.stringify(user));
    localStorage.setItem('mc_upgrades', JSON.stringify(upgrades));
  }, [user, upgrades]);

  const addCoins = (amount: number) => {
    // Apply Global Multiplier if upgraded
    const multLevel = getUpgradeLevel(UpgradeType.SCORE_MULTIPLIER);
    const multiplier = 1 + (multLevel * 0.2); // 20% per level
    const finalAmount = Math.floor(amount * multiplier);

    setUser(prev => ({ ...prev, magCoins: prev.magCoins + finalAmount }));
  };

  const purchaseUpgrade = (upgradeId: string): boolean => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;

    const upgrade = upgrades[upgradeIndex];
    const price = Math.floor(upgrade.basePrice * Math.pow(1.5, upgrade.currentLevel)); // Slower price scaling

    if (user.magCoins >= price && upgrade.currentLevel < upgrade.maxLevel) {
      setUser(prev => ({ ...prev, magCoins: prev.magCoins - price }));
      
      const newUpgrades = [...upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        currentLevel: upgrade.currentLevel + 1
      };
      setUpgrades(newUpgrades);
      return true;
    }
    return false;
  };

  const unlockSkin = (skinId: string) => {
    if (!user.inventory.includes(skinId)) {
      setUser(prev => ({ ...prev, inventory: [...prev.inventory, skinId] }));
    }
  };

  const setGameScore = (gameId: string, score: number) => {
    setUser(prev => ({
      ...prev,
      highScores: {
        ...prev.highScores,
        [gameId]: Math.max(score, prev.highScores[gameId] || 0)
      }
    }));
  };

  const getUpgradeLevel = (type: UpgradeType): number => {
      const upg = upgrades.find(u => u.type === type);
      return upg ? upg.currentLevel : 0;
  };

  return (
    <GameContext.Provider value={{ user, upgrades, addCoins, purchaseUpgrade, unlockSkin, setGameScore, getUpgradeLevel }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};