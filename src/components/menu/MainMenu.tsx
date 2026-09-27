import React, { useState } from 'react';
import { Settings, Gift, Trophy, Crown, Play, Home, ListTodo, Users, ShoppingBag, User, Infinity as InfinityIcon } from 'lucide-react';
import { PlayerProfile } from '../../types/game';
import { CHARACTERS, generateLevelInfo } from '../../config/gameConfig';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { GameButton } from '../common/GameButton';

interface MainMenuProps {
  profile: PlayerProfile;
  onPlay: (levelNumber: number, isEndless: boolean) => void;
  onOpenCharacters: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenDailyRewards: () => void;
  onOpenSettings: () => void;
  onOpenEvents?: () => void;
  onOpenClans?: () => void;
  onOpenCustomization?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onPlay,
  onOpenCharacters,
  onOpenShop,
  onOpenMissions,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenDailyRewards,
  onOpenSettings,
  onOpenEvents,
  onOpenClans,
  onOpenCustomization,
}) => {
  const [activeNav, setActiveNav] = useState<'home' | 'missions' | 'characters' | 'shop' | 'profile'>('home');
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);

  const selectedChar = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
  const levelInfo = generateLevelInfo(profile.level);

  const handleNavClick = (nav: typeof activeNav) => {
    setActiveNav(nav);
    if (nav === 'missions') onOpenMissions();
    else if (nav === 'characters') onOpenCharacters();
    else if (nav === 'shop') onOpenShop();
    else if (nav === 'profile') onOpenProfile();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(10, 13, 30, 0.4) 0%, rgba(5, 7, 15, 0.85) 75%, #05070f 100%), url("/images/main_menu_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
      className="safe-top safe-bottom"
    >
      {/* 1. TOP HEADER BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <img
            src={selectedChar.avatarUrl || profile.avatar}
            alt={profile.username}
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              border: '2px solid #38bdf8',
              objectFit: 'cover',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
            }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              {profile.username}
            </div>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
              Lv. {profile.level} • {selectedChar.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CurrencyDisplay coins={profile.coins} gems={profile.gems} onAddCoins={onOpenShop} onAddGems={onOpenShop} />
          <button
            onClick={onOpenSettings}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 2. CENTER HERO AREA */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px',
          position: 'relative',
        }}
      >
        {/* Left Floating Action Badges: Events & Clans */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: '20%',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            zIndex: 10,
          }}
        >
          {onOpenEvents && (
            <button
              onClick={onOpenEvents}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                borderRadius: '16px',
                padding: '10px',
                color: '#ec4899',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                Events
              </span>
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ec4899',
                  boxShadow: '0 0 6px #ec4899',
                }}
              />
            </button>
          )}

          {onOpenClans && (
            <button
              onClick={onOpenClans}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '16px',
                padding: '10px',
                color: '#38bdf8',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)',
              }}
            >
              <span style={{ fontSize: '20px' }}>🛡️</span>
              <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                Clans
              </span>
            </button>
          )}
        </div>

        {/* Right Floating Action Badges: Daily, Badges, Ranks */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            top: '20%',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            zIndex: 10,
          }}
        >
          <button
            onClick={onOpenDailyRewards}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              borderRadius: '16px',
              padding: '10px',
              color: '#facc15',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Gift size={24} />
            <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
              Daily
            </span>
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 6px #ef4444',
              }}
            />
          </button>

          <button
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '10px',
              color: '#38bdf8',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Trophy size={24} />
            <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
              Badges
            </span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              borderRadius: '16px',
              padding: '10px',
              color: '#c084fc',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Crown size={24} />
            <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
              Ranks
            </span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 6vw, 36px)',
              fontWeight: 900,
              letterSpacing: '1px',
              color: '#ffffff',
              textShadow: '0 0 25px rgba(56, 189, 248, 0.6)',
            }}
          >
            YOUR NEXT RUN AWAITS
          </h1>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            Reach higher. Go further. Be legendary.
          </p>
        </div>

        {/* Center Character Showcase on Pedestal */}
        <div
          onClick={onOpenCharacters}
          style={{
            width: '210px',
            height: '250px',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.25)',
            position: 'relative',
            cursor: 'pointer',
            marginBottom: '16px',
            overflow: 'hidden',
          }}
        >
          <img
            src={selectedChar.avatarUrl || '/images/char_zayn.jpg'}
            alt={selectedChar.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: 'scale(1.08)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '45px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(7, 11, 20, 0.95) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {selectedChar.name} • Tap to Inspect
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => setIsEndlessMode(false)}
            style={{
              background: !isEndlessMode ? 'rgba(56, 189, 248, 0.25)' : 'none',
              border: !isEndlessMode ? '1px solid #38bdf8' : 'none',
              borderRadius: '9999px',
              padding: '4px 12px',
              color: !isEndlessMode ? '#38bdf8' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Level {profile.level}: {levelInfo.biome.replace('_', ' ')}
          </button>
          <button
            onClick={() => setIsEndlessMode(true)}
            style={{
              background: isEndlessMode ? 'rgba(250, 204, 21, 0.25)' : 'none',
              border: isEndlessMode ? '1px solid #facc15' : 'none',
              borderRadius: '9999px',
              padding: '4px 12px',
              color: isEndlessMode ? '#facc15' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <InfinityIcon size={14} />
            <span>Endless Run</span>
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '320px' }}>
          <GameButton
            fullWidth
            size="xl"
            variant="gold"
            onClick={() => onPlay(profile.level, isEndlessMode)}
            icon={<Play size={24} fill="#422006" />}
            style={{
              height: '62px',
              fontSize: '22px',
              boxShadow: '0 6px 30px rgba(245, 158, 11, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.6)',
            }}
          >
            PLAY
          </GameButton>
        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 10px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {[
          { id: 'home', label: 'Home', icon: <Home size={20} /> },
          { id: 'missions', label: 'Missions', icon: <ListTodo size={20} /> },
          { id: 'characters', label: 'Characters', icon: <Users size={20} /> },
          { id: 'shop', label: 'Shop', icon: <ShoppingBag size={20} /> },
          { id: 'profile', label: 'Profile', icon: <User size={20} /> },
        ].map((tab) => {
          const isActive = activeNav === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavClick(tab.id as typeof activeNav)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#facc15' : '#94a3b8',
                cursor: 'pointer',
                padding: '4px 12px',
                transition: 'color 0.2s ease',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '11px', fontWeight: isActive ? 800 : 600 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
