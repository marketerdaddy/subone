import React, { useState } from 'react';
import { ArrowLeft, Gauge, ArrowUpCircle, Shield, Magnet } from 'lucide-react';
import { Character, PlayerProfile } from '../../types/game';
import { CHARACTERS } from '../../config/gameConfig';
import { getAssetUrl, AVATAR_FALLBACK_SVG } from '../../utils/assetUtils';
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
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${currentChar.skins[0]?.colorScheme?.glow || '#38bdf8'}33 0%, transparent 70%)`,
            filter: 'blur(35px)',
            pointerEvents: 'none',
          }}
        />

        {/* Cinematic AAA 3D Character Portrait on Glowing Pedestal */}
        <div
          style={{
            width: '220px',
            height: '280px',
            borderRadius: '24px',
            background: 'radial-gradient(circle at 50% 90%, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.8) 70%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.2)',
            marginBottom: '14px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={getAssetUrl(currentChar.fullImageUrl || 'images/char_zayn.jpg')}
            alt={currentChar.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: 'scale(1.05)',
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
            }}
          />
        </div>

        {/* Character Title & Ability */}
        <div style={{ textAlign: 'center', maxWidth: '340px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
              {currentChar.name}
            </h2>
            {getRarityBadge(currentChar.rarity)}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.3 }}>
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
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gauge size={15} color="#38bdf8" />
            <div style={{ width: '55px', fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>Speed</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.speed} color="cyan" height={5} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.speed}
            </span>
          </div>

          {/* Jump */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpCircle size={15} color="#facc15" />
            <div style={{ width: '55px', fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>Jump</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.jump} color="gold" height={5} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.jump}
            </span>
          </div>

          {/* Shield */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={15} color="#34d399" />
            <div style={{ width: '55px', fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>Shield</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.shield} color="green" height={5} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.shield}
            </span>
          </div>

          {/* Magnet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Magnet size={15} color="#c084fc" />
            <div style={{ width: '55px', fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>Magnet</div>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={currentChar.stats.magnet} color="purple" height={5} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', width: '25px', textAlign: 'right' }}>
              {currentChar.stats.magnet}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '12px', width: '100%', maxWidth: '360px', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <GameButton
              fullWidth
              size="md"
              variant={isEquipped ? 'outline' : isUnlocked ? 'gold' : 'cyan'}
              disabled={isEquipped}
              onClick={handleSelectOrUnlock}
            >
              {isEquipped ? 'EQUIPPED' : isUnlocked ? 'SELECT' : currentChar.priceCoins ? `UNLOCK (${currentChar.priceCoins.toLocaleString()} 🪙)` : `UNLOCK (${currentChar.priceGems} 💎)`}
            </GameButton>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Character Thumbnails */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '14px 20px',
          background: 'rgba(15, 23, 42, 0.95)',
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
                minWidth: '70px',
                height: '76px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.12)',
                background: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(30, 41, 59, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isCharUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <img
                src={getAssetUrl(char.avatarUrl || 'images/char_zayn.jpg')}
                alt={char.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: isSelected ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                {char.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
