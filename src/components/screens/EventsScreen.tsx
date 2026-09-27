import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Award, Shield, Sparkles, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { GameButton } from '../common/GameButton';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import confetti from 'canvas-confetti';

interface EventsScreenProps {
  coins: number;
  gems: number;
  onBack: () => void;
  onPlayEventRun: (level: number) => void;
  onClaimReward: (reward: { coins?: number; gems?: number }) => void;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({
  coins,
  gems,
  onBack,
  onPlayEventRun,
  onClaimReward,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32, seconds: 45 });
  const [currentEventLevel, setCurrentEventLevel] = useState(3);
  const [claimedLevels, setClaimedLevels] = useState<number[]>([1, 2]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eventLevels = [
    {
      level: 1,
      title: 'Neon Outskirts',
      target: '1,500m',
      rewardText: '+2,000 Coins',
      reward: { coins: 2000 },
      type: 'coins',
    },
    {
      level: 2,
      title: 'Maglev Depots',
      target: '2,800m',
      rewardText: '+50 Gems',
      reward: { gems: 50 },
      type: 'gems',
    },
    {
      level: 3,
      title: 'Rainy Skylines',
      target: '4,000m',
      rewardText: '+5,000 Coins & XP Booster',
      reward: { coins: 5000 },
      type: 'booster',
    },
    {
      level: 4,
      title: 'Aero Tunnels',
      target: '6,500m',
      rewardText: '+150 Gems',
      reward: { gems: 150 },
      type: 'gems',
    },
    {
      level: 5,
      title: 'Nexus Apex Summit',
      target: '10,000m',
      rewardText: 'Legendary "Void Pulse" Trail & 500 Gems',
      reward: { gems: 500 },
      type: 'skin',
    },
  ];

  const handleClaim = (lvl: number, reward: { coins?: number; gems?: number }) => {
    if (claimedLevels.includes(lvl)) return;
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setClaimedLevels([...claimedLevels, lvl]);
    onClaimReward(reward);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: '#090d1a',
        overflowY: 'auto',
      }}
      className="safe-top safe-bottom"
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', color: '#f8fafc' }}>
            LIMITED-TIME EVENT
          </div>
          <div style={{ fontSize: '11px', color: '#ec4899', fontWeight: 700, letterSpacing: '2px' }}>
            SEASON PASS EXCLUSIVE
          </div>
        </div>

        <CurrencyDisplay coins={coins} gems={gems} />
      </div>

      <div style={{ padding: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* Cinematic Promotional Banner */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '2px solid rgba(236, 72, 153, 0.4)',
            boxShadow: '0 12px 35px rgba(236, 72, 153, 0.25)',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          <img
            src="/images/event_nightfall.jpg"
            alt="Nexus Nightfall"
            style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(9, 13, 26, 0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, letterSpacing: '2px' }}>
                  FEATURED SPRINT
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff' }}>
                  NEXUS NIGHTFALL
                </div>
              </div>

              {/* Countdown Gauge */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(236, 72, 153, 0.5)',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ec4899',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <Clock size={14} />
                <span>
                  {String(timeLeft.days).padStart(2, '0')}D {String(timeLeft.hours).padStart(2, '0')}H {String(timeLeft.minutes).padStart(2, '0')}M
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Ladder */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#ec4899" />
              EVENT ROADMAP (LEVEL {currentEventLevel}/5)
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Complete milestones to earn gear
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {eventLevels.map((lvl) => {
              const isCompleted = lvl.level < currentEventLevel || claimedLevels.includes(lvl.level);
              const isCurrent = lvl.level === currentEventLevel;
              const isLocked = lvl.level > currentEventLevel;
              const isClaimed = claimedLevels.includes(lvl.level);

              return (
                <div
                  key={lvl.level}
                  style={{
                    background: isCurrent
                      ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: isCurrent
                      ? '1px solid #ec4899'
                      : isCompleted
                      ? '1px solid rgba(34, 197, 94, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isCurrent ? '0 4px 20px rgba(236, 72, 153, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isCompleted
                          ? 'rgba(34, 197, 94, 0.2)'
                          : isCurrent
                          ? 'linear-gradient(135deg, #ec4899, #d946ef)'
                          : 'rgba(15, 23, 42, 0.6)',
                        border: isCompleted ? '1px solid #22c55e' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCompleted ? '#22c55e' : '#ffffff',
                        fontWeight: 900,
                        fontSize: '16px',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={22} /> : isLocked ? <Lock size={18} color="#64748b" /> : `0${lvl.level}`}
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                        {lvl.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Distance Goal: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{lvl.target}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 700, marginTop: '2px' }}>
                        Reward: {lvl.rewardText}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCompleted && !isClaimed ? (
                      <GameButton
                        variant="gold"
                        size="sm"
                        onClick={() => handleClaim(lvl.level, lvl.reward)}
                      >
                        CLAIM
                      </GameButton>
                    ) : isClaimed ? (
                      <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 800 }}>CLAIMED</span>
                    ) : isCurrent ? (
                      <GameButton
                        variant="cyan"
                        size="sm"
                        onClick={() => onPlayEventRun(lvl.level)}
                        icon={<ChevronRight size={16} />}
                      >
                        RUN
                      </GameButton>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>LOCKED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
