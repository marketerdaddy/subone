import { Character, PowerupConfig, BiomeConfig, BiomeType, LevelInfo, ShopItem, Mission, Achievement, DailyRewardDay } from '../types/game';

export const GAME_CONSTANTS = {
  LANE_WIDTH: 2.8,
  LANES: [-2.8, 0, 2.8] as const, // Left (-1), Center (0), Right (1)
  BASE_SPEED: 22,
  MAX_SPEED: 48,
  SPEED_INCREMENT: 0.15,
  JUMP_FORCE: 16.5,
  GRAVITY: 42,
  SLIDE_DURATION: 0.75, // seconds
  CHUNK_LENGTH: 60,
  VISIBLE_CHUNKS: 6,
  COLLISION_TOLERANCE_Z: 1.1,
  COLLISION_TOLERANCE_X: 0.9,
  MAGNET_BASE_RADIUS: 14,
  MAX_LEVELS: 1_000_000,
};

export const CHARACTERS: Character[] = [
  {
    id: 'zayn',
    name: 'Zayn',
    title: 'The Cyber Prodigy',
    description: 'Fast, agile and always ready for the next challenge.',
    rarity: 'epic',
    stats: {
      speed: 95,
      jump: 80,
      shield: 60,
      magnet: 70,
    },
    ability: {
      name: 'Kinetic Surge',
      description: 'Increases score multiplier by +1x and gains 10% faster lane switches.',
      multiplierBonus: 1,
      magnetRangeBonus: 2,
      shieldDurationBonus: 1,
    },
    skins: [
      {
        id: 'zayn-default',
        name: 'Neo Street',
        colorScheme: {
          primary: '#e11d48', // Crimson/Red jacket
          secondary: '#1e293b', // Dark slate pants
          accent: '#38bdf8', // Cyan sneakers/highlights
          glow: '#fb7185',
        },
        unlocked: true,
      },
      {
        id: 'zayn-midnight',
        name: 'Midnight Phantom',
        colorScheme: {
          primary: '#8b5cf6',
          secondary: '#0f172a',
          accent: '#a855f7',
          glow: '#c084fc',
        },
        priceCoins: 5000,
        unlocked: false,
      },
    ],
    activeSkinId: 'zayn-default',
    unlocked: true,
  },
  {
    id: 'shadow-runner',
    name: 'Shadow Runner',
    title: 'Legendary Operative',
    description: 'Unlock the power of the shadows. Cloaks through obstacles and pulls gems.',
    rarity: 'legendary',
    stats: {
      speed: 98,
      jump: 92,
      shield: 90,
      magnet: 85,
    },
    ability: {
      name: 'Void Shift',
      description: 'Shield lasts 50% longer and automatically pulls rare collectibles.',
      multiplierBonus: 2,
      magnetRangeBonus: 6,
      shieldDurationBonus: 4,
    },
    skins: [
      {
        id: 'shadow-default',
        name: 'Void Hood',
        colorScheme: {
          primary: '#4c1d95',
          secondary: '#09090b',
          accent: '#ec4899',
          glow: '#d946ef',
        },
        unlocked: false,
      },
    ],
    activeSkinId: 'shadow-default',
    realPriceINR: 299,
    priceGems: 450,
    unlocked: false,
  },
  {
    id: 'spark',
    name: 'Spark',
    title: 'High-Voltage Sprinter',
    description: 'Energetic cyber runner armed with magnetic pulse gauntlets.',
    rarity: 'rare',
    stats: {
      speed: 88,
      jump: 84,
      shield: 50,
      magnet: 95,
    },
    ability: {
      name: 'Electro Magnet',
      description: 'Base magnet radius +50% and coin value doubled during boost.',
      multiplierBonus: 1,
      magnetRangeBonus: 8,
      shieldDurationBonus: 0,
    },
    skins: [
      {
        id: 'spark-default',
        name: 'Neon Volt',
        colorScheme: {
          primary: '#ec4899',
          secondary: '#18181b',
          accent: '#facc15',
          glow: '#f43f5e',
        },
        unlocked: false,
      },
    ],
    activeSkinId: 'spark-default',
    priceCoins: 12000,
    priceGems: 120,
    unlocked: false,
  },
  {
    id: 'cyber-ninja',
    name: 'Cyber Ninja',
    title: 'Acrobatic Assassin',
    description: 'Master of aerial flips and ultra-low slides.',
    rarity: 'epic',
    stats: {
      speed: 92,
      jump: 96,
      shield: 75,
      magnet: 65,
    },
    ability: {
      name: 'Shinobi Leap',
      description: 'Extended air time and double slide points.',
      multiplierBonus: 1.5,
      magnetRangeBonus: 2,
      shieldDurationBonus: 2,
    },
    skins: [
      {
        id: 'ninja-default',
        name: 'Dark Ops',
        colorScheme: {
          primary: '#0284c7',
          secondary: '#0f172a',
          accent: '#22d3ee',
          glow: '#38bdf8',
        },
        unlocked: false,
      },
    ],
    activeSkinId: 'ninja-default',
    priceCoins: 25000,
    priceGems: 250,
    unlocked: false,
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie-X',
    title: 'Mythic Sky Queen',
    description: 'Futuristic armored aerialist with extended jetpack duration.',
    rarity: 'mythic',
    stats: {
      speed: 100,
      jump: 98,
      shield: 98,
      magnet: 92,
    },
    ability: {
      name: 'Sky Sovereign',
      description: 'Jetpack lasts 8 seconds and triples all coin values.',
      multiplierBonus: 3,
      magnetRangeBonus: 10,
      shieldDurationBonus: 5,
    },
    skins: [
      {
        id: 'valk-default',
        name: 'Solar Aegis',
        colorScheme: {
          primary: '#eab308',
          secondary: '#1e1b4b',
          accent: '#f59e0b',
          glow: '#fbbf24',
        },
        unlocked: false,
      },
    ],
    activeSkinId: 'valk-default',
    priceGems: 800,
    unlocked: false,
  },
];

export const BIOMES: Record<BiomeType, BiomeConfig> = {
  NEON_CITY: {
    id: 'NEON_CITY',
    name: 'Neon City',
    skyColor: '#0a0d1e',
    fogColor: '#0c1024',
    trackColor: '#111827',
    railColor: '#38bdf8',
    buildingColors: ['#1e1b4b', '#0f172a', '#1e293b', '#312e81'],
    ambientLight: '#818cf8',
    ambientLightIntensity: 0.85,
    sunLight: '#38bdf8',
    sunLightIntensity: 1.2,
    particleType: 'hologram',
    musicTempo: 128,
  },
  CYBER_METRO: {
    id: 'CYBER_METRO',
    name: 'Cyber Metro',
    skyColor: '#070b14',
    fogColor: '#0a0f1d',
    trackColor: '#171717',
    railColor: '#f43f5e',
    buildingColors: ['#18181b', '#27272a', '#3f3f46'],
    ambientLight: '#f43f5e',
    ambientLightIntensity: 0.7,
    sunLight: '#fb7185',
    sunLightIntensity: 1.1,
    particleType: 'sparks',
    musicTempo: 132,
  },
  DESERT_HIGHWAY: {
    id: 'DESERT_HIGHWAY',
    name: 'Desert Highway',
    skyColor: '#1c100a',
    fogColor: '#24140c',
    trackColor: '#292524',
    railColor: '#f59e0b',
    buildingColors: ['#44403c', '#57534e', '#78716c'],
    ambientLight: '#fbbf24',
    ambientLightIntensity: 0.9,
    sunLight: '#f59e0b',
    sunLightIntensity: 1.3,
    particleType: 'dust',
    musicTempo: 124,
  },
  FROZEN_CITY: {
    id: 'FROZEN_CITY',
    name: 'Frozen City',
    skyColor: '#06131f',
    fogColor: '#0a1d30',
    trackColor: '#1e293b',
    railColor: '#22d3ee',
    buildingColors: ['#0f172a', '#1e293b', '#334155'],
    ambientLight: '#67e8f9',
    ambientLightIntensity: 0.8,
    sunLight: '#e0f2fe',
    sunLightIntensity: 1.2,
    particleType: 'snow',
    musicTempo: 120,
  },
  SKY_CITY: {
    id: 'SKY_CITY',
    name: 'Sky City',
    skyColor: '#081a2e',
    fogColor: '#0c243f',
    trackColor: '#0f172a',
    railColor: '#a855f7',
    buildingColors: ['#1e1b4b', '#312e81', '#4338ca'],
    ambientLight: '#c084fc',
    ambientLightIntensity: 0.9,
    sunLight: '#c084fc',
    sunLightIntensity: 1.25,
    particleType: 'clouds',
    musicTempo: 130,
  },
};

export const POWERUPS: Record<string, PowerupConfig> = {
  MAGNET: {
    type: 'MAGNET',
    name: 'Coin Magnet',
    description: 'Attracts all coins within range automatically.',
    duration: 10,
    color: '#38bdf8',
    iconName: 'magnet',
    costCoins: 800,
    costGems: 10,
    levelRequired: 1,
  },
  SHIELD: {
    type: 'SHIELD',
    name: 'Energy Shield',
    description: 'Absorbs 1 collision damage completely.',
    duration: 15,
    color: '#34d399',
    iconName: 'shield',
    costCoins: 1000,
    costGems: 12,
    levelRequired: 1,
  },
  SPEED_BOOST: {
    type: 'SPEED_BOOST',
    name: 'Speed Boost',
    description: 'Supercharges speed and makes you temporarily invincible.',
    duration: 6,
    color: '#f59e0b',
    iconName: 'zap',
    costCoins: 1200,
    costGems: 15,
    levelRequired: 3,
  },
  MULTIPLIER: {
    type: 'MULTIPLIER',
    name: '2X Multiplier',
    description: 'Doubles score gain for the active duration.',
    duration: 12,
    color: '#ec4899',
    iconName: 'flame',
    costCoins: 900,
    costGems: 10,
    levelRequired: 2,
  },
  JETPACK: {
    type: 'JETPACK',
    name: 'Jet Boost',
    description: 'Takes flight above all track hazards for a coin-rich sky run.',
    duration: 7,
    color: '#8b5cf6',
    iconName: 'rocket',
    costCoins: 2000,
    costGems: 25,
    levelRequired: 5,
  },
  TIME_FREEZE: {
    type: 'TIME_FREEZE',
    name: 'Chrono Warp',
    description: 'Slows down oncoming obstacles by 40% for easy reflexes.',
    duration: 8,
    color: '#06b6d4',
    iconName: 'clock',
    costCoins: 1500,
    costGems: 20,
    levelRequired: 4,
  },
};

/**
 * Procedural formula to generate any of the 1,000,000 levels deterministically.
 */
export function generateLevelInfo(levelNumber: number): LevelInfo {
  const clampedLevel = Math.max(1, Math.min(levelNumber, GAME_CONSTANTS.MAX_LEVELS));

  // Determine difficulty tier
  let difficultyTier: LevelInfo['difficultyTier'] = 'Beginner';
  if (clampedLevel > 500_000) difficultyTier = 'Master';
  else if (clampedLevel > 100_000) difficultyTier = 'Extreme';
  else if (clampedLevel > 10_000) difficultyTier = 'Hard';
  else if (clampedLevel > 1_000) difficultyTier = 'Intermediate';
  else if (clampedLevel > 100) difficultyTier = 'Easy';

  // Seeded math
  const seed = (clampedLevel * 9973 + 12345) % 1_000_000_007;
  const biomesList: BiomeType[] = ['NEON_CITY', 'CYBER_METRO', 'DESERT_HIGHWAY', 'FROZEN_CITY', 'SKY_CITY'];
  const biomeIndex = Math.floor((clampedLevel - 1) / 5) % biomesList.length;
  const biome = biomesList[biomeIndex];

  // Progressive parameters
  const targetDistance = Math.floor(600 + Math.log10(clampedLevel + 1) * 800 + (clampedLevel % 50) * 15);
  const targetScore = Math.floor(targetDistance * 12 + clampedLevel * 8);
  const speedMultiplier = Math.min(2.1, 1.0 + Math.log10(clampedLevel + 9) * 0.16 + (seed % 10) * 0.01);
  const obstacleDensity = Math.min(0.85, 0.35 + Math.min(clampedLevel / 2000, 0.4));
  const movingObstacleChance = Math.min(0.45, (clampedLevel > 10 ? 0.15 : 0.0) + (clampedLevel / 5000) * 0.2);
  const coinDensity = 0.65;
  const powerupFrequency = Math.max(0.08, 0.22 - Math.min(clampedLevel / 10000, 0.1));

  // Rewards
  const rewardCoins = Math.floor(100 + Math.sqrt(clampedLevel) * 25);
  const rewardGems = clampedLevel % 10 === 0 ? Math.floor(5 + clampedLevel / 100) : 0;
  const rewardXP = Math.floor(150 + clampedLevel * 12);

  const missions = [
    `Reach ${targetDistance}m distance`,
    `Collect at least ${Math.floor(targetDistance / 8)} coins`,
    `Avoid all high speed obstacles`,
  ];

  return {
    levelNumber: clampedLevel,
    name: `Level ${clampedLevel}: ${BIOMES[biome].name}`,
    biome,
    difficultyTier,
    targetDistance,
    targetScore,
    speedMultiplier,
    obstacleDensity,
    movingObstacleChance,
    coinDensity,
    powerupFrequency,
    rewardCoins,
    rewardGems,
    rewardXP,
    missions,
  };
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'char-shadow-runner',
    title: 'Shadow Runner',
    description: 'Legendary Character. Unlock the power of the shadows with double shields.',
    category: 'characters',
    priceCurrency: 'INR',
    priceAmount: 299,
    rewardPayload: { characterId: 'shadow-runner' },
    featured: true,
    tag: 'FEATURED',
    imageIcon: 'user-check',
  },
  {
    id: 'char-spark',
    title: 'Spark',
    description: 'Rare Character. High-voltage runner with +50% coin magnet radius.',
    category: 'characters',
    priceCurrency: 'COINS',
    priceAmount: 12000,
    rewardPayload: { characterId: 'spark' },
    imageIcon: 'zap',
  },
  {
    id: 'char-cyber-ninja',
    title: 'Cyber Ninja',
    description: 'Epic Character. Master acrobat with extended jump air time.',
    category: 'characters',
    priceCurrency: 'COINS',
    priceAmount: 25000,
    rewardPayload: { characterId: 'cyber-ninja' },
    imageIcon: 'crosshair',
  },
  {
    id: 'char-valkyrie',
    title: 'Valkyrie-X',
    description: 'Mythic Character. Solar Queen with permanent 8s Jet Boosts.',
    category: 'characters',
    priceCurrency: 'GEMS',
    priceAmount: 800,
    rewardPayload: { characterId: 'valkyrie' },
    tag: 'MYTHIC',
    imageIcon: 'crown',
  },
  {
    id: 'pw-magnet-pack',
    title: 'Coin Magnet',
    description: 'Collects nearby coins automatically.',
    category: 'powerups',
    priceCurrency: 'INR',
    priceAmount: 49,
    rewardPayload: { powerupType: 'MAGNET' },
    imageIcon: 'magnet',
  },
  {
    id: 'pw-shield-pack',
    title: 'Shield',
    description: 'Protects from one hit.',
    category: 'powerups',
    priceCurrency: 'INR',
    priceAmount: 49,
    rewardPayload: { powerupType: 'SHIELD' },
    imageIcon: 'shield',
  },
  {
    id: 'pw-jetpack-pack',
    title: 'Jet Pack',
    description: 'Fly for 5 seconds above all obstacles.',
    category: 'powerups',
    priceCurrency: 'INR',
    priceAmount: 99,
    rewardPayload: { powerupType: 'JETPACK' },
    imageIcon: 'rocket',
  },
  {
    id: 'coins-pouch',
    title: 'Pouch of Coins',
    description: '5,000 Golden Nexus Coins.',
    category: 'coins',
    priceCurrency: 'INR',
    priceAmount: 79,
    rewardPayload: { coins: 5000 },
    imageIcon: 'coins',
  },
  {
    id: 'coins-crate',
    title: 'Crate of Coins',
    description: '25,000 Golden Nexus Coins.',
    category: 'coins',
    priceCurrency: 'INR',
    priceAmount: 199,
    rewardPayload: { coins: 25000 },
    tag: 'POPULAR',
    imageIcon: 'coins',
  },
  {
    id: 'gems-small',
    title: 'Handful of Gems',
    description: '150 Premium Purple Gems.',
    category: 'gems',
    priceCurrency: 'INR',
    priceAmount: 149,
    rewardPayload: { gems: 150 },
    imageIcon: 'gem',
  },
  {
    id: 'gems-vault',
    title: 'Vault of Gems',
    description: '1,200 Premium Purple Gems.',
    category: 'gems',
    priceCurrency: 'INR',
    priceAmount: 899,
    rewardPayload: { gems: 1200 },
    tag: 'BEST VALUE',
    imageIcon: 'gem',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm-1',
    title: 'Collect 100 coins',
    description: 'Gather coins in a single or multiple runs.',
    type: 'coins',
    target: 100,
    progress: 60,
    category: 'daily',
    rewardType: 'coins',
    rewardAmount: 50,
    claimed: false,
  },
  {
    id: 'm-2',
    title: 'Run 2,000 meters',
    description: 'Accumulate running distance on cyber tracks.',
    type: 'distance',
    target: 2000,
    progress: 1250,
    category: 'daily',
    rewardType: 'gems',
    rewardAmount: 100,
    claimed: false,
  },
  {
    id: 'm-3',
    title: 'Use 3 power-ups',
    description: 'Grab Magnet, Shield or Jetpack in runs.',
    type: 'powerups',
    target: 3,
    progress: 1,
    category: 'daily',
    rewardType: 'xp',
    rewardAmount: 75,
    claimed: false,
  },
  {
    id: 'm-4',
    title: 'Avoid 50 obstacles',
    description: 'Jump, slide and dodge obstacles smoothly.',
    type: 'obstacles',
    target: 50,
    progress: 32,
    category: 'daily',
    rewardType: 'coins',
    rewardAmount: 50,
    claimed: false,
  },
  {
    id: 'm-5',
    title: 'Complete 1 level',
    description: 'Reach the target distance in level mode.',
    type: 'level',
    target: 1,
    progress: 0,
    category: 'daily',
    rewardType: 'gems',
    rewardAmount: 100,
    claimed: false,
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-dist-1',
    title: 'First Step',
    description: 'Run your first 1,000 meters.',
    target: 1000,
    current: 1000,
    rewardType: 'coins',
    rewardAmount: 500,
    unlocked: true,
    claimed: true,
    category: 'Distance',
  },
  {
    id: 'ach-dist-2',
    title: 'Marathon Runner',
    description: 'Reach 10,000 total meters run.',
    target: 10000,
    current: 4500,
    rewardType: 'gems',
    rewardAmount: 50,
    unlocked: false,
    claimed: false,
    category: 'Distance',
  },
  {
    id: 'ach-score-1',
    title: 'High Scorer',
    description: 'Achieve a score of 100,000 points.',
    target: 100000,
    current: 100000,
    rewardType: 'coins',
    rewardAmount: 1000,
    unlocked: true,
    claimed: false,
    category: 'Score',
  },
  {
    id: 'ach-coins-1',
    title: 'Gold Collector',
    description: 'Collect 1,000 coins in game.',
    target: 1000,
    current: 780,
    rewardType: 'gems',
    rewardAmount: 25,
    unlocked: false,
    claimed: false,
    category: 'Coins',
  },
  {
    id: 'ach-levels-1',
    title: 'Level Master',
    description: 'Reach Level 25 in progression.',
    target: 25,
    current: 12,
    rewardType: 'gems',
    rewardAmount: 100,
    unlocked: false,
    claimed: false,
    category: 'Levels',
  },
];

export const DAILY_REWARDS: DailyRewardDay[] = [
  { day: 1, type: 'coins', amount: 500, title: '500 Coins', claimed: true, canClaim: false },
  { day: 2, type: 'xp', amount: 1000, title: '1,000 XP', claimed: false, canClaim: true },
  { day: 3, type: 'powerup', amount: 1, title: 'Jet Pack', claimed: false, canClaim: false },
  { day: 4, type: 'gems', amount: 100, title: '100 Gems', claimed: false, canClaim: false },
  { day: 5, type: 'booster', amount: 1, title: '2X Booster', claimed: false, canClaim: false },
  { day: 6, type: 'fragment', amount: 1, title: 'Hero Fragment', claimed: false, canClaim: false },
  { day: 7, type: 'chest', amount: 1, title: 'Legendary Chest', claimed: false, canClaim: false },
];
