import { PlayerProfile, GameSettings } from '../../types/game';
import { CHARACTERS } from '../../config/gameConfig';

const STORAGE_KEY = 'nexus_run_player_profile_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  isMuted: false,
  graphicsQuality: 'high',
  highContrastMode: false,
  reducedMotion: false,
  hapticFeedback: true,
  language: 'English',
};

export const DEFAULT_PROFILE: PlayerProfile = {
  id: 'player_user_01',
  username: 'Ansh',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  verified: true,
  level: 12,
  xp: 640,
  xpToNextLevel: 1200,
  coins: 12480,
  gems: 870,
  stats: {
    highestScore: 245680,
    totalDistance: 125400, // 125.4 km
    gamesPlayed: 248,
    totalCoinsCollected: 64200,
    totalObstaclesAvoided: 3840,
    achievementsCompleted: 18,
  },
  selectedCharacterId: 'zayn',
  unlockedCharacters: ['zayn'],
  unlockedSkins: ['zayn-default'],
  activePowerupsInventory: {
    MAGNET: 3,
    SHIELD: 2,
    SPEED_BOOST: 1,
    MULTIPLIER: 2,
    JETPACK: 1,
    TIME_FREEZE: 1,
  },
  dailyRewardsDay: 2,
  lastDailyClaimTimestamp: 0,
  settings: DEFAULT_SETTINGS,
};

class StorageService {
  public loadProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          stats: { ...DEFAULT_PROFILE.stats, ...(parsed.stats || {}) },
          settings: { ...DEFAULT_PROFILE.settings, ...(parsed.settings || {}) },
          activePowerupsInventory: {
            ...DEFAULT_PROFILE.activePowerupsInventory,
            ...(parsed.activePowerupsInventory || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage, using defaults', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  public saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }

  public updateCoinsAndGems(coinsDelta: number, gemsDelta: number): PlayerProfile {
    const profile = this.loadProfile();
    profile.coins = Math.max(0, profile.coins + coinsDelta);
    profile.gems = Math.max(0, profile.gems + gemsDelta);
    if (coinsDelta > 0) {
      profile.stats.totalCoinsCollected += coinsDelta;
    }
    this.saveProfile(profile);
    return profile;
  }

  public recordRun(score: number, distance: number, coins: number, obstacles: number, xpGained: number): PlayerProfile {
    const profile = this.loadProfile();
    profile.stats.gamesPlayed += 1;
    profile.stats.totalDistance += distance;
    profile.stats.totalCoinsCollected += coins;
    profile.stats.totalObstaclesAvoided += obstacles;
    profile.coins += coins;

    if (score > profile.stats.highestScore) {
      profile.stats.highestScore = score;
    }

    // Add XP and handle level up
    profile.xp += xpGained;
    while (profile.xp >= profile.xpToNextLevel) {
      profile.xp -= profile.xpToNextLevel;
      profile.level += 1;
      profile.xpToNextLevel = Math.floor(profile.xpToNextLevel * 1.25);
      profile.gems += 10; // Level up reward!
    }

    this.saveProfile(profile);
    return profile;
  }
}

export const storageService = new StorageService();
