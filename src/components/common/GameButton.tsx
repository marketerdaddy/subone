import React from 'react';
import { soundEngine } from '../../services/audio/soundEngine';

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'cyan' | 'purple' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GameButton: React.FC<GameButtonProps> = ({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const handleClick = () => {
    if (disabled) return;
    soundEngine.playButtonClick();
    if (onClick) onClick();
  };

  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '13px', borderRadius: '10px' },
    md: { padding: '10px 20px', fontSize: '15px', borderRadius: '12px' },
    lg: { padding: '14px 28px', fontSize: '17px', borderRadius: '14px' },
    xl: { padding: '16px 36px', fontSize: '20px', borderRadius: '16px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    gold: {
      background: 'linear-gradient(180deg, #fde047 0%, #eab308 30%, #ca8a04 100%)',
      color: '#422006',
      border: '1px solid #fef08a',
      boxShadow: '0 4px 18px rgba(234, 179, 8, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.6)',
      fontWeight: 800,
    },
    cyan: {
      background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
      color: '#ffffff',
      border: '1px solid #7dd3fc',
      boxShadow: '0 4px 18px rgba(2, 132, 199, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      fontWeight: 700,
    },
    purple: {
      background: 'linear-gradient(180deg, #c084fc 0%, #7e22ce 100%)',
      color: '#ffffff',
      border: '1px solid #e9d5ff',
      boxShadow: '0 4px 18px rgba(126, 34, 206, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      fontWeight: 700,
    },
    outline: {
      background: 'rgba(30, 41, 59, 0.6)',
      color: '#94a3b8',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: 'none',
      fontWeight: 600,
    },
    danger: {
      background: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)',
      color: '#ffffff',
      border: '1px solid #fca5a5',
      boxShadow: '0 4px 18px rgba(220, 38, 38, 0.4)',
      fontWeight: 700,
    },
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        transition: 'transform 0.1s ease, filter 0.2s ease',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {icon}
      {children}
    </button>
  );
};
