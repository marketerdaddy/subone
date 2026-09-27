import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { ShopItem, PlayerProfile } from '../../types/game';
import { GameButton } from '../common/GameButton';
import { gameApi } from '../../services/api/gameApi';
import { storageService } from '../../services/storage/storageService';
import confetti from 'canvas-confetti';

interface PurchaseConfirmationModalProps {
  item: ShopItem;
  profile: PlayerProfile;
  onClose: () => void;
  onSuccess: (updatedProfile: PlayerProfile) => void;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  item,
  profile,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'Google Pay' | 'Apple Pay' | 'Credit Card'>('Google Pay');
  const [customerEmail, setCustomerEmail] = useState('ansh@nexusrun.games');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionInfo, setTransactionInfo] = useState<{ orderId: string; txId: string } | null>(null);

  const priceLabel = item.priceCurrency === 'INR' ? `₹${item.priceAmount}` : item.priceCurrency === 'COINS' ? `${item.priceAmount.toLocaleString()} Coins` : `${item.priceAmount.toLocaleString()} Gems`;

  const handleConfirmPurchase = async () => {
    setStatus('PROCESSING');
    setErrorMessage('');

    try {
      if (item.priceCurrency === 'COINS' || item.priceCurrency === 'GEMS') {
        const canAfford = item.priceCurrency === 'COINS' ? profile.coins >= item.priceAmount : profile.gems >= item.priceAmount;
        if (!canAfford) {
          setStatus('ERROR');
          setErrorMessage(`Insufficient ${item.priceCurrency.toLowerCase()} balance!`);
          return;
        }

        const coinDelta = item.priceCurrency === 'COINS' ? -item.priceAmount : 0;
        const gemDelta = item.priceCurrency === 'GEMS' ? -item.priceAmount : 0;
        let updated = storageService.updateCoinsAndGems(coinDelta, gemDelta);

        if (item.rewardPayload.characterId && !updated.unlockedCharacters.includes(item.rewardPayload.characterId)) {
          updated.unlockedCharacters.push(item.rewardPayload.characterId);
          storageService.saveProfile(updated);
        }

        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setStatus('SUCCESS');
        setTimeout(() => onSuccess(updated), 1200);
        return;
      }

      const initResult = await gameApi.initiatePurchase(item.id, item.title, item.priceAmount, item.priceCurrency);
      if (!initResult.success || !initResult.intent) {
        throw new Error(initResult.error || 'Failed to initialize payment gateway.');
      }

      const orderId = initResult.intent.orderId;
      const idempotencyKey = 'IDEM_' + orderId;

      const verifyResult = await gameApi.verifyPurchase(
        orderId,
        'tok_valid_sandbox_signature',
        idempotencyKey,
        item.rewardPayload,
        customerEmail
      );

      if (!verifyResult.success || !verifyResult.verified) {
        throw new Error(verifyResult.error || 'Payment gateway declined verification.');
      }

      let updatedProfile = profile;
      if (verifyResult.updatedProfile) {
        updatedProfile = verifyResult.updatedProfile;
        storageService.saveProfile(updatedProfile);
      } else {
        if (item.rewardPayload.coins) updatedProfile = storageService.updateCoinsAndGems(item.rewardPayload.coins, 0);
        if (item.rewardPayload.gems) updatedProfile = storageService.updateCoinsAndGems(0, item.rewardPayload.gems);
        if (item.rewardPayload.characterId && !updatedProfile.unlockedCharacters.includes(item.rewardPayload.characterId)) {
          updatedProfile.unlockedCharacters.push(item.rewardPayload.characterId);
          storageService.saveProfile(updatedProfile);
        }
      }

      setTransactionInfo({ orderId, txId: verifyResult.transactionId });
      setStatus('SUCCESS');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        onSuccess(updatedProfile);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setStatus('ERROR');
      setErrorMessage(msg);
    }
  };

  return (
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
          maxWidth: '440px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>
            Confirm Purchase
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {status === 'SUCCESS' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={56} color="#34d399" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>
              Purchase Verified!
            </h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px' }}>
              {item.title} has been added to your vault.
            </p>
            {transactionInfo && (
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  textAlign: 'left',
                }}
              >
                <div><strong>Order:</strong> {transactionInfo.orderId}</div>
                <div><strong>TX:</strong> {transactionInfo.txId}</div>
                <div style={{ color: '#38bdf8', marginTop: '4px' }}>
                  Confirmation email dispatched to {customerEmail}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Product Card Showcase */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #312e81, #4c1d95)',
                  border: '1px solid #c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(192, 132, 252, 0.35)',
                }}
              >
                <ShieldCheck size={32} color="#f472b6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.description}</div>
              </div>
            </div>

            {/* Price Details */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Price</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#facc15' }}>
                {priceLabel}
              </span>
            </div>

            {/* Payment Method Selector */}
            {item.priceCurrency === 'INR' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {(['Google Pay', 'Apple Pay', 'Credit Card'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '12px',
                        background: paymentMethod === method ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                        border: paymentMethod === method ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: paymentMethod === method ? '#38bdf8' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    Receipt Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Prompt text */}
            <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '14px', color: '#cbd5e1' }}>
              You will be charged <strong style={{ color: '#facc15' }}>{priceLabel}</strong>.<br />
              Are you sure you want to proceed?
            </div>

            {/* Error banner */}
            {status === 'ERROR' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <GameButton variant="outline" fullWidth onClick={onClose} disabled={status === 'PROCESSING'}>
                Cancel
              </GameButton>
              <GameButton
                variant="gold"
                fullWidth
                onClick={handleConfirmPurchase}
                disabled={status === 'PROCESSING'}
              >
                {status === 'PROCESSING' ? 'Verifying...' : 'Confirm'}
              </GameButton>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '14px' }}>
              A purchase confirmation email will be sent to your registered email address.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
