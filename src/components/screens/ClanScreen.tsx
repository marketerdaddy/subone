import React, { useState } from 'react';
import { ArrowLeft, Shield, Swords, Users, Award, Trophy, ChevronRight, Lock, Skull, CheckCircle2 } from 'lucide-react';
import { GameButton } from '../common/GameButton';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import confetti from 'canvas-confetti';

interface ClanScreenProps {
  coins: number;
  gems: number;
  onBack: () => void;
  onAttackBoss: (bossId: string) => void;
}

export const ClanScreen: React.FC<ClanScreenProps> = ({
  coins,
  gems,
  onBack,
  onAttackBoss,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'leagues' | 'bosses'>('bosses');

  const clanBosses = [
    {
      id: 'boss-1',
      name: 'Clumsy Tony',
      title: 'Floor 5/5 Demolisher',
      status: 'Defeated',
      reward: '350 Coins, 25 Medals',
      healthPercent: 0,
      avatar: '🤖',
      isUnlocked: true,
      isDefeated: true,
    },
    {
      id: 'boss-2',
      name: 'One-Eye Banzai',
      title: 'Floor 5/5 Cyber Bandit',
      status: 'Defeated',
      reward: '500 Coins, 35 Medals',
      healthPercent: 0,
      avatar: '👁️',
      isUnlocked: true,
      isDefeated: true,
    },
    {
      id: 'boss-3',
      name: 'Jinx The Cursed',
      title: 'Torment 5/5 Apex Specter',
      status: 'Active Raid',
      reward: '1,200 Coins, 80 Medals',
      healthPercent: 42,
      avatar: '💀',
      isUnlocked: true,
      isDefeated: false,
    },
    {
      id: 'boss-4',
      name: 'Hyperion Titan',
      title: 'Contracts to Unlock: 32/40',
      status: 'Locked',
      reward: '2,500 Coins, 150 Medals',
      healthPercent: 100,
      avatar: '⚡',
      isUnlocked: false,
      isDefeated: false,
    },
    {
      id: 'boss-5',
      name: 'Nexus Void Core',
      title: 'Ultimate Mega Boss',
      status: 'Locked',
      reward: '10,000 Coins, 500 Gems',
      healthPercent: 100,
      avatar: '🌌',
      isUnlocked: false,
      isDefeated: false,
    },
  ];

  const leagues = [
    { rank: 'Alpha', color: '#ec4899', trophyReward: '1,000 Trophy Medals', bg: 'rgba(236, 72, 153, 0.15)' },
    { rank: 'Platinum', color: '#38bdf8', trophyReward: '600 Trophy Medals', bg: 'rgba(56, 189, 248, 0.15)' },
    { rank: 'Gold', color: '#facc15', trophyReward: '300 Trophy Medals (Current)', bg: 'rgba(250, 204, 21, 0.15)' },
    { rank: 'Silver', color: '#94a3b8', trophyReward: '150 Trophy Medals', bg: 'rgba(148, 163, 184, 0.15)' },
    { rank: 'Bronze', color: '#f97316', trophyReward: '50 Trophy Medals', bg: 'rgba(249, 115, 22, 0.15)' },
  ];

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
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
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
            CLAN: CYBER SYNDICATE
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, letterSpacing: '2px' }}>
            RANK #5 IN GOLD LEAGUE
          </div>
        </div>

        <CurrencyDisplay coins={coins} gems={gems} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px 20px',
          background: 'rgba(15, 23, 42, 0.5)',
        }}
      >
        <button
          onClick={() => setActiveTab('bosses')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: activeTab === 'bosses' ? '1px solid #ec4899' : '1px solid transparent',
            background: activeTab === 'bosses' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            color: activeTab === 'bosses' ? '#ec4899' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Skull size={16} />
          BOSS RAIDS
        </button>

        <button
          onClick={() => setActiveTab('leagues')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: activeTab === 'leagues' ? '1px solid #facc15' : '1px solid transparent',
            background: activeTab === 'leagues' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            color: activeTab === 'leagues' ? '#facc15' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Trophy size={16} />
          CLAN LEAGUES
        </button>

        <button
          onClick={() => setActiveTab('base')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: activeTab === 'base' ? '1px solid #38bdf8' : '1px solid transparent',
            background: activeTab === 'base' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            color: activeTab === 'base' ? '#38bdf8' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Users size={16} />
          MEMBERS (24/25)
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'bosses' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '20px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '32px' }}>⚔️</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc' }}>
                  WEEKLY BOSS RAIDS
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Work with your clan to deal damage during your runs and unlock legendary chest rewards!
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clanBosses.map((boss) => (
                <div
                  key={boss.id}
                  style={{
                    background: boss.status === 'Active Raid' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.5)',
                    border:
                      boss.status === 'Active Raid'
                        ? '1px solid #ec4899'
                        : boss.isDefeated
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {boss.avatar}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc' }}>
                          {boss.name}
                        </span>
                        {boss.isDefeated && (
                          <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 800 }}>
                            DEFEATED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{boss.title}</div>
                      <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 700, marginTop: '2px' }}>
                        Reward: {boss.reward}
                      </div>

                      {boss.status === 'Active Raid' && (
                        <div style={{ marginTop: '8px', width: '160px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ec4899', fontWeight: 800, marginBottom: '2px' }}>
                            <span>HP REMAINING</span>
                            <span>{boss.healthPercent}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${boss.healthPercent}%`, height: '100%', background: '#ec4899' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {boss.status === 'Active Raid' ? (
                      <GameButton
                        variant="danger"
                        size="sm"
                        onClick={() => onAttackBoss(boss.id)}
                        icon={<Swords size={16} />}
                      >
                        RAID
                      </GameButton>
                    ) : boss.isDefeated ? (
                      <CheckCircle2 size={24} color="#22c55e" />
                    ) : (
                      <Lock size={20} color="#64748b" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leagues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leagues.map((lg) => (
              <div
                key={lg.rank}
                style={{
                  background: lg.bg,
                  border: `1px solid ${lg.color}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Shield size={32} color={lg.color} />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: lg.color }}>
                      {lg.rank.toUpperCase()} LEAGUE
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Weekend Reward: <span style={{ color: '#f8fafc', fontWeight: 700 }}>{lg.trophyReward}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'base' && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
            <Users size={48} color="#38bdf8" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              Cyber Syndicate Clan Hall
            </div>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Level 14 Clan • 24 Active Members • 450 Weekly Contribution Points
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
