import { UpgradeType, Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  // --- UTILITY ---
  {
    id: 'u_magnet',
    type: UpgradeType.MAGNET_STRENGTH,
    name: 'Магнитная Сила',
    description: 'Увеличивает радиус захвата в Лабиринте и Пазле.',
    basePrice: 1000,
    maxLevel: 5,
    currentLevel: 0,
    effectPerLevel: '+10% Радиус',
  },
  {
    id: 'u_score',
    type: UpgradeType.SCORE_MULTIPLIER,
    name: 'Квантовый Чип',
    description: 'Увеличивает получаемые очки во всех играх.',
    basePrice: 2500,
    maxLevel: 5,
    currentLevel: 0,
    effectPerLevel: 'x1.2 Очков',
  },
  
  // --- SURVIVAL ---
  {
    id: 'u_safety',
    type: UpgradeType.SAFETY_NET,
    name: 'Страховка',
    description: 'В Башне один раз спасает от падения блока.',
    basePrice: 5000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: '1 Шанс',
  },
  {
    id: 'u_time',
    type: UpgradeType.TIME_DILATION,
    name: 'Замедлитель',
    description: 'Блоки в Башне и Лавине движутся медленнее.',
    basePrice: 4000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: '-10% Скорость',
  },

  // --- ECONOMY ---
  {
    id: 'u_gold',
    type: UpgradeType.GOLDEN_TOUCH,
    name: 'Золотое Касание',
    description: 'Шанс появления Золотого Куба (x5 монет).',
    basePrice: 6000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: '+5% Шанс',
  },
  {
    id: 'u_passive',
    type: UpgradeType.PASSIVE_INCOME,
    name: 'Авто-Майнер',
    description: 'Генерирует монеты, пока вас нет в игре.',
    basePrice: 8000,
    maxLevel: 5,
    currentLevel: 0,
    effectPerLevel: '+10 MC/час',
  },

  // --- MECHANICS ---
  {
    id: 'u_combo',
    type: UpgradeType.COMBO_MASTER,
    name: 'Мастер Комбо',
    description: 'Бонус за серии слияний в Merge Cube.',
    basePrice: 3000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: '+20% Бонус',
  },
  {
    id: 'u_pulse',
    type: UpgradeType.PULSE_TECH,
    name: 'Импульс',
    description: 'Улучшает отзывчивость управления в Лабиринте.',
    basePrice: 2000,
    maxLevel: 3,
    currentLevel: 0,
    effectPerLevel: 'Быстрый отклик',
  },

  // --- COSMETICS ---
  {
    id: 'u_skin_circuit',
    type: UpgradeType.SKIN_CIRCUIT,
    name: 'Скин: Кибер-Схема',
    description: 'Текстуры микросхем для всех кубов.',
    basePrice: 10000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: 'Разблокировано',
  },
  {
    id: 'u_skin_glass',
    type: UpgradeType.SKIN_GLASS,
    name: 'Скин: Неон-Стекло',
    description: 'Прозрачные светящиеся материалы.',
    basePrice: 15000,
    maxLevel: 1,
    currentLevel: 0,
    effectPerLevel: 'Разблокировано',
  }
];

export const GAMES_CONFIG = [
  { id: 'game1', name: 'Магнитная Башня', description: 'Стройте башню, ловя момент магнитного сцепления.', color: '#00f3ff' },
  { id: 'game2', name: 'Слияние Кубов', description: 'Сбрасывайте и объединяйте кубы по физике.', color: '#bc13fe' },
  { id: 'game3', name: 'Магнитный Пазл', description: 'Собирайте 3D структуры по чертежу.', color: '#ff0055' },
  { id: 'game4', name: 'Лавина', description: 'Выживайте под градом падающих магнитов.', color: '#ffaa00' },
  { id: 'game5', name: 'Лабиринт', description: 'Ведите шар к цели силой притяжения.', color: '#00ff66' },
];