import React, { useState } from 'react';
import { ArrowLeft, RotateCw, ZoomIn, Check } from 'lucide-react';
import { Character } from '../../types/game';
import { getAssetUrl, AVATAR_FALLBACK_SVG } from '../../utils/assetUtils';
import { GameButton } from '../common/GameButton';

interface CharacterCustomizationProps {
  character: Character;
  onBack: () => void;
  onSaveCustomization: (characterId: string, skinId: string) => void;
}

export const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  character,
  onBack,
  onSaveCustomization,
}) => {
  const [activeSlot, setActiveSlot] = useState<'HEAD' | 'OUTFIT' | 'SHOES' | 'GLOVES' | 'ACCESSORIES' | 'TRAIL' | 'EFFECTS'>('OUTFIT');
  const [selectedSkinId, setSelectedSkinId] = useState<string>(character.activeSkinId);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [animPreview, setAnimPreview] = useState<'IDLE' | 'RUN' | 'JUMP' | 'ABILITY'>('IDLE');

  const slots = ['HEAD', 'OUTFIT', 'SHOES', 'GLOVES', 'ACCESSORIES', 'TRAIL', 'EFFECTS'] as const;

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  const handleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: '#090d1a',
        overflowY: 'auto',
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
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc' }}>
            CUSTOMIZATION LAB
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, letterSpacing: '2px' }}>
            {character.name.toUpperCase()} // GEAR & VISUAL FX
          </div>
        </div>

        <GameButton
          variant="gold"
          size="sm"
          onClick={() => onSaveCustomization(character.id, selectedSkinId)}
          icon={<Check size={16} />}
        >
          EQUIP
        </GameButton>
      </div>

      {/* Main Studio Viewport */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px',
          minHeight: '360px',
          background: 'radial-gradient(circle at 50% 60%, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
        }}
      >
        {/* Character Image Preview */}
        <div
          style={{
            position: 'relative',
            width: '260px',
            height: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
          }}
        >
          <img
            src={getAssetUrl(character.fullImageUrl || character.avatarUrl || 'images/char_zayn.jpg')}
            alt={character.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: animPreview === 'ABILITY' ? 'drop-shadow(0 0 25px #ec4899)' : 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))',
            }}
          />
        </div>

        {/* Viewport Control Badges */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <button
            onClick={handleRotate}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              cursor: 'pointer',
            }}
            title="Rotate Model"
          >
            <RotateCw size={18} />
          </button>

          <button
            onClick={handleZoom}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15',
              cursor: 'pointer',
            }}
            title="Toggle Zoom"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Animation Preview Selector */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {(['IDLE', 'RUN', 'JUMP', 'ABILITY'] as const).map((anim) => (
            <button
              key={anim}
              onClick={() => setAnimPreview(anim)}
              style={{
                background: animPreview === anim ? '#38bdf8' : 'rgba(15, 23, 42, 0.8)',
                color: animPreview === anim ? '#0f172a' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {anim}
            </button>
          ))}
        </div>
      </div>

      {/* Customization Category Slots */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            scrollbarWidth: 'none',
          }}
        >
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: activeSlot === slot ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeSlot === slot ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                color: activeSlot === slot ? '#38bdf8' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Skin Variants Palette */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '8px 0' }}>
          {character.skins.map((skin) => {
            const isSelected = selectedSkinId === skin.id;
            return (
              <div
                key={skin.id}
                onClick={() => setSelectedSkinId(skin.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '12px',
                  minWidth: '130px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${skin.colorScheme.primary}, ${skin.colorScheme.accent})`,
                    boxShadow: `0 0 12px ${skin.colorScheme.glow}`,
                  }}
                />
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textAlign: 'center' }}>
                  {skin.name}
                </div>
                <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                  {skin.unlocked ? 'UNLOCKED' : `${skin.priceCoins || 5000} Coins`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
