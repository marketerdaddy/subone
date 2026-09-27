import React, { useState } from 'react';
import { ArrowLeft, Gauge, ArrowUpCircle, Shield, Magnet } from 'lucide-react';
import { Character, PlayerProfile } from '../../types/game';
import { CHARACTERS } from '../../config/gameConfig';
import { GameButton } from '../common/GameButton';
import { ProgressBar } from '../common/ProgressBar';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { storageService } from '../../services/storage/storageService';

interface CharacterSelectionProps {
  profile: PlayerProfile;
  onBack: () => void;
  onSelectCharacter: (char: Character) => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  profile,
  onBack,
  onSelectCharacter,
  onProfileUpdated,
}) => {
  const [selectedId, setSelectedId] = useState<string>(profile.selectedCharacterId || CHARACTERS[0].id);
  const currentChar = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];
  const isUnlocked = profile.unlockedCharacters.includes(currentChar.id);
  const isEquipped = profile.selectedCharacterId === currentChar.id;

  const handleSelectOrUnlock = () => {
    if (isUnlocked) {
      const updated = { ...profile, selectedCharacterId: currentChar.id };
      storageService.saveProfile(updated);
      onProfileUpdated(updated);
      onSelectCharacter(currentChar);
    } else {
      if (currentChar.priceCoins && profile.coins >= currentChar.priceCoins) {
        const updated = storageService.updateCoinsAndGems(-currentChar.priceCoins, 0);
        updated.unlockedCharacters.push(currentChar.id);
        updated.selectedCharacterId = currentChar.id;
        storageService.saveProfile(updated);
        onProfileUpdated(updated);
        onSelectCharacter(currentChar);
      } else if (currentChar.priceGems && profile.gems >= currentChar.priceGems) {
        const updated = storageService.updateCoinsAndGems(0, -currentChar.priceGems);
        updated.unlockedCharacters.push(currentChar.id);
        updated.selectedCharacterId = currentChar.id;
        storageService.saveProfile(updated);
        onProfileUpdated(updated);
        onSelectCharacter(currentChar);
      }
    }
  };

  const getRarityBadge = (rarity: Character['rarity']) => {
    const colors: Record<string, { bg: string; text: string }> = {
      common: { bg: '#334155', text: '#cbd5e1' },
      rare: { bg: '#0369a1', text: '#38bdf8' },
      epic: { bg: '#7e22ce', text: '#d8b4fe' },
      legendary: { bg: '#b45309', text: '#fde047' },
      mythic: { bg: '#be185d', text: '#fbcfe8' },
    };
    const c = colors[rarity] || colors.epic;
    return (
      <span
        style={{
          background: c.bg,
          color: c.text,
          fontSize: '11px',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        {rarity}
      </span>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
      className="safe-top safe-bottom"
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          <span>CHARACTERS</span>
        </button>
        <CurrencyDisplay coins={profile.coins} gems={profile.gems} />
      </div>

      {/* Main Character Showcase */}
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
        {/* Glow backdrop aura */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${currentChar.skins[0]?.colorScheme?.glow || '#38bdf8'}33 0%, transparent 70%)`,
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        {/* Stylized Character Preview Frame */}
        <div
          style={{
            width: '180px',
            height: '220px',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              width: 120,
              height: 24,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, #38bdf8 0%, transparent 70%)',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              width: 90,
              height: 150,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Head */}
            <div
              style={{
                width: 36,
                height: 42,
                borderRadius: '10px',
                background: '#fbcfe8',
                border: `3px solid ${currentChar.skins[0]?.colorScheme?.secondary || '#0f172a'}`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 4,
                  right: 4,
                  height: 10,
                  borderRadius: '4px',
                  background: currentChar.skins[0]?.colorScheme?.glow || '#38bdf8',
                  boxShadow: '0 0 8px currentColor',
                }}
              />
            </div>
            {/* Torso */}
            <div
              style={{
                width: 54,
                height: 60,
                marginTop: 4,
                borderRadius: '12px',
                background: currentChar.skins[0]?.colorScheme?.primary || '#e11d48',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: `0 0 16px ${currentChar.skins[0]?.colorScheme?.glow || '#38bdf8'}44`,
              }}
            />
            {/* Legs */}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <div style={{ width: 20, height: 42, borderRadius: '6px', background: currentChar.skins[0]?.colorScheme?.secondary || '#1e293b' }} />
              <div style={{ width: 20, height: 42, borderRadius: '6px', background: currentChar.skins[0]?.colorScheme?.secondary || '#1e293b' }} />
            </div>
          </div>
        </div>

        {/* Character Title & Ability */}
        <div style={{ textAlign: 'center', maxWidth: '340px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
              {currentChar.name}
            </h2>
            {getRarityBadge(currentChar.rarity)}
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.3 }}>
            {currentChar.description}
          </p>
        </div>

        {/* Stats Grid Matching Reference UI */}
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gauge size={16} color="#38bdf8" />
            <div style={{ width: '55px', fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>Speed</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.speed} color="cyan" height={6} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.speed}
            </span>
          </div>

          {/* Jump */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpCircle size={16} color="#facc15" />
            <div style={{ width: '55px', fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>Jump</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.jump} color="gold" height={6} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.jump}
            </span>
          </div>

          {/* Shield */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={16} color="#34d399" />
            <div style={{ width: '55px', fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>Shield</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.shield} color="green" height={6} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.shield}
            </span>
          </div>

          {/* Magnet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Magnet size={16} color="#c084fc" />
            <div style={{ width: '55px', fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>Magnet</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.magnet} color="purple" height={6} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.magnet}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '14px', width: '100%', maxWidth: '360px' }}>
          <GameButton
            fullWidth
            size="lg"
            variant={isEquipped ? 'outline' : isUnlocked ? 'gold' : 'cyan'}
            disabled={isEquipped}
            onClick={handleSelectOrUnlock}
          >
            {isEquipped ? 'Equipped' : isUnlocked ? 'Select' : currentChar.priceCoins ? `Unlock (${currentChar.priceCoins.toLocaleString()} Coins)` : `Unlock (${currentChar.priceGems} Gems)`}
          </GameButton>
        </div>
      </div>

      {/* Bottom Horizontal Character Thumbnails */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {CHARACTERS.map((char) => {
          const isSelected = selectedId === char.id;
          const isCharUnlocked = profile.unlockedCharacters.includes(char.id);

          return (
            <div
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              style={{
                minWidth: '68px',
                height: '68px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(30, 41, 59, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isCharUnlocked ? 1 : 0.6,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: char.skins[0]?.colorScheme?.primary || '#e11d48',
                  boxShadow: `0 0 10px ${char.skins[0]?.colorScheme?.glow || '#38bdf8'}`,
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                {char.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
