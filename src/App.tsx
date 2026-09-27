import React, { useState, useEffect, useRef } from 'react';
import { GameState, PlayerProfile, ActivePowerup, Character, GameSettings } from './types/game';
import { storageService } from './services/storage/storageService';
import { gameApi } from './services/api/gameApi';
import { GameEngine } from './game/engine/GameEngine';
import { CHARACTERS } from './config/gameConfig';
import { SplashLoadingScreen } from './components/screens/SplashLoadingScreen';
import { MainMenu } from './components/menu/MainMenu';
import { GameplayHUD } from './components/hud/GameplayHUD';
import { ShopScreen } from './components/screens/ShopScreen';
import { CharacterSelection } from './components/screens/CharacterSelection';
import { PlayerProfile as PlayerProfileScreen } from './components/screens/PlayerProfile';
import { MissionsScreen } from './components/screens/MissionsScreen';
import { DailyRewardsModal } from './components/screens/DailyRewardsModal';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { SettingsModal } from './components/screens/SettingsModal';
import { GameOverModal } from './components/screens/GameOverModal';
import { PauseModal } from './components/screens/PauseModal';
import { LevelIntroScreen } from './components/screens/LevelIntroScreen';
import { VictoryScreen } from './components/screens/VictoryScreen';
import { EventsScreen } from './components/screens/EventsScreen';
import { ClanScreen } from './components/screens/ClanScreen';
import { CharacterCustomization } from './components/screens/CharacterCustomization';
import { PurchaseEmailModal } from './components/screens/PurchaseEmailModal';
import { AdminDashboardModal } from './components/screens/AdminDashboardModal';
import { generateLevelInfo } from './config/gameConfig';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [profile, setProfile] = useState<PlayerProfile>(storageService.loadProfile());
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showEmailReceipt, setShowEmailReceipt] = useState<boolean>(false);
  const [emailReceiptData, setEmailReceiptData] = useState<{
    orderId: string;
    productName: string;
    amount: string;
    date: string;
  }>({
    orderId: 'NR20260927-4587',
    productName: 'Shadow Runner (Legendary Character)',
    amount: '₹299',
    date: 'Sep 27, 2026, 04:32 PM',
  });
  const [targetLevel, setTargetLevel] = useState<number>(profile.level);

  // Gameplay state
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(1);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [activePowerups, setActivePowerups] = useState<ActivePowerup[]>([]);
  const [lastRunData, setLastRunData] = useState<{
    score: number;
    distance: number;
    coins: number;
    obstaclesAvoided: number;
  }>({ score: 0, distance: 0, coins: 0, obstaclesAvoided: 0 });
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Initial cloud sync
  useEffect(() => {
    gameApi.getProfile().then((serverProfile) => {
      if (serverProfile) {
        setProfile(serverProfile);
        storageService.saveProfile(serverProfile);
      }
    });
  }, []);

  // Initialize 3D GameEngine once container is mounted
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    if (!gameEngineRef.current) {
      const engine = new GameEngine(canvasContainerRef.current, {
        onScoreUpdate: (score, distance, coins, combo, multiplier) => {
          setCurrentScore(score);
          setCurrentDistance(distance);
          setRunCoins(coins);
          setCurrentCombo(combo);
          setCurrentMultiplier(multiplier);
        },
        onPowerupUpdate: (powerups) => {
          setActivePowerups(powerups);
        },
        onGameOver: (runData) => {
          const isHigh = runData.score > profile.stats.highestScore;
          setIsNewHighScore(isHigh);
          setLastRunData(runData);

          const updated = storageService.recordRun(
            runData.score,
            runData.distance,
            runData.coins,
            runData.obstaclesAvoided,
            Math.floor(runData.distance * 0.4)
          );
          setProfile(updated);
          gameApi.submitScore(runData.score, runData.distance, runData.coins);
          gameApi.syncProfile(updated);

          setGameState('GAME_OVER');
        },
        onLevelComplete: (levelNumber, runData) => {
          const isHigh = runData.score > profile.stats.highestScore;
          setIsNewHighScore(isHigh);
          setLastRunData({ ...runData, obstaclesAvoided: 15 });

          let updated = storageService.recordRun(
            runData.score,
            runData.distance,
            runData.coins,
            15,
            Math.floor(runData.distance * 0.8)
          );
          // Advance level!
          if (updated.level === levelNumber) {
            updated.level += 1;
            storageService.saveProfile(updated);
          }
          setProfile(updated);
          gameApi.submitScore(runData.score, runData.distance, runData.coins);
          gameApi.syncProfile(updated);

          setGameState('VICTORY');
        },
      });

      engine.applyQualitySettings(profile.settings.graphicsQuality);
      const activeChar = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
      engine.setCharacter(activeChar);

      gameEngineRef.current = engine;
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [profile.selectedCharacterId, profile.settings.graphicsQuality, profile.stats.highestScore]);

  // Start game run
  const handleStartRun = (levelNumber: number = 1, isEndless: boolean = false) => {
    setCurrentScore(0);
    setCurrentDistance(0);
    setRunCoins(0);
    setCurrentCombo(1);
    setActivePowerups([]);
    setGameState('PLAYING');

    if (gameEngineRef.current) {
      const char = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
      gameEngineRef.current.setCharacter(char);
      gameEngineRef.current.startRun(levelNumber, isEndless);
    }
  };

  const handlePause = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
    setGameState('PAUSED');
  };

  const handleResume = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
    }
    setGameState('PLAYING');
  };

  const handleRevive = () => {
    // Deduct 5 gems
    const updated = storageService.updateCoinsAndGems(0, -5);
    setProfile(updated);
    if (gameEngineRef.current) {
      gameEngineRef.current.revive();
    }
    setGameState('PLAYING');
  };

  const handleDoubleCoins = () => {
    const bonus = lastRunData.coins;
    const updated = storageService.updateCoinsAndGems(bonus, 0);
    setProfile(updated);
  };

  const handleSelectCharacter = (character: Character) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setCharacter(character);
    }
  };

  const handleSettingsChanged = (newSettings: GameSettings) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.applyQualitySettings(newSettings.graphicsQuality);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%',
          cursor: gameState === 'PLAYING' ? 'grab' : 'default',
        }}
      />

      {/* 1. Loading Splash Screen */}
      {gameState === 'LOADING' && (
        <SplashLoadingScreen onLoaded={() => setGameState('MAIN_MENU')} />
      )}

      {/* 2. Main Menu */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          profile={profile}
          onPlay={(levelNum, isEndless) => {
            setTargetLevel(levelNum);
            setGameState('LEVEL_INTRO');
          }}
          onOpenCharacters={() => setGameState('CHARACTERS')}
          onOpenShop={() => setGameState('SHOP')}
          onOpenMissions={() => setGameState('MISSIONS')}
          onOpenProfile={() => setGameState('PROFILE')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenDailyRewards={() => setGameState('DAILY_REWARD')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenEvents={() => setGameState('EVENTS')}
          onOpenClans={() => setGameState('CLANS')}
          onOpenCustomization={() => setGameState('CUSTOMIZATION')}
        />
      )}

      {/* 3. Cinematic Level Introduction */}
      {gameState === 'LEVEL_INTRO' && (
        <LevelIntroScreen
          levelInfo={generateLevelInfo(targetLevel)}
          onStartRun={() => handleStartRun(targetLevel)}
          onBack={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* 4. Gameplay Screen HUD */}
      {gameState === 'PLAYING' && (
        <GameplayHUD
          score={currentScore}
          distance={currentDistance}
          runCoins={runCoins}
          combo={currentCombo}
          multiplier={currentMultiplier}
          activePowerups={activePowerups}
          profile={profile}
          onPause={handlePause}
        />
      )}

      {/* 5. Pause Screen Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={() => handleStartRun(profile.level)}
          onHome={() => {
            if (gameEngineRef.current) gameEngineRef.current.stop();
            setGameState('MAIN_MENU');
          }}
          onOpenSettings={() => setGameState('SETTINGS')}
        />
      )}

      {/* 6. Victory Screen Modal */}
      {gameState === 'VICTORY' && (
        <VictoryScreen
          score={lastRunData.score}
          distance={lastRunData.distance}
          coins={lastRunData.coins}
          combo={currentCombo}
          xpGained={Math.floor(lastRunData.distance * 0.8)}
          level={profile.level}
          isNewRecord={isNewHighScore}
          onContinue={() => {
            setTargetLevel(profile.level);
            setGameState('LEVEL_INTRO');
          }}
          onReplay={() => handleStartRun(profile.level)}
          onHome={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* 7. Game Over Screen Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          runData={lastRunData}
          profile={profile}
          isNewHighScore={isNewHighScore}
          onRevive={handleRevive}
          onRetry={() => handleStartRun(profile.level)}
          onHome={() => setGameState('MAIN_MENU')}
          onDoubleCoins={handleDoubleCoins}
        />
      )}

      {/* 8. Characters Screen */}
      {gameState === 'CHARACTERS' && (
        <CharacterSelection
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
          onSelectCharacter={handleSelectCharacter}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* 9. Character Customization */}
      {gameState === 'CUSTOMIZATION' && (
        <CharacterCustomization
          character={CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0]}
          onBack={() => setGameState('MAIN_MENU')}
          onSaveCustomization={(charId, skinId) => {
            const char = CHARACTERS.find((c) => c.id === charId);
            if (char) {
              char.activeSkinId = skinId;
              handleSelectCharacter(char);
            }
            setGameState('MAIN_MENU');
          }}
        />
      )}

      {/* 10. Limited-Time Events */}
      {gameState === 'EVENTS' && (
        <EventsScreen
          coins={profile.coins}
          gems={profile.gems}
          onBack={() => setGameState('MAIN_MENU')}
          onPlayEventRun={(lvl) => handleStartRun(lvl)}
          onClaimReward={(reward) => {
            const updated = storageService.updateCoinsAndGems(reward.coins || 0, reward.gems || 0);
            setProfile(updated);
          }}
        />
      )}

      {/* 11. Clan Screen & Boss Raids */}
      {gameState === 'CLANS' && (
        <ClanScreen
          coins={profile.coins}
          gems={profile.gems}
          onBack={() => setGameState('MAIN_MENU')}
          onAttackBoss={(_bossId) => handleStartRun(profile.level)}
        />
      )}

      {/* 12. Shop Screen */}
      {gameState === 'SHOP' && (
        <ShopScreen
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* 13. Player Profile Screen */}
      {gameState === 'PROFILE' && (
        <PlayerProfileScreen
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}

      {/* 14. Missions Screen */}
      {gameState === 'MISSIONS' && (
        <MissionsScreen
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* 15. Leaderboard Screen */}
      {gameState === 'LEADERBOARD' && (
        <LeaderboardScreen
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* 16. Daily Rewards Modal */}
      {gameState === 'DAILY_REWARD' && (
        <DailyRewardsModal
          profile={profile}
          onClose={() => setGameState('MAIN_MENU')}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* 17. Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          profile={profile}
          onBack={() => setGameState('MAIN_MENU')}
          onSettingsChanged={handleSettingsChanged}
        />
      )}

      {/* 18. Purchase Confirmation Email Preview Modal */}
      {showEmailReceipt && (
        <PurchaseEmailModal
          orderId={emailReceiptData.orderId}
          productName={emailReceiptData.productName}
          amount={emailReceiptData.amount}
          date={emailReceiptData.date}
          playerName={profile.username}
          onClose={() => setShowEmailReceipt(false)}
        />
      )}

      {/* 19. Admin Dashboard Modal */}
      {showAdmin && (
        <AdminDashboardModal
          profile={profile}
          onClose={() => setShowAdmin(false)}
          onProfileUpdated={(updated) => setProfile(updated)}
          onStartLevel={(lvl) => {
            setShowAdmin(false);
            handleStartRun(lvl);
          }}
        />
      )}
    </div>
  );
};

export default App;
