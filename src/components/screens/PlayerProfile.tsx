import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Trophy, Compass, Gamepad2, Award, ShoppingBag, Settings, HelpCircle, LogOut, Terminal } from 'lucide-react';
import { PlayerProfile as IPlayerProfile, StoredReceipt } from '../../types/game';
import { getAssetUrl, AVATAR_FALLBACK_SVG } from '../../utils/assetUtils';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ProgressBar } from '../common/ProgressBar';
import { gameApi } from '../../services/api/gameApi';

interface PlayerProfileProps {
  profile: IPlayerProfile;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  profile,
  onBack,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [receipts, setReceipts] = useState<StoredReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<StoredReceipt | null>(null);

  const handleOpenReceipts = async () => {
    const list = await gameApi.getReceipts();
    setReceipts(list);
    setShowReceiptsModal(true);
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
          <span>PROFILE</span>
        </button>
        <CurrencyDisplay coins={profile.coins} gems={profile.gems} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main User Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={getAssetUrl(profile.avatar)}
                alt={profile.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AVATAR_FALLBACK_SVG;
                }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '18px',
                  border: '2px solid #38bdf8',
                  objectFit: 'cover',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  background: '#10b981',
                  borderRadius: '50%',
                  padding: '2px',
                  display: 'flex',
                }}
              >
                <CheckCircle2 size={16} color="#ffffff" />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc' }}>
                  {profile.username}
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                  }}
                >
                  Verified
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Level <strong style={{ color: '#38bdf8' }}>{profile.level}</strong>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <ProgressBar
            progress={(profile.xp / profile.xpToNextLevel) * 100}
            color="cyan"
            height={8}
            label="Level Progression"
            subLabel={`${profile.xp} / ${profile.xpToNextLevel} XP`}
          />
        </div>

        {/* Currency Vault Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(250, 204, 21, 0.25)',
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Total Coins</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#facc15' }}>
              {profile.coins.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Total Gems</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#c084fc' }}>
              {profile.gems.toLocaleString()}
            </span>
          </div>
        </div>

        {/* STATS Grid */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Stats
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Highest Score */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '6px' }}>
                <Trophy size={16} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Highest Score</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {profile.stats.highestScore.toLocaleString()}
              </div>
            </div>

            {/* Total Distance */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '6px' }}>
                <Compass size={16} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Distance</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {(profile.stats.totalDistance / 1000).toFixed(1)} km
              </div>
            </div>

            {/* Games Played */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', marginBottom: '6px' }}>
                <Gamepad2 size={16} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Games Played</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {profile.stats.gamesPlayed}
              </div>
            </div>

            {/* Achievements */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '6px' }}>
                <Award size={16} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Achievements</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {profile.stats.achievementsCompleted} / 50
              </div>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
          {[
            {
              icon: <ShoppingBag size={18} color="#38bdf8" />,
              label: 'Purchase History & Receipts',
              onClick: handleOpenReceipts,
            },
            {
              icon: <Terminal size={18} color="#facc15" />,
              label: 'Admin: 1M Level Inspector & Ledger',
              onClick: onOpenAdmin,
            },
            {
              icon: <Settings size={18} color="#94a3b8" />,
              label: 'Settings',
              onClick: onOpenSettings,
            },
            {
              icon: <HelpCircle size={18} color="#94a3b8" />,
              label: 'Help & Support',
              onClick: () => alert('For support contact: support@nexusrun.games'),
            },
            {
              icon: <LogOut size={18} color="#f87171" />,
              label: 'Logout',
              onClick: () => alert('Logged out successfully.'),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.icon}
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{item.label}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '18px' }}>&rsaquo;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Receipts Modal */}
      {showReceiptsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '80vh',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                Purchase Receipts ({receipts.length})
              </h3>
              <button
                onClick={() => setShowReceiptsModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {receipts.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
                  No purchases completed yet. Make a purchase in the shop to generate verified email invoices!
                </div>
              ) : (
                receipts.map((rc) => (
                  <div
                    key={rc.id}
                    onClick={() => setSelectedReceipt(rc)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
                      <span style={{ color: '#f8fafc' }}>{rc.productName}</span>
                      <span style={{ color: '#facc15' }}>₹{rc.amount}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      Order: {rc.orderId} &bull; {new Date(rc.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedReceipt && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(7, 11, 20, 0.9)',
                  border: '1px solid #38bdf8',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  fontSize: '11px',
                  color: '#cbd5e1',
                  fontFamily: 'monospace',
                }}
              >
                <div><strong>TO:</strong> {selectedReceipt.toEmail}</div>
                <div><strong>TX_ID:</strong> {selectedReceipt.transactionId}</div>
                <div><strong>STATUS:</strong> Verified & Sent</div>
                <div style={{ marginTop: '8px', color: '#34d399' }}>Verified server-side payment confirmation receipt.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
