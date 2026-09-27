import React from 'react';
import { Coins, Gem } from 'lucide-react';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  onAddCoins?: () => void;
  onAddGems?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  coins,
  gems,
  onAddCoins,
  onAddGems,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Coins Badge */}
      <div
        onClick={onAddCoins}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          borderRadius: '9999px',
          padding: isSm ? '3px 8px' : '4px 10px',
          cursor: onAddCoins ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            width: isSm ? 16 : 20,
            height: isSm ? 16 : 20,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #facc15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(250, 204, 21, 0.5)',
          }}
        >
          <Coins size={isSm ? 10 : 12} color="#78350f" />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isSm ? '13px' : '15px',
            fontWeight: 700,
            color: '#fef08a',
            letterSpacing: '0.5px',
          }}
        >
          {coins.toLocaleString()}
        </span>
        {onAddCoins && (
          <span style={{ color: '#facc15', fontSize: '14px', fontWeight: 800, marginLeft: 2 }}>+</span>
        )}
      </div>

      {/* Gems Badge */}
      <div
        onClick={onAddGems}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(192, 132, 252, 0.3)',
          borderRadius: '9999px',
          padding: isSm ? '3px 8px' : '4px 10px',
          cursor: onAddGems ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            width: isSm ? 16 : 20,
            height: isSm ? 16 : 20,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(192, 132, 252, 0.5)',
          }}
        >
          <Gem size={isSm ? 10 : 12} color="#3b0764" />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isSm ? '13px' : '15px',
            fontWeight: 700,
            color: '#e9d5ff',
            letterSpacing: '0.5px',
          }}
        >
          {gems.toLocaleString()}
        </span>
        {onAddGems && (
          <span style={{ color: '#c084fc', fontSize: '14px', fontWeight: 800, marginLeft: 2 }}>+</span>
        )}
      </div>
    </div>
  );
};
