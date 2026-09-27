import React, { useState } from 'react';
import { ArrowLeft, Coins, Gem, Zap, CheckCircle2 } from 'lucide-react';
import { Mission, PlayerProfile } from '../../types/game';
import { INITIAL_MISSIONS } from '../../config/gameConfig';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ProgressBar } from '../common/ProgressBar';
import { GameButton } from '../common/GameButton';
import { storageService } from '../../services/storage/storageService';
import confetti from 'canvas-confetti';

interface MissionsScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({ profile, onBack, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'event'>('daily');
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);

  const handleClaim = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.claimed || mission.progress < mission.target) return;

    let updated = profile;
    if (mission.rewardType === 'coins') {
      updated = storageService.updateCoinsAndGems(mission.rewardAmount, 0);
    } else if (mission.rewardType === 'gems') {
      updated = storageService.updateCoinsAndGems(0, mission.rewardAmount);
    } else if (mission.rewardType === 'xp') {
      updated = { ...profile, xp: profile.xp + mission.rewardAmount };
      storageService.saveProfile(updated);
    }

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );

    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
    onProfileUpdated(updated);
  };

  const getRewardIcon = (type: Mission['rewardType']) => {
    switch (type) {
      case 'coins': return <Coins size={14} color="#facc15" />;
      case 'gems': return <Gem size={14} color="#c084fc" />;
      case 'xp': return <Zap size={14} color="#38bdf8" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      className="safe-top safe-bottom"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          <span>Missions</span>
        </button>
        <CurrencyDisplay coins={profile.coins} gems={profile.gems} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {(['daily', 'weekly', 'event'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '12px',
              border: activeTab === tab ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === tab ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === tab ? '#38bdf8' : '#94a3b8',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Missions List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {missions.map((mission) => {
          const isComplete = mission.progress >= mission.target;
          const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);

          return (
            <div
              key={mission.id}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                    {mission.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {mission.progress.toLocaleString()} / {mission.target.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {getRewardIcon(mission.rewardType)}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                    +{mission.rewardAmount}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar progress={progressPercent} color="cyan" height={8} />
                </div>

                {mission.claimed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '12px', fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>Claimed</span>
                  </div>
                ) : (
                  <GameButton
                    size="sm"
                    variant={isComplete ? 'gold' : 'outline'}
                    disabled={!isComplete}
                    onClick={() => handleClaim(mission.id)}
                  >
                    Claim
                  </GameButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
