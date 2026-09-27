import React, { useState, useEffect } from 'react';
import { RotateCcw, Home, Sparkles, Trophy, Gem, ShieldAlert } from 'lucide-react';
import { GameButton } from '../common/GameButton';
import { PlayerProfile } from '../../types/game';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  runData: {
    score: number;
    distance: number;
    coins: number;
    obstaclesAvoided: number;
  };
  profile: PlayerProfile;
  isNewHighScore: boolean;
  onRevive: () => void;
  onRetry: () => void;
  onHome: () => void;
  onDoubleCoins: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  runData,
  profile,
  isNewHighScore,
  onRevive,
  onRetry,
  onHome,
  onDoubleCoins,
}) => {
  const [reviveTimer, setReviveTimer] = useState(5);
  const [hasDoubled, setHasDoubled] = useState(false);

  useEffect(() => {
    if (isNewHighScore) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    }

    const interval = setInterval(() => {
      setReviveTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isNewHighScore]);

  const canAffordRevive = profile.gems >= 5;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
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
          maxWidth: '420px',
          background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 60%, #090d16 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
            marginBottom: '4px',
          }}
        >
          CRASHED!
        </h2>

        {isNewHighScore && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #f59e0b, #eab308)',
              color: '#422006',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '16px',
            }}
          >
            <Trophy size={14} />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {reviveTimer > 0 && (
          <div
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
              <ShieldAlert size={24} color="#ef4444" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>Revive with Shield</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Expiring in {reviveTimer}s</div>
              </div>
            </div>

            <GameButton
              size="sm"
              variant="purple"
              disabled={!canAffordRevive}
              onClick={onRevive}
              icon={<Gem size={14} />}
            >
              5 Gems
            </GameButton>
          </div>
        )}

        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Final Score
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>
              {runData.score.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Distance</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
                {runData.distance}m
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Coins</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#facc15' }}>
                {hasDoubled ? runData.coins * 2 : runData.coins}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Dodged</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#34d399' }}>
                {runData.obstaclesAvoided}
              </div>
            </div>
          </div>
        </div>

        {!hasDoubled && runData.coins > 0 && (
          <button
            onClick={() => {
              setHasDoubled(true);
              onDoubleCoins();
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(250, 204, 21, 0.15)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
              color: '#fde047',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={16} />
            <span>Double Collected Coins (+{runData.coins})</span>
          </button>
        )}

        <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
          <GameButton variant="outline" fullWidth onClick={onHome} icon={<Home size={18} />}>
            Home
          </GameButton>
          <GameButton variant="gold" fullWidth onClick={onRetry} icon={<RotateCcw size={18} />}>
            Play Again
          </GameButton>
        </div>
      </div>
    </div>
  );
};
