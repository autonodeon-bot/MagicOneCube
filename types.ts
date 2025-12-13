export enum GameType {
  MAGNET_TOWER = 'Magnet Tower',
  CUBE_MERGE = 'Cube Merge Magnet',
  MAGNETIC_PUZZLE = 'Magnetic Puzzle',
  AVALANCHE_CUBES = 'Avalanche Cubes',
  MAGNET_LABYRINTH = 'Magnet Labyrinth',
  MAG_TRIS = 'Mag-Tris',
  CUBE_SURFER = 'Cube Surfer'
}

export enum UpgradeType {
  // Existing
  MAGNET_STRENGTH = 'MAGNET_STRENGTH',
  SCORE_MULTIPLIER = 'SCORE_MULTIPLIER',
  SAFETY_NET = 'SAFETY_NET',
  TIME_DILATION = 'TIME_DILATION',
  GOLDEN_TOUCH = 'GOLDEN_TOUCH',
  COMBO_MASTER = 'COMBO_MASTER',
  PASSIVE_INCOME = 'PASSIVE_INCOME',
  PULSE_TECH = 'PULSE_TECH',
  SKIN_CIRCUIT = 'SKIN_CIRCUIT',
  SKIN_GLASS = 'SKIN_GLASS',
  
  // New 10
  HEAD_START = 'HEAD_START',         // Start with score
  MAGNET_SHIELD = 'MAGNET_SHIELD',   // Invulnerability 1 hit
  CRYSTAL_MAGNET = 'CRYSTAL_MAGNET', // Coin range
  LOYALTY_CARD = 'LOYALTY_CARD',     // Cheaper shops
  CRIT_HARVEST = 'CRIT_HARVEST',     // x10 coins chance
  AUTO_STACKER = 'AUTO_STACKER',     // Perfect stack helper
  GHOST_MODE = 'GHOST_MODE',         // Wall pass
  FREEZE_TIME = 'FREEZE_TIME',       // Active ability
  SKIN_MAGMA = 'SKIN_MAGMA',         // Cosmetic
  SKIN_HOLO = 'SKIN_HOLO'            // Cosmetic
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