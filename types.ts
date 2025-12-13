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
  SAFETY_NET = 'SAFETY_NET',        // New: Saves you once
  TIME_DILATION = 'TIME_DILATION',  // New: Slower blocks
  GOLDEN_TOUCH = 'GOLDEN_TOUCH',    // New: Spawn rare blocks
  COMBO_MASTER = 'COMBO_MASTER',    // New: Better combo scores
  PASSIVE_INCOME = 'PASSIVE_INCOME',// New: Idle earnings
  PULSE_TECH = 'PULSE_TECH',        // New: Better controls
  SKIN_CIRCUIT = 'SKIN_CIRCUIT',    // Cosmetic
  SKIN_GLASS = 'SKIN_GLASS'         // Cosmetic
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
  lastLogin?: number; // For passive income
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