import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '../../types/game';
import { gameApi } from '../../services/api/gameApi';

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ profile, onBack }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'weekly' | 'monthly'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    gameApi.getLeaderboard(activeTab).then((data) => {
      if (isMounted) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown size={18} color="#facc15" />;
    if (rank === 2) return <Crown size={18} color="#94a3b8" />;
    if (rank === 3) return <Crown size={18} color="#d97706" />;
    return <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b' }}>{rank}</span>;
  };

  const playerEntry = entries.find((e) => e.isPlayer) || {
    rank: 87,
    id: profile.id,
    username: profile.username,
    avatar: profile.avatar,
    score: profile.stats.highestScore,
    level: profile.level,
    isPlayer: true,
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
          Leaderboard
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {(['global', 'friends', 'weekly', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '12px',
              border: activeTab === tab ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === tab ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === tab ? '#38bdf8' : '#94a3b8',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Loading rankings...</div>
        ) : (
          entries
            .filter((e) => !e.isPlayer)
            .map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                    {getRankBadge(entry.rank)}
                  </div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    style={{ width: 38, height: 38, borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                      {entry.username}
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                      Level {entry.level}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: '#facc15' }}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))
        )}
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          borderTop: '2px solid #38bdf8',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#38bdf8', width: '24px', textAlign: 'center' }}>
            {playerEntry.rank}
          </span>
          <img
            src={playerEntry.avatar}
            alt={playerEntry.username}
            style={{ width: 40, height: 40, borderRadius: '12px', border: '2px solid #38bdf8', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
              You ({playerEntry.username})
            </div>
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>
              Level {playerEntry.level}
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 900, color: '#facc15' }}>
          {playerEntry.score.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
