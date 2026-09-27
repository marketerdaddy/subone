import React, { useState } from 'react';
import { ShieldCheck, Magnet, Shield, Rocket, Coins, Gem, ArrowLeft } from 'lucide-react';
import { PlayerProfile, ShopItem } from '../../types/game';
import { SHOP_ITEMS } from '../../config/gameConfig';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { GameButton } from '../common/GameButton';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';

interface ShopScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ profile, onBack, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'characters' | 'skins' | 'powerups' | 'coins' | 'gems'>('all');
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState<ShopItem | null>(null);

  const filteredItems = activeTab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === activeTab);
  const featuredItem = SHOP_ITEMS.find((i) => i.featured);

  const getItemIcon = (imageIcon: string) => {
    switch (imageIcon) {
      case 'magnet': return <Magnet size={24} color="#38bdf8" />;
      case 'shield': return <Shield size={24} color="#34d399" />;
      case 'rocket': return <Rocket size={24} color="#c084fc" />;
      case 'coins': return <Coins size={24} color="#facc15" />;
      case 'gem': return <Gem size={24} color="#e879f9" />;
      default: return <ShieldCheck size={24} color="#f472b6" />;
    }
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
          <span>Shop</span>
        </button>
        <CurrencyDisplay coins={profile.coins} gems={profile.gems} />
      </div>

      {/* Categories Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {[
          { id: 'all', label: 'All' },
          { id: 'characters', label: 'Characters' },
          { id: 'skins', label: 'Skins' },
          { id: 'powerups', label: 'Power-ups' },
          { id: 'coins', label: 'Coins' },
          { id: 'gems', label: 'Gems' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Featured Card (Shadow Runner) */}
        {featuredItem && activeTab === 'all' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
              Featured
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(76, 29, 149, 0.6))',
                border: '1px solid rgba(192, 132, 252, 0.35)',
                borderRadius: '20px',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 32px rgba(126, 34, 206, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    background: 'radial-gradient(circle, #7e22ce, #3b0764)',
                    border: '1px solid #c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(192, 132, 252, 0.5)',
                  }}
                >
                  <ShieldCheck size={36} color="#f472b6" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                      {featuredItem.title}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#d946ef', color: '#ffffff' }}>
                      Legendary
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
                    {featuredItem.description}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#facc15' }}>
                  ₹{featuredItem.priceAmount}
                </span>
                <GameButton size="sm" onClick={() => setSelectedPurchaseItem(featuredItem)}>
                  Buy
                </GameButton>
              </div>
            </div>
          </div>
        )}

        {/* Regular Items List */}
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
          {activeTab === 'all' ? 'Power-ups & Packs' : activeTab.toUpperCase()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '30px' }}>
          {filteredItems.map((item) => {
            const isUnlocked = item.rewardPayload.characterId ? profile.unlockedCharacters.includes(item.rewardPayload.characterId) : false;
            const priceLabel = item.priceCurrency === 'INR' ? `₹${item.priceAmount}` : item.priceCurrency === 'COINS' ? `${item.priceAmount.toLocaleString()} Coins` : `${item.priceAmount.toLocaleString()} Gems`;

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getItemIcon(item.imageIcon)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.description}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: item.priceCurrency === 'INR' ? '#facc15' : item.priceCurrency === 'GEMS' ? '#c084fc' : '#38bdf8' }}>
                    {priceLabel}
                  </span>
                  <GameButton
                    size="sm"
                    disabled={isUnlocked}
                    variant={isUnlocked ? 'outline' : 'gold'}
                    onClick={() => setSelectedPurchaseItem(item)}
                  >
                    {isUnlocked ? 'Owned' : 'Buy'}
                  </GameButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedPurchaseItem && (
        <PurchaseConfirmationModal
          item={selectedPurchaseItem}
          profile={profile}
          onClose={() => setSelectedPurchaseItem(null)}
          onSuccess={(updated) => {
            setSelectedPurchaseItem(null);
            onProfileUpdated(updated);
          }}
        />
      )}
    </div>
  );
};
