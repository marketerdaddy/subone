import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'cyan' | 'gold' | 'purple' | 'green';
  height?: number;
  label?: string;
  subLabel?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'cyan',
  height = 8,
  label,
  subLabel,
  showPercentage = false,
}) => {
  const clamped = Math.max(0, Math.min(100, progress));

  const gradients = {
    cyan: 'linear-gradient(90deg, #0284c7, #38bdf8)',
    gold: 'linear-gradient(90deg, #d97706, #facc15)',
    purple: 'linear-gradient(90deg, #7e22ce, #c084fc)',
    green: 'linear-gradient(90deg, #059669, #34d399)',
  };

  const glows = {
    cyan: '0 0 10px rgba(56, 189, 248, 0.5)',
    gold: '0 0 10px rgba(250, 204, 21, 0.5)',
    purple: '0 0 10px rgba(192, 132, 252, 0.5)',
    green: '0 0 10px rgba(52, 211, 153, 0.5)',
  };

  return (
    <div style={{ width: '100%' }}>
      {(label || subLabel || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
          {label && <span style={{ color: '#94a3b8', fontWeight: 600 }}>{label}</span>}
          {subLabel && <span style={{ color: '#cbd5e1', fontWeight: 700 }}>{subLabel}</span>}
          {showPercentage && <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: `${height}px`,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: gradients[color],
            boxShadow: glows[color],
            borderRadius: `${height}px`,
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>
    </div>
  );
};
