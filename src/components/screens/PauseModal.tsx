import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { GameButton } from '../common/GameButton';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(3, 7, 18, 0.85)',
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
          maxWidth: '360px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
          GAME PAUSED
        </h2>

        <GameButton fullWidth size="lg" variant="gold" onClick={onResume} icon={<Play size={20} fill="#422006" />}>
          Resume
        </GameButton>

        <GameButton fullWidth size="md" variant="cyan" onClick={onRestart} icon={<RotateCcw size={18} />}>
          Restart Run
        </GameButton>

        <GameButton fullWidth size="md" variant="outline" onClick={onOpenSettings} icon={<Settings size={18} />}>
          Settings
        </GameButton>

        <GameButton fullWidth size="md" variant="danger" onClick={onHome} icon={<Home size={18} />}>
          Quit to Menu
        </GameButton>
      </div>
    </div>
  );
};
