import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface PurchaseEmailModalProps {
  orderId: string;
  productName: string;
  amount: string;
  date: string;
  playerName: string;
  onClose: () => void;
}

export const PurchaseEmailModal: React.FC<PurchaseEmailModalProps> = ({
  orderId,
  productName,
  amount,
  date,
  playerName,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          color: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Email Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090d1a 0%, #1e1b4b 100%)',
            padding: '24px 20px',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 900,
              fontStyle: 'italic',
              background: 'linear-gradient(180deg, #ffffff 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
            }}
          >
            NEXUS RUN
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
            Official Purchase Confirmation
          </div>
        </div>

        {/* Email Body */}
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Your Purchase Was Successful!
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Order #{orderId}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
            Hello <strong>{playerName}</strong>,<br />
            Thank you for your purchase! Your order has been securely verified and your in-game items have been immediately delivered to your account.
          </p>

          {/* Order Details Table */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
              ORDER DETAILS
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Product</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{productName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Quantity</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>1</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Payment Method</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Google Pay / Card</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Purchase Date</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{date}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
              <span style={{ color: '#64748b' }}>Transaction Status</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>VERIFIED COMPLETED</span>
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>TOTAL CHARGED</span>
              <span style={{ fontWeight: 900, color: '#0284c7' }}>{amount}</span>
            </div>
          </div>

          {/* Support Information */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '20px' }}>
            If you have any questions, please contact our 24/7 support team at <br />
            <a href="mailto:support@nexusrun.game" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>
              support@nexusrun.game
            </a>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
