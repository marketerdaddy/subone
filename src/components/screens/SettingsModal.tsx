import React from 'react';
import { ArrowLeft, Volume2, Monitor, Eye, Globe } from 'lucide-react';
import { GameSettings, PlayerProfile } from '../../types/game';
import { soundEngine } from '../../services/audio/soundEngine';
import { storageService } from '../../services/storage/storageService';

interface SettingsModalProps {
  profile: PlayerProfile;
  onBack: () => void;
  onSettingsChanged: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ profile, onBack, onSettingsChanged }) => {
  const settings = profile.settings;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    const updatedProfile = { ...profile, settings: updated };

    if (key === 'musicVolume') soundEngine.setMusicVolume(value as number);
    if (key === 'sfxVolume') soundEngine.setSfxVolume(value as number);
    if (key === 'isMuted') soundEngine.setMuted(value as boolean);

    storageService.saveProfile(updatedProfile);
    onSettingsChanged(updated);
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
        overflow: 'hidden',
      }}
      className="safe-top safe-bottom"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
          Settings
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* AUDIO SECTION */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#38bdf8' }}>
            <Volume2 size={18} />
            <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>Audio</span>
          </div>

          {/* Music */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
              <span>Music</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* SFX */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
              <span>SFX</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Mute Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Mute All Audio</span>
            <button
              onClick={() => updateSetting('isMuted', !settings.isMuted)}
              style={{
                width: 44,
                height: 24,
                borderRadius: '9999px',
                background: settings.isMuted ? '#ef4444' : 'rgba(51, 65, 85, 0.8)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: 3,
                  left: settings.isMuted ? 23 : 3,
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>
        </div>

        {/* GRAPHICS QUALITY */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#facc15' }}>
            <Monitor size={18} />
            <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>Graphics</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
              <button
                key={q}
                onClick={() => updateSetting('graphicsQuality', q)}
                style={{
                  padding: '10px 0',
                  borderRadius: '12px',
                  background: settings.graphicsQuality === q ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                  border: settings.graphicsQuality === q ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: settings.graphicsQuality === q ? '#38bdf8' : '#94a3b8',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
            <Eye size={18} />
            <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>Accessibility</span>
          </div>

          {/* High Contrast */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>High Contrast Mode</span>
            <input
              type="checkbox"
              checked={settings.highContrastMode}
              onChange={(e) => updateSetting('highContrastMode', e.target.checked)}
              style={{ width: 20, height: 20, accentColor: '#38bdf8' }}
            />
          </div>

          {/* Reduced Motion */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Reduced Motion</span>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              style={{ width: 20, height: 20, accentColor: '#38bdf8' }}
            />
          </div>

          {/* Haptic Feedback */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Haptic Feedback</span>
            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
              style={{ width: 20, height: 20, accentColor: '#38bdf8' }}
            />
          </div>
        </div>

        {/* LANGUAGE */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
            <Globe size={18} color="#94a3b8" />
            <span style={{ fontSize: '14px' }}>Language</span>
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
            <option value="Japanese">日本語</option>
            <option value="Hindi">हिन्दी</option>
          </select>
        </div>
      </div>
    </div>
  );
};
