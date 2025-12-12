export enum GameType {
  MAGNET_TOWER = 'Magnet Tower',
  CUBE_MERGE = 'Cube Merge Magnet',
  MAGNETIC_PUZZLE = 'Magnetic Puzzle',
  AVALANCHE_CUBES = 'Avalanche Cubes',
  MAGNET_LABYRINTH = 'Magnet Labyrinth'
}

export enum UpgradeType {
  MAGNET_STRENGTH = 'MAGNET_STRENGTH',
  SCORE_MULTIPLIER = 'SCORE_MULTIPLIER',
  AUTO_CLICKER = 'AUTO_CLICKER',
  TIME_SLOW = 'TIME_SLOW',
  EXTRA_LIFE = 'EXTRA_LIFE',
  SKIN_PACK = 'SKIN_PACK'
}

export interface Upgrade {
  id: string;
  type: UpgradeType;
  name: string;
  description: string;
  basePrice: number;
  maxLevel: number;
  currentLevel: number;
  effectPerLevel: string;
}

export interface UserProfile {
  id: string;
  username: string;
  magCoins: number;
  isAdmin: boolean;
  inventory: string[]; // Owned skins/items
  highScores: Record<string, number>;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  gameOver: boolean;
}

export interface QrReward {
  code: string;
  type: 'ONE_TIME' | 'MULTI' | 'DAILY';
  rewardAmount: number;
  description: string;
}