export type GameState =
  | 'LOADING'
  | 'MAIN_MENU'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'REVIVE'
  | 'SHOP'
  | 'CHARACTERS'
  | 'MISSIONS'
  | 'PROFILE'
  | 'LEADERBOARD'
  | 'SETTINGS'
  | 'DAILY_REWARD';

export type CharacterRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CharacterSkin {
  id: string;
  name: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  priceCoins?: number;
  priceGems?: number;
  unlocked: boolean;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  rarity: CharacterRarity;
  stats: {
    speed: number;   // 0 - 100
    jump: number;    // 0 - 100
    shield: number;  // 0 - 100
    magnet: number;  // 0 - 100
  };
  ability: {
    name: string;
    description: string;
    multiplierBonus: number;
    magnetRangeBonus: number;
    shieldDurationBonus: number;
  };
  skins: CharacterSkin[];
  activeSkinId: string;
  priceCoins?: number;
  priceGems?: number;
  realPriceINR?: number;
  unlocked: boolean;
}

export type PowerupType =
  | 'MAGNET'
  | 'SHIELD'
  | 'SPEED_BOOST'
  | 'MULTIPLIER'
  | 'JETPACK'
  | 'TIME_FREEZE';

export interface PowerupConfig {
  type: PowerupType;
  name: string;
  description: string;
  duration: number; // in seconds
  color: string;
  iconName: string;
  costCoins: number;
  costGems?: number;
  levelRequired: number;
}

export interface ActivePowerup {
  type: PowerupType;
  remainingTime: number;
  duration: number;
}

export type BiomeType =
  | 'NEON_CITY'
  | 'CYBER_METRO'
  | 'DESERT_HIGHWAY'
  | 'FROZEN_CITY'
  | 'SKY_CITY';

export interface BiomeConfig {
  id: BiomeType;
  name: string;
  skyColor: string;
  fogColor: string;
  trackColor: string;
  railColor: string;
  buildingColors: string[];
  ambientLight: string;
  ambientLightIntensity: number;
  sunLight: string;
  sunLightIntensity: number;
  particleType: 'sparks' | 'hologram' | 'dust' | 'snow' | 'clouds';
  musicTempo: number;
}

export interface LevelInfo {
  levelNumber: number;
  name: string;
  biome: BiomeType;
  difficultyTier: 'Beginner' | 'Easy' | 'Intermediate' | 'Hard' | 'Extreme' | 'Master';
  targetDistance: number;
  targetScore: number;
  speedMultiplier: number;
  obstacleDensity: number;
  movingObstacleChance: number;
  coinDensity: number;
  powerupFrequency: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXP: number;
  missions: string[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'coins' | 'distance' | 'obstacles' | 'powerups' | 'score' | 'jumps' | 'level';
  target: number;
  progress: number;
  category: 'daily' | 'weekly' | 'event';
  rewardType: 'coins' | 'gems' | 'xp';
  rewardAmount: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: 'coins' | 'gems';
  rewardAmount: number;
  unlocked: boolean;
  claimed: boolean;
  category: 'Distance' | 'Score' | 'Coins' | 'Levels' | 'Characters' | 'Power-ups';
}

export interface DailyRewardDay {
  day: number;
  type: 'coins' | 'xp' | 'powerup' | 'gems' | 'booster' | 'fragment' | 'chest';
  amount: number;
  title: string;
  claimed: boolean;
  canClaim: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  isPlayer?: boolean;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  category: 'characters' | 'skins' | 'powerups' | 'coins' | 'gems' | 'bundles';
  priceCurrency: 'COINS' | 'GEMS' | 'INR';
  priceAmount: number;
  rewardPayload: {
    characterId?: string;
    skinId?: string;
    powerupType?: PowerupType;
    coins?: number;
    gems?: number;
  };
  featured?: boolean;
  tag?: string;
  imageIcon: string;
}

export interface PlayerStats {
  highestScore: number;
  totalDistance: number; // in meters
  gamesPlayed: number;
  totalCoinsCollected: number;
  totalObstaclesAvoided: number;
  achievementsCompleted: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  stats: PlayerStats;
  selectedCharacterId: string;
  unlockedCharacters: string[];
  unlockedSkins: string[];
  activePowerupsInventory: Record<PowerupType, number>;
  dailyRewardsDay: number;
  lastDailyClaimTimestamp: number;
  settings: GameSettings;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  highContrastMode: boolean;
  reducedMotion: boolean;
  hapticFeedback: boolean;
  language: string;
}

export interface PurchaseTransaction {
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  createdAt: string;
  emailSent: boolean;
  recipientEmail?: string;
}
