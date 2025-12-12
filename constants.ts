import { UpgradeType, Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'u1',
    type: UpgradeType.MAGNET_STRENGTH,
    name: 'Magnetic Force',
    description: 'Increases attraction range of cubes.',
    basePrice: 2000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: '+20%',
  },
  {
    id: 'u2',
    type: UpgradeType.SCORE_MULTIPLIER,
    name: 'Score Amplifier',
    description: 'Permanent multiplier for all games.',
    basePrice: 5000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: 'x0.5',
  },
  {
    id: 'u3',
    type: UpgradeType.EXTRA_LIFE,
    name: 'Backup Battery',
    description: 'Extra life for applicable games.',
    basePrice: 10000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: '+1 Life',
  },
  {
    id: 'u4',
    type: UpgradeType.SKIN_PACK,
    name: 'Neon Texture Pack',
    description: 'Unlocks Neon skins for all cubes.',
    basePrice: 15000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: 'Unlock',
  }
];

export const GAMES_CONFIG = [
  { id: 'game1', name: 'Magnet Tower', description: 'Stack cubes using magnetic timing.', color: '#00f3ff' },
  { id: 'game2', name: 'Cube Merge', description: 'Merge mechanics with physics.', color: '#bc13fe' },
  { id: 'game3', name: 'Mag Puzzle', description: 'Solve 3D magnetic structures.', color: '#ff0055' },
  { id: 'game4', name: 'Avalanche', description: 'Survive the falling magnetic storm.', color: '#ffaa00' },
  { id: 'game5', name: 'Labyrinth', description: 'Navigate the maze via attraction.', color: '#00ff66' },
];