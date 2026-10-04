import React, { useState } from 'react';
import {
  Settings,
  Gift,
  Trophy,
  Crown,
  Play,
  Home,
  ListTodo,
  Users,
  ShoppingBag,
  User,
  Zap,
  Shield,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { PlayerProfile } from '../../types/game';
import { CHARACTERS, generateLevelInfo } from '../../config/gameConfig';
import { getAssetUrl, AVATAR_FALLBACK_SVG } from '../../utils/assetUtils';
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

  // Rarity color mapping
  const rarityColor: Record<string, string> = {
    legendary: '#f59e0b',
    epic: '#a855f7',
    rare: '#38bdf8',
    uncommon: '#34d399',
    common: '#94a3b8',
  };
  const charAccent = rarityColor[selectedChar.rarity] || '#38bdf8';

  return (
    <div
      id="main-menu-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        // Transparent overlay — 3D canvas shows through completely
        background:
          'linear-gradient(to bottom, rgba(4,6,15,0.92) 0%, rgba(4,6,15,0.08) 15%, rgba(4,6,15,0.05) 70%, rgba(4,6,15,0.92) 85%, rgba(4,6,15,0.98) 100%)',
        overflow: 'hidden',
      }}
      className="safe-top safe-bottom menu-root"
    >
      {/* ====================================================
          1. TOP HEADER — Sleek minimal glass bar
      ===================================================== */}
      <div
        id="menu-top-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: 'rgba(4, 6, 18, 0.85)',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
          flexShrink: 0,
        }}
      >
        {/* Left: Player Avatar + Level + Name */}
        <button
          id="menu-profile-btn"
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {/* Avatar with level ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={getAssetUrl(selectedChar.avatarUrl || profile.avatar)}
              alt={profile.username}
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                border: `2px solid ${charAccent}`,
                objectFit: 'cover',
                display: 'block',
                boxShadow: `0 0 10px ${charAccent}55`,
              }}
            />
            {/* Level badge */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: `linear-gradient(135deg, ${charAccent}, ${charAccent}aa)`,
                borderRadius: '5px',
                padding: '1px 5px',
                fontSize: '9px',
                fontWeight: 900,
                color: '#050811',
                lineHeight: '1',
                letterSpacing: '0.3px',
                boxShadow: `0 2px 6px ${charAccent}66`,
              }}
            >
              {profile.level}
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#f1f5f9',
                lineHeight: '1.2',
                letterSpacing: '0.2px',
              }}
            >
              {profile.username}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: charAccent,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              {selectedChar.title || selectedChar.name}
            </div>
          </div>
        </button>

        {/* Right: Currencies + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CurrencyDisplay coins={profile.coins} gems={profile.gems} onAddCoins={onOpenShop} onAddGems={onOpenShop} />
          <button
            id="menu-settings-btn"
            onClick={onOpenSettings}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ====================================================
          2. CENTER HERO — Transparent pass-through zone
          Left/Right floating icon pills only
      ===================================================== */}
      <div
        id="menu-center-hero"
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pointerEvents: 'none', // let 3D canvas receive events in center
        }}
      >
        {/* LEFT FLOATING PILLS */}
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '18%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 10,
            pointerEvents: 'all',
          }}
        >
          {onOpenEvents && (
            <button
              id="menu-events-btn"
              onClick={onOpenEvents}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(8, 12, 28, 0.82)',
                WebkitBackdropFilter: 'blur(12px)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: '14px',
                padding: '10px 8px',
                color: '#ec4899',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(236,72,153,0.18)',
                minWidth: 52,
              }}
            >
              <Zap size={20} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.4px' }}>
                EVENTS
              </span>
              {/* Pulse dot */}
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ec4899',
                  boxShadow: '0 0 6px #ec4899',
                }}
              />
            </button>
          )}

          {onOpenClans && (
            <button
              id="menu-clans-btn"
              onClick={onOpenClans}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(8, 12, 28, 0.82)',
                WebkitBackdropFilter: 'blur(12px)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '14px',
                padding: '10px 8px',
                color: '#38bdf8',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                minWidth: 52,
              }}
            >
              <Shield size={20} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.4px' }}>
                CLANS
              </span>
            </button>
          )}
        </div>

        {/* RIGHT FLOATING PILLS */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '18%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 10,
            pointerEvents: 'all',
          }}
        >
          <button
            id="menu-daily-btn"
            onClick={onOpenDailyRewards}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(8, 12, 28, 0.82)',
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
              borderRadius: '14px',
              padding: '10px 8px',
              color: '#facc15',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              minWidth: 52,
            }}
          >
            <Gift size={20} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.4px' }}>
              DAILY
            </span>
            <div
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 6px #ef4444',
              }}
            />
          </button>

          <button
            id="menu-badges-btn"
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(8, 12, 28, 0.82)',
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              borderRadius: '14px',
              padding: '10px 8px',
              color: '#38bdf8',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              minWidth: 52,
            }}
          >
            <Trophy size={20} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.4px' }}>
              BADGES
            </span>
          </button>

          <button
            id="menu-ranks-btn"
            onClick={onOpenLeaderboard}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(8, 12, 28, 0.82)',
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(192, 132, 252, 0.28)',
              borderRadius: '14px',
              padding: '10px 8px',
              color: '#c084fc',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              minWidth: 52,
            }}
          >
            <Crown size={20} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.4px' }}>
              RANKS
            </span>
          </button>
        </div>

        {/* CENTER BOTTOM — Holographic character name badge + thin separator */}
        <div
          id="menu-character-badge"
          onClick={onOpenCharacters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(4, 8, 20, 0.80)',
            WebkitBackdropFilter: 'blur(14px)',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${charAccent}55`,
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 14px ${charAccent}22`,
            marginBottom: '14px',
            pointerEvents: 'all',
            transition: 'border-color 0.25s ease',
          }}
        >
          {/* Rarity pulse dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: charAccent,
              boxShadow: `0 0 8px ${charAccent}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 900,
              color: '#f1f5f9',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
            }}
          >
            {selectedChar.name}
          </span>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: charAccent,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            · {selectedChar.rarity}
          </span>
        </div>
      </div>

      {/* ====================================================
          3. CTA PANEL — Anchored above bottom nav
          Mode switcher pill + PLAY CTA button
      ===================================================== */}
      <div
        id="menu-cta-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px 14px',
          background: 'linear-gradient(to top, rgba(4,6,15,0.98) 0%, rgba(4,6,15,0.82) 70%, transparent 100%)',
          flexShrink: 0,
        }}
      >
        {/* Mode Switcher: Level select vs Endless */}
        <div
          id="menu-mode-switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(8, 14, 32, 0.90)',
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          <button
            id="menu-mode-level-btn"
            onClick={() => setIsEndlessMode(false)}
            style={{
              background: !isEndlessMode
                ? 'linear-gradient(135deg, rgba(56,189,248,0.22), rgba(14,165,233,0.16))'
                : 'transparent',
              border: !isEndlessMode ? '1px solid rgba(56,189,248,0.55)' : '1px solid transparent',
              borderRadius: '9999px',
              padding: '5px 14px',
              color: !isEndlessMode ? '#38bdf8' : '#64748b',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            LV.{profile.level} · {levelInfo.biome.replace(/_/g, ' ')}
          </button>

          <button
            id="menu-mode-endless-btn"
            onClick={() => setIsEndlessMode(true)}
            style={{
              background: isEndlessMode
                ? 'linear-gradient(135deg, rgba(250,204,21,0.22), rgba(234,179,8,0.16))'
                : 'transparent',
              border: isEndlessMode ? '1px solid rgba(250,204,21,0.55)' : '1px solid transparent',
              borderRadius: '9999px',
              padding: '5px 14px',
              color: isEndlessMode ? '#facc15' : '#64748b',
              fontSize: '10px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <InfinityIcon size={12} />
            ENDLESS
          </button>
        </div>

        {/* PLAY Button — Premium gold with spring glow */}
        <div style={{ width: '100%', maxWidth: 340 }}>
          <GameButton
            fullWidth
            size="xl"
            variant="gold"
            onClick={() => onPlay(profile.level, isEndlessMode)}
            icon={<Play size={22} fill="#422006" />}
            style={{
              height: '60px',
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '2px',
              boxShadow:
                '0 6px 32px rgba(245,158,11,0.55), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.55)',
            }}
          >
            PLAY
          </GameButton>
        </div>
      </div>

      {/* ====================================================
          4. BOTTOM NAV BAR — Compact high-contrast tabs
      ===================================================== */}
      <div
        id="menu-bottom-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 8px',
          background: 'rgba(4, 6, 15, 0.98)',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(56, 189, 248, 0.10)',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'home' as const, label: 'Home', icon: <Home size={20} /> },
          { id: 'missions' as const, label: 'Missions', icon: <ListTodo size={20} /> },
          { id: 'characters' as const, label: 'Runner', icon: <Users size={20} /> },
          { id: 'shop' as const, label: 'Shop', icon: <ShoppingBag size={20} /> },
          { id: 'profile' as const, label: 'Profile', icon: <User size={20} /> },
        ].map((tab) => {
          const isActive = activeNav === tab.id;
          return (
            <button
              key={tab.id}
              id={`menu-nav-${tab.id}-btn`}
              onClick={() => handleNavClick(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: isActive ? '#facc15' : '#475569',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '10px',
                transition: 'color 0.18s ease',
                position: 'relative',
              }}
            >
              {/* Active indicator line */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 2,
                    borderRadius: '1px',
                    background: '#facc15',
                    boxShadow: '0 0 8px #facc15',
                  }}
                />
              )}
              {tab.icon}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: isActive ? '0.5px' : '0',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
