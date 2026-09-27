import React from 'react';
import { Play, ShieldAlert, Award, Clock, ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { LevelInfo } from '../../types/game';
import { GameButton } from '../common/GameButton';

interface LevelIntroScreenProps {
  levelInfo: LevelInfo;
  onStartRun: () => void;
  onBack: () => void;
}

export const LevelIntroScreen: React.FC<LevelIntroScreenProps> = ({
  levelInfo,
  onStartRun,
  onBack,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        backgroundImage: `radial-gradient(circle at 50% 40%, rgba(10, 13, 30, 0.45) 0%, rgba(5, 7, 15, 0.9) 75%, #03050a 100%), url("/images/event_nightfall.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className="safe-top safe-bottom"
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div
          style={{
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            borderRadius: '9999px',
            padding: '6px 16px',
            color: '#facc15',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} />
          CHAPTER {Math.floor((levelInfo.levelNumber - 1) / 10) + 1}
        </div>
      </div>

      {/* Center Cinematic Level Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '28px',
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.2)',
          maxWidth: '460px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          OPERATION RUNNER
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 8vw, 44px)',
            fontWeight: 900,
            letterSpacing: '2px',
            background: 'linear-gradient(180deg, #ffffff 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 25px rgba(56, 189, 248, 0.6)',
            marginBottom: '4px',
          }}
        >
          LEVEL {levelInfo.levelNumber}
        </h1>

        <div
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#facc15',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          {levelInfo.name}
        </div>

        <p
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'italic',
            marginBottom: '20px',
            maxWidth: '320px',
          }}
        >
          "The neon city never sleeps. High-speed maglev transit active."
        </p>

        {/* Hazard & Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            width: '100%',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Clock size={16} color="#38bdf8" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>TARGET</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
              {levelInfo.targetDistance}m
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Flame size={16} color="#f97316" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>DIFFICULTY</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f97316' }}>
              {levelInfo.difficultyTier.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Award size={16} color="#facc15" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>REWARD</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#facc15' }}>
              +{levelInfo.rewardCoins} 🪙
            </div>
          </div>
        </div>

        {/* Hazard Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '11px',
            color: '#fca5a5',
            fontWeight: 600,
            width: '100%',
          }}
        >
          <ShieldAlert size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>Hazards Active: Maglev High-Speed Trains & Elevated Barriers</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}>
        <GameButton
          variant="gold"
          size="lg"
          onClick={onStartRun}
          icon={<Play size={24} fill="currentColor" />}
          fullWidth
        >
          RUN NOW
        </GameButton>
      </div>
    </div>
  );
};
