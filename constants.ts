import { UpgradeType, Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  // --- EXISTING ---
  {
    id: 'u_magnet', type: UpgradeType.MAGNET_STRENGTH, name: 'Магнитная Сила', description: 'Увеличивает радиус захвата.', basePrice: 1000, maxLevel: 5, currentLevel: 0, effectPerLevel: '+10% Радиус',
  },
  {
    id: 'u_score', type: UpgradeType.SCORE_MULTIPLIER, name: 'Квантовый Чип', description: 'Увеличивает очки.', basePrice: 2500, maxLevel: 5, currentLevel: 0, effectPerLevel: 'x1.2 Очков',
  },
  {
    id: 'u_safety', type: UpgradeType.SAFETY_NET, name: 'Страховка', description: 'Спасает от падения.', basePrice: 5000, maxLevel: 1, currentLevel: 0, effectPerLevel: '1 Шанс',
  },
  {
    id: 'u_time', type: UpgradeType.TIME_DILATION, name: 'Замедлитель', description: 'Блоки движутся медленнее.', basePrice: 4000, maxLevel: 3, currentLevel: 0, effectPerLevel: '-10% Скорость',
  },
  {
    id: 'u_gold', type: UpgradeType.GOLDEN_TOUCH, name: 'Золотое Касание', description: 'Шанс появления Золотого Куба.', basePrice: 6000, maxLevel: 3, currentLevel: 0, effectPerLevel: '+5% Шанс',
  },
  {
    id: 'u_passive', type: UpgradeType.PASSIVE_INCOME, name: 'Авто-Майнер', description: 'Генерирует монеты оффлайн.', basePrice: 8000, maxLevel: 5, currentLevel: 0, effectPerLevel: '+10 MC/час',
  },
  {
    id: 'u_combo', type: UpgradeType.COMBO_MASTER, name: 'Мастер Комбо', description: 'Бонус за серии.', basePrice: 3000, maxLevel: 3, currentLevel: 0, effectPerLevel: '+20% Бонус',
  },
  {
    id: 'u_pulse', type: UpgradeType.PULSE_TECH, name: 'Импульс', description: 'Улучшает управление.', basePrice: 2000, maxLevel: 3, currentLevel: 0, effectPerLevel: 'Быстрый отклик',
  },
  {
    id: 'u_skin_circuit', type: UpgradeType.SKIN_CIRCUIT, name: 'Скин: Кибер-Схема', description: 'Текстуры микросхем.', basePrice: 10000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Разблокировано',
  },
  {
    id: 'u_skin_glass', type: UpgradeType.SKIN_GLASS, name: 'Скин: Неон-Стекло', description: 'Прозрачные материалы.', basePrice: 15000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Разблокировано',
  },

  // --- NEW UPGRADES (10) ---
  {
    id: 'u_headstart', type: UpgradeType.HEAD_START, name: 'Быстрый Старт', description: 'Начинайте игры с бонусными очками.', basePrice: 3500, maxLevel: 3, currentLevel: 0, effectPerLevel: '+50 Очков',
  },
  {
    id: 'u_shield', type: UpgradeType.MAGNET_SHIELD, name: 'Магнитный Щит', description: 'Блокирует 1 удар в Серфере и Лабиринте.', basePrice: 7000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Активен',
  },
  {
    id: 'u_crystal', type: UpgradeType.CRYSTAL_MAGNET, name: 'Магнитный Пылесос', description: 'Автоматически собирает монеты.', basePrice: 5000, maxLevel: 3, currentLevel: 0, effectPerLevel: '+2м Радиус',
  },
  {
    id: 'u_loyalty', type: UpgradeType.LOYALTY_CARD, name: 'Карта Лояльности', description: 'Скидка на все улучшения.', basePrice: 10000, maxLevel: 3, currentLevel: 0, effectPerLevel: '-5% Цены',
  },
  {
    id: 'u_crit', type: UpgradeType.CRIT_HARVEST, name: 'Крит. Сбор', description: 'Шанс получить х10 монет.', basePrice: 4500, maxLevel: 5, currentLevel: 0, effectPerLevel: '+2% Шанс',
  },
  {
    id: 'u_auto_stack', type: UpgradeType.AUTO_STACKER, name: 'Авто-Укладчик', description: 'Каждый 10-й блок в Башне идеален.', basePrice: 12000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Вкл',
  },
  {
    id: 'u_ghost', type: UpgradeType.GHOST_MODE, name: 'Призрак', description: 'Проход сквозь препятствия (шанс).', basePrice: 9000, maxLevel: 3, currentLevel: 0, effectPerLevel: '+5% Шанс',
  },
  {
    id: 'u_freeze', type: UpgradeType.FREEZE_TIME, name: 'Крио-Стазис', description: 'Временно замедляет время при опасности.', basePrice: 6000, maxLevel: 2, currentLevel: 0, effectPerLevel: '+2 сек',
  },
  {
    id: 'u_skin_magma', type: UpgradeType.SKIN_MAGMA, name: 'Скин: Магма', description: 'Пульсирующая лава.', basePrice: 20000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Разблокировано',
  },
  {
    id: 'u_skin_holo', type: UpgradeType.SKIN_HOLO, name: 'Скин: Голограмма', description: 'Цифровой глитч.', basePrice: 25000, maxLevel: 1, currentLevel: 0, effectPerLevel: 'Разблокировано',
  }
];

export const GAMES_CONFIG = [
  { id: 'game1', name: 'Магнитная Башня', description: 'Стройте башню, ловя момент магнитного сцепления.', color: '#00f3ff' },
  { id: 'game2', name: 'Слияние Кубов', description: 'Сбрасывайте и объединяйте кубы по физике.', color: '#bc13fe' },
  { id: 'game3', name: 'Магнитный Пазл', description: 'Собирайте 3D структуры по чертежу.', color: '#ff0055' },
  { id: 'game4', name: 'Лавина', description: 'Выживайте под градом падающих магнитов.', color: '#ffaa00' },
  { id: 'game5', name: 'Лабиринт', description: 'Ведите шар к цели силой притяжения.', color: '#00ff66' },
  { id: 'game6', name: 'Mag-Tris 3D', description: 'Классика в 3D: собирайте слои магнитов.', color: '#ff3333' },
  { id: 'game7', name: 'Cube Surfer', description: 'Скользите по волнам на стопке кубов.', color: '#3388ff' },
];