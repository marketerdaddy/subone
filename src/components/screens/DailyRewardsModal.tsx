import React, { useState } from 'react';
import { Gift, Coins, Gem, Rocket, Sparkles, Check, X } from 'lucide-react';
import { PlayerProfile, DailyRewardDay } from '../../types/game';
import { DAILY_REWARDS } from '../../config/gameConfig';
import { GameButton } from '../common/GameButton';
import { storageService } from '../../services/storage/storageService';
import confetti from 'canvas-confetti';

interface DailyRewardsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({ profile, onClose, onProfileUpdated }) => {
  const [rewards, setRewards] = useState<DailyRewardDay[]>(DAILY_REWARDS);
  const activeDay = rewards.find((r) => r.canClaim && !r.claimed) || rewards[1];

  const handleClaim = () => {
    if (!activeDay || activeDay.claimed) return;

    let updated = profile;
    if (activeDay.type === 'coins') {
      updated = storageService.updateCoinsAndGems(activeDay.amount, 0);
    } else if (activeDay.type === 'gems') {
      updated = storageService.updateCoinsAndGems(0, activeDay.amount);
    } else if (activeDay.type === 'xp') {
      updated = { ...profile, xp: profile.xp + activeDay.amount };
      storageService.saveProfile(updated);
    }

    setRewards((prev) =>
      prev.map((r) => (r.day === activeDay.day ? { ...r, claimed: true, canClaim: false } : r))
    );

    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    onProfileUpdated(updated);
  };

  const getRewardGraphic = (type: DailyRewardDay['type']) => {
    switch (type) {
      case 'coins': return <Coins size={28} color="#facc15" />;
      case 'gems': return <Gem size={28} color="#c084fc" />;
      case 'xp': return <Sparkles size={28} color="#38bdf8" />;
      case 'powerup': case 'booster': return <Rocket size={28} color="#ec4899" />;
      case 'chest': return <Gift size={36} color="#fbbf24" />;
      default: return <Gift size={28} color="#38bdf8" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(3, 7, 18, 0.88)',
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
          maxWidth: '440px',
          background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 50%, #090d16 100%)',
          border: '1px solid rgba(192, 132, 252, 0.3)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(126, 34, 206, 0.25)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              background: 'radial-gradient(circle, #7e22ce, #3b0764)',
              border: '2px solid #eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.5)',
              marginBottom: '12px',
            }}
          >
            <Gift size={40} color="#fde047" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
            Daily Rewards
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            Log in for 7 days and get amazing rewards!
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          {rewards.slice(0, 4).map((r) => {
            const isToday = r.canClaim;
            return (
              <div
                key={r.day}
                style={{
                  background: isToday ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                  border: isToday ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: isToday ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Day {r.day}</span>
                <div style={{ margin: '8px 0' }}>{getRewardGraphic(r.type)}</div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                  {r.claimed ? 'Claimed' : r.title}
                </span>
                {r.claimed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#10b981',
                      borderRadius: '50%',
                      padding: '2px',
                    }}
                  >
                    <Check size={12} color="#ffffff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 2fr',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {rewards.slice(4, 7).map((r) => {
            const isDay7 = r.day === 7;
            return (
              <div
                key={r.day}
                style={{
                  background: isDay7
                    ? 'linear-gradient(135deg, rgba(126, 34, 206, 0.4), rgba(192, 132, 252, 0.2))'
                    : 'rgba(30, 41, 59, 0.6)',
                  border: isDay7 ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: isDay7 ? '0 0 20px rgba(192, 132, 252, 0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: '11px', color: isDay7 ? '#e9d5ff' : '#94a3b8', fontWeight: 700 }}>
                  Day {r.day}
                </span>
                <div style={{ margin: '8px 0' }}>{getRewardGraphic(r.type)}</div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: isDay7 ? '#fde047' : '#f8fafc' }}>
                  {r.title}
                </span>
              </div>
            );
          })}
        </div>

        <GameButton
          fullWidth
          size="lg"
          variant="gold"
          disabled={!activeDay || activeDay.claimed}
          onClick={handleClaim}
        >
          {activeDay && !activeDay.claimed ? 'Claim Reward' : 'Come Back Tomorrow'}
        </GameButton>
      </div>
    </div>
  );
};
