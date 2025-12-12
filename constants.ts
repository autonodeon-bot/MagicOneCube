import { UpgradeType, Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'u1',
    type: UpgradeType.MAGNET_STRENGTH,
    name: 'Магнитная Сила',
    description: 'Увеличивает радиус притяжения кубов.',
    basePrice: 2000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: '+20%',
  },
  {
    id: 'u2',
    type: UpgradeType.SCORE_MULTIPLIER,
    name: 'Усилитель Очков',
    description: 'Постоянный множитель очков для всех игр.',
    basePrice: 5000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: 'x0.5',
  },
  {
    id: 'u3',
    type: UpgradeType.EXTRA_LIFE,
    name: 'Запасная Батарея',
    description: 'Дополнительная жизнь (где применимо).',
    basePrice: 10000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: '+1 Жизнь',
  },
  {
    id: 'u4',
    type: UpgradeType.SKIN_PACK,
    name: 'Неоновый Пак',
    description: 'Разблокирует неоновые скины для кубов.',
    basePrice: 15000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: 'Доступ',
  }
];

export const GAMES_CONFIG = [
  { id: 'game1', name: 'Магнитная Башня', description: 'Стройте башню, ловя момент магнитного сцепления.', color: '#00f3ff' },
  { id: 'game2', name: 'Слияние Кубов', description: 'Сбрасывайте и объединяйте кубы по физике.', color: '#bc13fe' },
  { id: 'game3', name: 'Магнитный Пазл', description: 'Собирайте 3D структуры по чертежу.', color: '#ff0055' },
  { id: 'game4', name: 'Лавина', description: 'Выживайте под градом падающих магнитов.', color: '#ffaa00' },
  { id: 'game5', name: 'Лабиринт', description: 'Ведите шар к цели силой притяжения.', color: '#00ff66' },
];