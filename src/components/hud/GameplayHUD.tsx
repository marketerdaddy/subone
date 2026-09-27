import React from 'react';
import { Pause, Magnet, Shield, Zap, Flame, Rocket, Clock } from 'lucide-react';
import { ActivePowerup, PlayerProfile, PowerupType } from '../../types/game';
import { CurrencyDisplay } from '../common/CurrencyDisplay';

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

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
      }}
      className="safe-top safe-bottom"
    >
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        {/* Top-Left: Player Info */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '6px 12px 6px 6px',
          }}
        >
          <img
            src={profile.avatar}
            alt={profile.username}
            style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              border: '2px solid #38bdf8',
              objectFit: 'cover',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                Lv. {profile.level}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {profile.xp}/{profile.xpToNextLevel}
              </span>
            </div>
            <div
              style={{
                width: '70px',
                height: '4px',
                background: 'rgba(51, 65, 85, 0.8)',
                borderRadius: '2px',
                marginTop: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(profile.xp / profile.xpToNextLevel) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center: Score & Distance */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '1px',
              textShadow: '0 0 16px rgba(56, 189, 248, 0.6), 0 2px 4px rgba(0,0,0,0.8)',
              lineHeight: 1,
            }}
          >
            {score.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#94a3b8',
              marginTop: '4px',
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '2px 10px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            Distance: <span style={{ color: '#38bdf8' }}>{distance.toLocaleString()} m</span>
          </div>
        </div>

        {/* Top-Right: Currencies & Pause Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <CurrencyDisplay coins={profile.coins + runCoins} gems={profile.gems} size="sm" />
          <button
            onClick={onPause}
            style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* MID-SCREEN: Combo Multiplier Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px' }}>
        {combo > 1 && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(234, 179, 8, 0.75))',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.5)',
              border: '1px solid rgba(254, 240, 138, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#422006', textTransform: 'uppercase' }}>
              Combo
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: '#422006' }}>
              x{combo}
            </span>
          </div>
        )}

        {multiplier > 1 && (
          <div
            style={{
              background: 'rgba(236, 72, 153, 0.8)',
              padding: '3px 10px',
              borderRadius: '8px',
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            {multiplier}x MULTIPLIER
          </div>
        )}
      </div>

      {/* BOTTOM AREA: Active Power-up Timers */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '12px',
          alignItems: 'flex-end',
          marginBottom: '10px',
        }}
      >
        {activePowerups.map((p) => {
          const percent = (p.remainingTime / p.duration) * 100;
          return (
            <div
              key={p.type}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '56px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              {getPowerupIcon(p.type)}
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '4px',
                }}
              >
                {Math.ceil(p.remainingTime).toString().padStart(2, '0')}s
              </span>
              <div
                style={{
                  width: '100%',
                  height: '3px',
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
                    background: '#38bdf8',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
