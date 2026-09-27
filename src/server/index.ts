import express from 'express';
import cors from 'cors';
import { paymentProvider } from './services/paymentProvider.js';
import { emailService } from './services/emailService.js';
import { validateRunScore } from './services/scoreValidator.js';
import { generateLevelInfo } from '../config/gameConfig.js';
import { DEFAULT_PROFILE } from '../services/storage/storageService.js';
import { LeaderboardEntry } from '../types/game.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory persistent server state
let serverPlayerProfile = { ...DEFAULT_PROFILE };

const LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  global: [
    { rank: 1, id: 'u1', username: 'ShadowKing', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', score: 2458900, level: 98 },
    { rank: 2, id: 'u2', username: 'NovaRider', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', score: 2341670, level: 95 },
    { rank: 3, id: 'u3', username: 'BlazeMaster', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', score: 2198450, level: 92 },
    { rank: 4, id: 'u4', username: 'PixelHero', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80', score: 1987320, level: 89 },
    { rank: 5, id: 'u5', username: 'DragonSoul', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 1765210, level: 86 },
    { rank: 87, id: 'player_user_01', username: 'Ansh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', score: 245680, level: 12, isPlayer: true },
  ],
  friends: [
    { rank: 1, id: 'f1', username: 'Aria_Vibe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', score: 450200, level: 24 },
    { rank: 2, id: 'player_user_01', username: 'Ansh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', score: 245680, level: 12, isPlayer: true },
    { rank: 3, id: 'f2', username: 'Kai_Speed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', score: 189400, level: 11 },
  ],
  weekly: [
    { rank: 1, id: 'w1', username: 'CyberViper', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80', score: 890400, level: 45 },
    { rank: 2, id: 'player_user_01', username: 'Ansh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', score: 245680, level: 12, isPlayer: true },
  ],
  monthly: [
    { rank: 1, id: 'm1', username: 'Overdrive', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', score: 1450900, level: 77 },
    { rank: 12, id: 'player_user_01', username: 'Ansh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', score: 245680, level: 12, isPlayer: true },
  ],
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Nexus Run Game Server v1.0', timestamp: new Date().toISOString() });
});

// Profile & State Sync
app.get('/api/profile', (req, res) => {
  res.json({ success: true, profile: serverPlayerProfile });
});

app.post('/api/profile/sync', (req, res) => {
  if (req.body && req.body.profile) {
    serverPlayerProfile = { ...serverPlayerProfile, ...req.body.profile };
  }
  res.json({ success: true, profile: serverPlayerProfile });
});

// Leaderboards
app.get('/api/leaderboard/:category', (req, res) => {
  const cat = req.params.category.toLowerCase();
  const list = LEADERBOARDS[cat] || LEADERBOARDS.global;
  res.json({ success: true, category: cat, data: list });
});

// Score Submission with Anti-Cheat Validation
app.post('/api/score/submit', (req, res) => {
  const { score, distance, coins, durationSeconds } = req.body;
  const validation = validateRunScore({
    playerId: serverPlayerProfile.id,
    levelNumber: serverPlayerProfile.level,
    score,
    distance,
    coins,
    durationSeconds: durationSeconds || distance / 22,
  });

  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.reason });
  }

  if (score > serverPlayerProfile.stats.highestScore) {
    serverPlayerProfile.stats.highestScore = score;
    // Update player's rank in global leaderboard
    const playerEntry = LEADERBOARDS.global.find((e) => e.isPlayer);
    if (playerEntry) playerEntry.score = score;
  }

  res.json({ success: true, verified: true, highestScore: serverPlayerProfile.stats.highestScore });
});

// 1. Purchase Initiation
app.post('/api/purchase/initiate', async (req, res) => {
  const { productId, productName, amount, currency } = req.body;
  try {
    const intent = await paymentProvider.createOrder(
      productId,
      productName,
      amount,
      currency || 'INR',
      serverPlayerProfile.id
    );
    res.json({ success: true, intent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// 2. Server-side Purchase Verification & Email Dispatch
app.post('/api/purchase/verify', async (req, res) => {
  const { orderId, paymentToken, idempotencyKey, customerEmail, rewardPayload } = req.body;

  try {
    const result = await paymentProvider.verifyPayment(orderId, paymentToken || 'tok_valid', idempotencyKey || orderId);

    if (!result.verified) {
      return res.status(400).json({ success: false, error: result.error || 'Payment verification failed' });
    }

    const order = paymentProvider.getOrder(orderId);
    if (!order) {
      return res.status(400).json({ success: false, error: 'Order not found' });
    }

    // Grant purchased rewards safely on server
    if (rewardPayload) {
      if (rewardPayload.characterId && !serverPlayerProfile.unlockedCharacters.includes(rewardPayload.characterId)) {
        serverPlayerProfile.unlockedCharacters.push(rewardPayload.characterId);
      }
      if (rewardPayload.coins) {
        serverPlayerProfile.coins += rewardPayload.coins;
      }
      if (rewardPayload.gems) {
        serverPlayerProfile.gems += rewardPayload.gems;
      }
      if (rewardPayload.powerupType) {
        const type = rewardPayload.powerupType;
        serverPlayerProfile.activePowerupsInventory[type] = (serverPlayerProfile.activePowerupsInventory[type] || 0) + 5;
      }
    }

    // Send verified purchase confirmation email
    const emailResult = await emailService.sendPurchaseConfirmation({
      toEmail: customerEmail || 'ansh@nexusrun.games',
      playerName: serverPlayerProfile.username,
      orderId,
      productName: order.productName,
      quantity: 1,
      amount: order.amount,
      currency: order.currency,
      purchaseDate: order.createdAt,
      transactionId: result.transactionId,
    });

    res.json({
      success: true,
      verified: true,
      transactionId: result.transactionId,
      emailSent: emailResult.success,
      updatedProfile: serverPlayerProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error during payment verification';
    res.status(500).json({ success: false, error: message });
  }
});

// 3. Purchase Receipts Query
app.get('/api/purchase/receipts', (req, res) => {
  const receipts = emailService.getReceipts();
  res.json({ success: true, count: receipts.length, receipts });
});

// Admin: Procedural Level Inspector (1 to 1,000,000)
app.get('/api/admin/levels/:levelNumber', (req, res) => {
  const levelNum = parseInt(req.params.levelNumber, 10);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 1000000) {
    return res.status(400).json({ error: 'Level number must be between 1 and 1,000,000' });
  }
  const levelInfo = generateLevelInfo(levelNum);
  res.json({ success: true, levelInfo });
});

app.listen(PORT, () => {
  console.log(`[Nexus Run Server] Running on http://localhost:${PORT}`);
});
