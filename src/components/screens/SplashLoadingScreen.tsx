import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface SplashLoadingScreenProps {
  onLoaded: () => void;
}

export const SplashLoadingScreen: React.FC<SplashLoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    'Swipe down while in mid-air to fast fall and slide under obstacles!',
    'Grab the Coin Magnet to pull all nearby coins effortlessly.',
    'Over 1,000,000 procedurally generated levels await your challenge!',
    'Energy Shields can absorb one hit and grant invulnerability.',
    'Chain coin streaks to build up to an 8x score combo multiplier!',
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2500);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          clearInterval(tipInterval);
          setTimeout(onLoaded, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 14) + 6;
      });
    }, 180);

    return () => {
      clearInterval(timer);
      clearInterval(tipInterval);
    };
  }, [onLoaded, tips.length]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 24px',
        backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(10, 13, 30, 0.45) 0%, rgba(5, 7, 15, 0.85) 75%, #03050a 100%), url("/images/splash_hero.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className="safe-top safe-bottom"
    >
      {/* Top Cyber Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#38bdf8',
          fontWeight: 800,
          textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
        UNREAL ENGINE 5 POWERED • AAA MOBILE
      </div>

      {/* Main Logo Showcase */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div
            style={{
              position: 'absolute',
              inset: -15,
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 12vw, 68px)',
                fontWeight: 900,
                letterSpacing: '4px',
                background: 'linear-gradient(180deg, #ffffff 0%, #bae6fd 40%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(56, 189, 248, 0.6)',
                fontStyle: 'italic',
              }}
            >
              NEXUS
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #facc15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(250, 204, 21, 0.7)',
                transform: 'rotate(-8deg)',
              }}
            >
              <Zap size={26} color="#422006" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 12vw, 68px)',
                fontWeight: 900,
                letterSpacing: '4px',
                background: 'linear-gradient(180deg, #facc15 0%, #eab308 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(250, 204, 21, 0.6)',
                fontStyle: 'italic',
              }}
            >
              RUN
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Advanced Endless Mobile Runner
        </div>
      </div>

      {/* Loading Progress & Tip */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px', fontWeight: 600 }}>
          Loading your adventure... {Math.min(100, progress)}%
        </div>

        {/* Progress Bar with Cyan/Gold Glow */}
        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 0 16px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, progress)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0284c7, #38bdf8, #facc15)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)',
              borderRadius: '9999px',
              transition: 'width 0.2s ease-out',
            }}
          />
        </div>

        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
            minHeight: '36px',
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>TIP: </span>
          {tips[tipIndex]}
        </div>
      </div>
    </div>
  );
};
