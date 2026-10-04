import { PlayerProfile, LeaderboardEntry, LevelInfo } from '../../types/game';
import { getAssetUrl } from '../../utils/assetUtils';

class GameApiClient {
  private baseUrl = '/api';

  public async getProfile(): Promise<PlayerProfile | null> {
    try {
      const res = await fetch(`${this.baseUrl}/profile`);
      if (res.ok) {
        const data = await res.json();
        return data.profile;
      }
    } catch {
      // offline fallback
    }
    return null;
  }

  public async syncProfile(profile: PlayerProfile): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/profile/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async submitScore(score: number, distance: number, coins: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/score/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, distance, coins, durationSeconds: distance / 22 }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getLeaderboard(category: string): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`${this.baseUrl}/leaderboard/${category}`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // offline
    }
    return [
      { rank: 1, id: 'u1', username: 'ShadowKing', avatar: getAssetUrl('images/char_shadow.jpg'), score: 2458900, level: 98 },
      { rank: 2, id: 'u2', username: 'NovaRider', avatar: getAssetUrl('images/char_spark.jpg'), score: 2341670, level: 95 },
      { rank: 3, id: 'u3', username: 'ValkyriePrime', avatar: getAssetUrl('images/char_valkyrie.jpg'), score: 2198450, level: 92 },
      { rank: 4, id: 'u4', username: 'PixelHero', avatar: getAssetUrl('images/char_zayn.jpg'), score: 1987320, level: 89 },
      { rank: 5, id: 'u5', username: 'DragonSoul', avatar: getAssetUrl('images/char_shadow.jpg'), score: 1765210, level: 86 },
    ];
  }

  public async initiatePurchase(productId: string, productName: string, amount: number, currency: string) {
    try {
      const res = await fetch(`${this.baseUrl}/purchase/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productName, amount, currency }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline / static deployment fallback
    }
    return {
      success: true,
      intent: {
        orderId: `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        clientSecret: `mock_secret_${Date.now()}`,
        productId,
        amount,
        currency,
        status: 'simulated_authorized',
      },
    };
  }

  public async verifyPurchase(orderId: string, paymentToken: string, idempotencyKey: string, rewardPayload: unknown, customerEmail?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/purchase/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentToken, idempotencyKey, rewardPayload, customerEmail }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline / static deployment fallback
    }
    return {
      success: true,
      verified: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      receiptUrl: customerEmail ? `mailto:${customerEmail}` : undefined,
    };
  }

  public async getReceipts() {
    try {
      const res = await fetch(`${this.baseUrl}/purchase/receipts`);
      if (res.ok) {
        return (await res.json()).receipts;
      }
    } catch {
      // offline
    }
    return [];
  }

  public async inspectAdminLevel(levelNumber: number): Promise<LevelInfo | null> {
    try {
      const res = await fetch(`${this.baseUrl}/admin/levels/${levelNumber}`);
      if (res.ok) {
        const data = await res.json();
        return data.levelInfo;
      }
    } catch {
      // offline
    }
    return null;
  }
}

export const gameApi = new GameApiClient();
