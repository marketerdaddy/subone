import React, { useState } from 'react';
import { X, Search, ShieldAlert, Sparkles, Coins, Gem } from 'lucide-react';
import { PlayerProfile, LevelInfo } from '../../types/game';
import { generateLevelInfo, CHARACTERS } from '../../config/gameConfig';
import { GameButton } from '../common/GameButton';
import { storageService } from '../../services/storage/storageService';

interface AdminDashboardModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onStartLevel: (levelNum: number) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onStartLevel,
}) => {
  const [levelInput, setLevelInput] = useState<string>('100');
  const [inspectedLevel, setInspectedLevel] = useState<LevelInfo>(generateLevelInfo(100));

  const handleInspect = () => {
    const num = parseInt(levelInput, 10);
    if (!isNaN(num)) {
      setInspectedLevel(generateLevelInfo(num));
    }
  };

  const grantCurrency = (coins: number, gems: number) => {
    const updated = storageService.updateCoinsAndGems(coins, gems);
    onProfileUpdated(updated);
  };

  const unlockAll = () => {
    const allCharIds = CHARACTERS.map((c) => c.id);
    const updated = { ...profile, unlockedCharacters: allCharIds };
    storageService.saveProfile(updated);
    onProfileUpdated(updated);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15' }}>
            <ShieldAlert size={22} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
              Admin Engine Console
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1,000,000 Level Generator Inspector */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
              1,000,000 Procedural Level Inspector
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="number"
                min="1"
                max="1000000"
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                placeholder="Enter Level 1 - 1,000,000"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <GameButton size="sm" variant="cyan" onClick={handleInspect} icon={<Search size={14} />}>
                Inspect
              </GameButton>
              <GameButton size="sm" variant="gold" onClick={() => { onStartLevel(inspectedLevel.levelNumber); onClose(); }}>
                Test Run
              </GameButton>
            </div>

            {/* Inspected Level Parameters */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px',
                borderRadius: '12px',
              }}
            >
              <div><strong style={{ color: '#94a3b8' }}>Tier:</strong> <span style={{ color: '#facc15' }}>{inspectedLevel.difficultyTier}</span></div>
              <div><strong style={{ color: '#94a3b8' }}>Biome:</strong> <span style={{ color: '#38bdf8' }}>{inspectedLevel.biome}</span></div>
              <div><strong style={{ color: '#94a3b8' }}>Target Dist:</strong> {inspectedLevel.targetDistance}m</div>
              <div><strong style={{ color: '#94a3b8' }}>Target Score:</strong> {inspectedLevel.targetScore.toLocaleString()}</div>
              <div><strong style={{ color: '#94a3b8' }}>Speed Multiplier:</strong> {inspectedLevel.speedMultiplier.toFixed(2)}x</div>
              <div><strong style={{ color: '#94a3b8' }}>Moving Hazards:</strong> {Math.round(inspectedLevel.movingObstacleChance * 100)}%</div>
              <div><strong style={{ color: '#94a3b8' }}>Coins Reward:</strong> +{inspectedLevel.rewardCoins}</div>
              <div><strong style={{ color: '#94a3b8' }}>Gems Reward:</strong> +{inspectedLevel.rewardGems}</div>
            </div>
          </div>

          {/* Quick Sandbox Grants */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '10px' }}>
              Player Vault Grants & Overrides
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <GameButton size="sm" variant="outline" onClick={() => grantCurrency(10000, 0)} icon={<Coins size={14} color="#facc15" />}>
                +10,000 Coins
              </GameButton>
              <GameButton size="sm" variant="outline" onClick={() => grantCurrency(0, 500)} icon={<Gem size={14} color="#c084fc" />}>
                +500 Gems
              </GameButton>
            </div>

            <GameButton size="sm" fullWidth variant="cyan" onClick={unlockAll} icon={<Sparkles size={14} />}>
              Unlock All 5 Characters Instantly
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};
