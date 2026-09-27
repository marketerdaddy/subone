import React, { useEffect } from 'react';
import { Trophy, Award, Sparkles, RefreshCw, Home, ArrowRight, Zap } from 'lucide-react';
import { GameButton } from '../common/GameButton';
import confetti from 'canvas-confetti';

interface VictoryScreenProps {
  score: number;
  distance: number;
  coins: number;
  combo: number;
  xpGained: number;
  level: number;
  isNewRecord: boolean;
  onContinue: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  score,
  distance,
  coins,
  combo,
  xpGained,
  level,
  isNewRecord,
  onContinue,
  onReplay,
  onHome,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#facc15', '#ec4899', '#ffffff'],
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '30px 20px',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(30, 27, 75, 0.75) 0%, rgba(10, 13, 30, 0.95) 75%, #05070f 100%), url("/images/main_menu_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="safe-top safe-bottom"
    >
      <div />

      {/* Main Victory Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(250, 204, 21, 0.4)',
          borderRadius: '28px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(250, 204, 21, 0.25)',
          textAlign: 'center',
        }}
      >
        {isNewRecord && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(90deg, #f59e0b, #facc15)',
              color: '#422006',
              fontWeight: 900,
              fontSize: '12px',
              letterSpacing: '2px',
              padding: '6px 16px',
              borderRadius: '9999px',
              marginBottom: '12px',
              boxShadow: '0 0 16px rgba(250, 204, 21, 0.8)',
            }}
          >
            <Sparkles size={16} />
            NEW HIGH SCORE RECORD!
          </div>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 7vw, 40px)',
            fontWeight: 900,
            letterSpacing: '2px',
            background: 'linear-gradient(180deg, #ffffff 0%, #facc15 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(250, 204, 21, 0.6)',
            marginBottom: '4px',
          }}
        >
          RUN COMPLETE
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
          Mission accomplished for Level {level}
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>FINAL SCORE</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc', marginTop: '2px' }}>
              {score.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>DISTANCE</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
              {distance}m
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>COINS EARNED</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#facc15', marginTop: '2px' }}>
              +{coins} 🪙
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>XP GAINED</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#ec4899', marginTop: '2px' }}>
              +{xpGained} XP
            </div>
          </div>
        </div>

        {/* Combo Badge */}
        <div
          style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#facc15',
            fontWeight: 800,
          }}
        >
          Peak Streak: {combo}x Multiplier Active!
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <GameButton
          variant="gold"
          size="lg"
          onClick={onContinue}
          icon={<ArrowRight size={20} />}
          fullWidth
        >
          NEXT LEVEL
        </GameButton>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <GameButton
            variant="outline"
            size="md"
            onClick={onReplay}
            icon={<RefreshCw size={18} />}
          >
            REPLAY
          </GameButton>

          <GameButton
            variant="cyan"
            size="md"
            onClick={onHome}
            icon={<Home size={18} />}
          >
            HOME
          </GameButton>
        </div>
      </div>
    </div>
  );
};
