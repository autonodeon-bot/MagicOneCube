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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_USER: UserProfile = {
  id: 'user_123',
  username: 'MagnetMaster',
  magCoins: 5000, // Starting bonus
  isAdmin: true, // For demo purposes to access admin
  inventory: ['default'],
  highScores: {}
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);

  // Load from local storage on mount (Simulation of Firebase Fetch)
  useEffect(() => {
    const saved = localStorage.getItem('mc_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    const savedUpgrades = localStorage.getItem('mc_upgrades');
    if (savedUpgrades) {
      setUpgrades(JSON.parse(savedUpgrades));
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('mc_user', JSON.stringify(user));
    localStorage.setItem('mc_upgrades', JSON.stringify(upgrades));
  }, [user, upgrades]);

  const addCoins = (amount: number) => {
    setUser(prev => ({ ...prev, magCoins: prev.magCoins + amount }));
  };

  const purchaseUpgrade = (upgradeId: string): boolean => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;

    const upgrade = upgrades[upgradeIndex];
    const price = upgrade.basePrice * Math.pow(2, upgrade.currentLevel);

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

  return (
    <GameContext.Provider value={{ user, upgrades, addCoins, purchaseUpgrade, unlockSkin, setGameScore }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};