import React, { useState, useEffect, useRef } from 'react';
import { Pause, Magnet, Shield, Zap, Flame, Rocket, Clock, Coins, Diamond, Target, ChevronUp, ChevronDown } from 'lucide-react';
import { ActivePowerup, PlayerProfile, PowerupType } from '../../types/game';
import { getAssetUrl, AVATAR_FALLBACK_SVG } from '../../utils/assetUtils';

interface GameplayHUDProps {
  score: number;
  distance: number;
  runCoins: number;
  combo: number;
  multiplier: number;
  activePowerups: ActivePowerup[];
  profile: PlayerProfile;
  onPause: () => void;
}

interface FloatingNotice {
  id: number;
  text: string;
  color: string;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  score,
  distance,
  runCoins,
  combo,
  multiplier,
  activePowerups,
  profile,
  onPause,
}) => {
  const [notifications, setNotifications] = useState<FloatingNotice[]>([]);
  const [isMissionCollapsed, setIsMissionCollapsed] = useState(false);
  const prevCoinsRef = useRef(runCoins);
  const prevComboRef = useRef(combo);

  // Trigger floating notifications on coin milestones
  useEffect(() => {
    if (runCoins > prevCoinsRef.current) {
      const diff = runCoins - prevCoinsRef.current;
      prevCoinsRef.current = runCoins;
      const id = Date.now() + Math.random();
      setNotifications((prev) => [...prev.slice(-2), { id, text: `+${diff} COINS`, color: '#facc15' }]);
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [runCoins]);

  // Trigger floating notifications on combo increases
  useEffect(() => {
    if (combo > 1 && combo > prevComboRef.current) {
      prevComboRef.current = combo;
      const id = Date.now() + Math.random();
      setNotifications((prev) => [...prev.slice(-2), { id, text: `COMBO ×${combo}!`, color: '#ec4899' }]);
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const getPowerupIcon = (type: PowerupType) => {
    switch (type) {
      case 'MAGNET': return <Magnet size={20} color="#38bdf8" />;
      case 'SHIELD': return <Shield size={20} color="#34d399" />;
      case 'SPEED_BOOST': return <Zap size={20} color="#f59e0b" />;
      case 'MULTIPLIER': return <Flame size={20} color="#ec4899" />;
      case 'JETPACK': return <Rocket size={20} color="#8b5cf6" />;
      case 'TIME_FREEZE': return <Clock size={20} color="#06b6d4" />;
    }
  };

  // Formatted digital score with leading zeroes: 0045820
  const formattedScore = Math.floor(score).toString().padStart(7, '0');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 25,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 20px',
      }}
      className="safe-top safe-bottom"
    >
      {/* 1. TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        {/* Top-Left: Player Avatar & Level */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(7, 11, 22, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            padding: '6px 14px 6px 8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(56, 189, 248, 0.1)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={getAssetUrl(profile.avatar)}
              alt={profile.username}
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                border: '2px solid #00f0ff',
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: '#0284c7',
                borderRadius: '6px',
                padding: '1px 4px',
                fontSize: '9px',
                fontWeight: 900,
                color: '#ffffff',
                border: '1px solid #38bdf8',
              }}
            >
              PRO
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#38bdf8',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                LEVEL {profile.level}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                {profile.xp}/{profile.xpToNextLevel} XP
              </span>
            </div>
            {/* XP Gauge Bar */}
            <div
              style={{
                width: '85px',
                height: '5px',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '3px',
                marginTop: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (profile.xp / profile.xpToNextLevel) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
                  boxShadow: '0 0 8px #00f0ff',
                }}
              />
            </div>
          </div>

          {/* Active Mission Tracker (Collapsible) */}
          <div
            onClick={() => setIsMissionCollapsed(!isMissionCollapsed)}
            style={{
              marginTop: '8px',
              background: 'rgba(7, 11, 22, 0.88)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '190px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}
          >
            <Target size={14} color="#38bdf8" />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.5px' }}>
                  ACTIVE MISSION
                </span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#facc15' }}>
                  {Math.min(runCoins, 100)}/100
                </span>
              </div>
              {!isMissionCollapsed && (
                <>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#f8fafc',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Collect 100 Coins
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderRadius: '2px',
                      marginTop: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (runCoins / 100) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #eab308, #facc15)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            {isMissionCollapsed ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronUp size={12} color="#94a3b8" />}
          </div>
        </div>

        {/* Top-Center: Large Digital Monospace Score & Combo Multiplier */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '4px',
              textShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 2px 8px rgba(0,0,0,0.9)',
              lineHeight: 1,
            }}
          >
            {formattedScore}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            {combo > 1 ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(234, 179, 8, 0.85))',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.6)',
                  border: '1px solid rgba(254, 240, 138, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Flame size={14} color="#78350f" fill="#78350f" />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#451a03',
                    letterSpacing: '0.5px',
                  }}
                >
                  COMBO ×{combo}
                </span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(7, 11, 22, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  letterSpacing: '1px',
                }}
              >
                NEXUS RUN ACTIVE
              </div>
            )}
            {multiplier > 1 && (
              <div
                style={{
                  background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(236, 72, 153, 0.5)',
                }}
              >
                {multiplier}X BOOST
              </div>
            )}
          </div>

          {/* Floating Score / Feedback Notifications */}
          <div
            style={{
              position: 'relative',
              height: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '4px',
            }}
          >
            {notifications.map((n) => (
              <div
                key={n.id}
                className="floating-hud-notice"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: n.color,
                  letterSpacing: '1px',
                  textShadow: `0 0 12px ${n.color}, 0 2px 6px rgba(0,0,0,0.9)`,
                }}
              >
                {n.text}
              </div>
            ))}
          </div>
        </div>

        {/* Top-Right: Currencies & Distance & Pause */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
          {/* Distance Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(7, 11, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '6px 12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>DIST</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 900,
                color: '#38bdf8',
              }}
            >
              {distance.toLocaleString()}m
            </span>
          </div>

          {/* Coins Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(7, 11, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
              borderRadius: '12px',
              padding: '6px 12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <Coins size={16} color="#facc15" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 900,
                color: '#fef08a',
              }}
            >
              {profile.coins + runCoins}
            </span>
          </div>

          {/* In-Run Gems Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(7, 11, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(192, 132, 252, 0.35)',
              borderRadius: '12px',
              padding: '6px 12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <Diamond size={15} color="#c084fc" fill="#c084fc" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 900,
                color: '#e9d5ff',
              }}
            >
              {profile.gems}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            style={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              background: 'rgba(7, 11, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            <Pause size={18} color="#38bdf8" />
          </button>
        </div>
      </div>

      {/* 2. RIGHT-SIDE: Active Power-up Timers */}
      <div
        style={{
          alignSelf: 'flex-end',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginRight: '4px',
        }}
      >
        {activePowerups.map((p) => {
          const percent = (p.remainingTime / p.duration) * 100;
          return (
            <div
              key={p.type}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(7, 11, 22, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '16px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '100px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(56, 189, 248, 0.2)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {getPowerupIcon(p.type)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1,
                  }}
                >
                  {Math.ceil(p.remainingTime).toString().padStart(2, '0')}s
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(51, 65, 85, 0.6)',
                    borderRadius: '2px',
                    marginTop: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
                      boxShadow: '0 0 8px #00f0ff',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BOTTOM BAR: Cyber Speed Gauge & Energy Meter */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(7, 11, 22, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '9999px',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="#00f0ff" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 900,
                color: '#38bdf8',
                letterSpacing: '1px',
              }}
            >
              SPEED BOOST 85%
            </span>
          </div>
          {/* Energy gauge bar */}
          <div
            style={{
              width: '120px',
              height: '6px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <div
              style={{
                width: '85%',
                height: '100%',
                background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
                boxShadow: '0 0 10px #00f0ff',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
