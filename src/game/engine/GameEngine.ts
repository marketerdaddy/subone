import * as THREE from 'three';
import { GAME_CONSTANTS, BIOMES, generateLevelInfo, CHARACTERS, POWERUPS } from '../../config/gameConfig';
import { Character, PowerupType, ActivePowerup, GameSettings } from '../../types/game';
import { PlayerModel } from '../player/PlayerModel';
import { ObstaclePool } from '../obstacles/ObstaclePool';
import { CollectiblePool } from '../collectibles/CollectiblePool';
import { LevelGenerator } from '../levels/LevelGenerator';
import { InputController, InputAction } from '../controls/InputController';
import { soundEngine } from '../../services/audio/soundEngine';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, distance: number, coins: number, combo: number, multiplier: number) => void;
  onPowerupUpdate: (activePowerups: ActivePowerup[]) => void;
  onGameOver: (runData: { score: number; distance: number; coins: number; obstaclesAvoided: number }) => void;
  onLevelComplete: (levelNumber: number, runData: { score: number; distance: number; coins: number }) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private clock!: THREE.Clock;
  private animationFrameId: number | null = null;

  // Subsystems
  private playerModel!: PlayerModel;
  private obstaclePool!: ObstaclePool;
  private collectiblePool!: CollectiblePool;
  private levelGenerator!: LevelGenerator;
  private inputController!: InputController;

  // Player Kinematics
  private currentLane: number = 0; // -1, 0, 1
  private targetX: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private currentGroundY: number = 0;

  // Gameplay Run State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentLevel: number = 1;
  private isEndless: boolean = false;
  private currentSpeed: number = GAME_CONSTANTS.BASE_SPEED;
  private distanceRun: number = 0;
  private coinsCollected: number = 0;
  private obstaclesAvoided: number = 0;
  private baseMultiplier: number = 1;
  private currentScore: number = 0;
  private comboStreak: number = 0;
  private comboTimer: number = 0;

  // Selected Character & Active Buffs
  private selectedCharacter: Character = CHARACTERS[0];
  private activePowerups: Map<PowerupType, { remainingTime: number; duration: number }> = new Map();
  private invulnerabilityTimer: number = 0; // Flash after hit

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.initScene();
    this.initEntities();
    this.initInput();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d1e);
    this.scene.fog = new THREE.FogExp2(0x0c1024, 0.015);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200);
    this.camera.position.set(0, 4.5, 7.5);
    this.camera.lookAt(0, 1.5, -6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Dynamic Lighting
    this.ambientLight = new THREE.AmbientLight(0x818cf8, 0.85);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    this.sunLight.position.set(10, 20, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    this.clock = new THREE.Clock();

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private initEntities() {
    this.obstaclePool = new ObstaclePool();
    this.scene.add(this.obstaclePool.group);

    this.collectiblePool = new CollectiblePool();
    this.scene.add(this.collectiblePool.group);

    this.levelGenerator = new LevelGenerator(this.obstaclePool, this.collectiblePool);
    this.scene.add(this.levelGenerator.group);

    this.playerModel = new PlayerModel();
    this.playerModel.applySkin(this.selectedCharacter);
    this.scene.add(this.playerModel.group);
  }

  private initInput() {
    this.inputController = new InputController((action: InputAction) => {
      if (!this.isRunning || this.isPaused) return;

      if (action === 'LEFT') {
        if (this.currentLane > -1) {
          this.currentLane--;
          this.targetX = GAME_CONSTANTS.LANES[this.currentLane + 1];
          soundEngine.playSlide();
        }
      } else if (action === 'RIGHT') {
        if (this.currentLane < 1) {
          this.currentLane++;
          this.targetX = GAME_CONSTANTS.LANES[this.currentLane + 1];
          soundEngine.playSlide();
        }
      } else if (action === 'JUMP') {
        if (this.isGrounded && !this.isSliding) {
          this.velocityY = GAME_CONSTANTS.JUMP_FORCE;
          this.isGrounded = false;
          soundEngine.playJump();
        }
      } else if (action === 'SLIDE') {
        if (!this.isSliding) {
          this.isSliding = true;
          this.slideTimer = GAME_CONSTANTS.SLIDE_DURATION;
          // If in air, quickly slam down into slide!
          if (!this.isGrounded) {
            this.velocityY = -25;
          }
          soundEngine.playSlide();
        }
      }
    });

    this.inputController.attach(this.renderer.domElement);
  }

  public setCharacter(character: Character) {
    this.selectedCharacter = character;
    this.playerModel.applySkin(character);
    this.baseMultiplier = 1 + character.ability.multiplierBonus;
  }

  public startRun(levelNumber: number = 1, isEndless: boolean = false) {
    this.currentLevel = levelNumber;
    this.isEndless = isEndless;
    const levelInfo = generateLevelInfo(levelNumber);

    // Apply Biome Theme
    const biome = BIOMES[levelInfo.biome];
    this.scene.background = new THREE.Color(biome.skyColor);
    this.scene.fog = new THREE.FogExp2(biome.fogColor, 0.015);
    this.ambientLight.color.set(biome.ambientLight);
    this.ambientLight.intensity = biome.ambientLightIntensity;
    this.sunLight.color.set(biome.sunLight);

    // Reset player position and state
    this.currentLane = 0;
    this.targetX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.currentGroundY = 0;

    this.currentSpeed = GAME_CONSTANTS.BASE_SPEED * (levelInfo.speedMultiplier || 1.0);
    this.distanceRun = 0;
    this.coinsCollected = 0;
    this.obstaclesAvoided = 0;
    this.currentScore = 0;
    this.comboStreak = 0;
    this.comboTimer = 0;
    this.activePowerups.clear();
    this.invulnerabilityTimer = 0;

    this.levelGenerator.setLevel(levelNumber);

    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();

    soundEngine.startBGM();

    if (!this.animationFrameId) {
      this.animate();
    }
  }

  public pause() {
    this.isPaused = true;
    soundEngine.stopBGM();
  }

  public resume() {
    this.isPaused = false;
    this.clock.getDelta(); // flush delta lag
    soundEngine.startBGM();
  }

  public revive() {
    // Revive player with 4 seconds of invulnerability shield!
    this.isRunning = true;
    this.isPaused = false;
    this.invulnerabilityTimer = 4.0;
    this.activePowerups.set('SHIELD', { remainingTime: 4.0, duration: 4.0 });
    this.clock.getDelta();
    soundEngine.startBGM();
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    soundEngine.stopBGM();
  }

  public applyQualitySettings(quality: GameSettings['graphicsQuality']) {
    if (quality === 'low') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = true;
    } else if (quality === 'high') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
    } else {
      // Ultra
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.renderer.shadowMap.enabled = true;
    }
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private triggerPowerup(type: PowerupType) {
    const config = POWERUPS[type];
    const duration = config.duration + (type === 'SHIELD' ? this.selectedCharacter.ability.shieldDurationBonus : 0);
    this.activePowerups.set(type, { remainingTime: duration, duration });
    soundEngine.playPowerup();
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isRunning || this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.updateGameplay(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private updateGameplay(delta: number) {
    // 1. Power-ups update
    const activeList: ActivePowerup[] = [];
    const hasMagnet = this.activePowerups.has('MAGNET');
    const hasShield = this.activePowerups.has('SHIELD');
    const hasSpeedBoost = this.activePowerups.has('SPEED_BOOST');
    const hasMultiplier = this.activePowerups.has('MULTIPLIER');
    const hasJetpack = this.activePowerups.has('JETPACK');
    const hasTimeFreeze = this.activePowerups.has('TIME_FREEZE');

    for (const [type, data] of this.activePowerups.entries()) {
      data.remainingTime -= delta;
      if (data.remainingTime <= 0) {
        this.activePowerups.delete(type);
      } else {
        activeList.push({ type, remainingTime: data.remainingTime, duration: data.duration });
      }
    }
    this.callbacks.onPowerupUpdate(activeList);

    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= delta;
    }

    // 2. Speed & Distance kinematics
    let effectiveSpeed = this.currentSpeed;
    if (hasSpeedBoost) effectiveSpeed *= 1.5;
    if (hasTimeFreeze) effectiveSpeed *= 0.85;

    // Gradual forward speed acceleration
    this.currentSpeed = Math.min(GAME_CONSTANTS.MAX_SPEED, this.currentSpeed + GAME_CONSTANTS.SPEED_INCREMENT * delta);

    const distanceDelta = effectiveSpeed * delta;
    this.distanceRun += distanceDelta;
    this.playerZ -= distanceDelta;

    // 3. Lane switching physics
    const laneSwitchSpeed = 16 + this.selectedCharacter.stats.speed * 0.05;
    this.playerX = THREE.MathUtils.lerp(this.playerX, this.targetX, delta * laneSwitchSpeed);
    const laneTilt = (this.playerX - this.targetX) * 0.4;

    // 4. Vertical Jump & Gravity physics
    if (hasJetpack) {
      // Fly up to sky lane at Y=6.0!
      this.playerY = THREE.MathUtils.lerp(this.playerY, 5.5, delta * 8);
      this.isGrounded = false;
    } else {
      this.velocityY -= GAME_CONSTANTS.GRAVITY * delta;
      this.playerY += this.velocityY * delta;

      if (this.playerY <= this.currentGroundY) {
        this.playerY = this.currentGroundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // 5. Slide mechanics
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Position player group
    this.playerModel.group.position.set(this.playerX, this.playerY, this.playerZ);

    // Invulnerability blink flash
    if (this.invulnerabilityTimer > 0) {
      this.playerModel.group.visible = Math.floor(Date.now() / 80) % 2 === 0;
    } else {
      this.playerModel.group.visible = true;
    }

    // Update character animation
    this.playerModel.updateAnimation(delta, {
      isGrounded: this.isGrounded,
      isJumping: !this.isGrounded && !hasJetpack,
      isSliding: this.isSliding,
      speed: effectiveSpeed,
      hasShield,
      hasMagnet,
      hasJetpack,
      laneTilt,
    });

    // 6. Camera smooth follow
    const camTargetZ = this.playerZ + 6.8;
    const camTargetY = Math.max(3.8, this.playerY + 3.2);
    const camTargetX = this.playerX * 0.45;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camTargetX, delta * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camTargetY, delta * 10);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camTargetZ, delta * 16);
    this.camera.lookAt(this.playerX * 0.2, this.playerY * 0.5 + 1.2, this.playerZ - 12);

    // Dynamic FOV kick during speed boost
    const targetFOV = hasSpeedBoost ? 75 : 65;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, delta * 5);
    this.camera.updateProjectionMatrix();

    // 7. Update Level Streaming & Chunks
    this.levelGenerator.update(this.playerZ);

    // 8. Update Obstacles & Moving Trains
    this.obstaclePool.update(delta, this.playerZ);

    // 9. Update Collectibles & Magnet Pull
    this.collectiblePool.update(
      delta,
      new THREE.Vector3(this.playerX, this.playerY + 0.8, this.playerZ),
      hasMagnet,
      this.selectedCharacter.ability.magnetRangeBonus,
      () => {
        // Coin collected callback
        this.coinsCollected++;
        soundEngine.playCoin();
        this.comboStreak++;
        this.comboTimer = 2.5; // 2.5s window to chain combo
        const comboMultiplier = Math.min(8, 1 + Math.floor(this.comboStreak / 10));
        this.currentScore += 50 * comboMultiplier * (hasMultiplier ? 2 : 1) * this.baseMultiplier;
      },
      (powerupType: PowerupType) => {
        // Powerup collected callback
        this.triggerPowerup(powerupType);
      }
    );

    // 10. Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboStreak = 0;
      }
    }

    // 11. Score accumulation from distance
    const totalMultiplier = (hasMultiplier ? 2 : 1) * this.baseMultiplier;
    this.currentScore += Math.floor(distanceDelta * 3 * totalMultiplier);

    // Emit HUD telemetry callback
    const currentCombo = Math.min(8, 1 + Math.floor(this.comboStreak / 10));
    this.callbacks.onScoreUpdate(
      Math.floor(this.currentScore),
      Math.floor(this.distanceRun),
      this.coinsCollected,
      currentCombo,
      totalMultiplier
    );

    // 12. Check Level Completion (if in level mode)
    if (!this.isEndless) {
      const levelInfo = generateLevelInfo(this.currentLevel);
      if (this.distanceRun >= levelInfo.targetDistance) {
        this.handleLevelWin();
        return;
      }
    }

    // 13. Collision Detection with Obstacles
    this.checkCollisions(hasShield, hasSpeedBoost, hasJetpack);
  }

  private checkCollisions(hasShield: boolean, hasSpeedBoost: boolean, hasJetpack: boolean) {
    if (this.invulnerabilityTimer > 0 || hasSpeedBoost || hasJetpack) {
      return; // Immune while invulnerable or flying!
    }

    const playerBox = new THREE.Box3();
    const halfWidth = 0.45;
    const playerBottom = this.playerY;
    // Lower player box height if sliding!
    const playerTop = this.playerY + (this.isSliding ? 0.75 : 1.9);

    playerBox.min.set(this.playerX - halfWidth, playerBottom, this.playerZ - 0.45);
    playerBox.max.set(this.playerX + halfWidth, playerTop, this.playerZ + 0.45);

    let onPlatform = false;

    for (const obs of this.obstaclePool.obstacles) {
      if (!obs.active) continue;

      // Quick Z distance cull
      if (Math.abs(obs.z - this.playerZ) > 8) continue;

      if (obs.box.intersectsBox(playerBox)) {
        // Check if player jumped onto a train roof platform or ramp
        if (obs.canClimb && this.playerY >= 3.0 && this.velocityY <= 0) {
          this.currentGroundY = 3.25;
          onPlatform = true;
          continue;
        }

        // Check if slide allows passing under HIGH_BARRIER
        if (obs.requiresSlide && this.isSliding) {
          // Passed under safely!
          this.obstaclesAvoided++;
          continue;
        }

        // Check if jump cleared a low HURDLE
        if (obs.requiresJump && this.playerY > 1.0) {
          // Cleared hurdle safely!
          this.obstaclesAvoided++;
          continue;
        }

        // Real Collision Hit!
        if (hasShield) {
          // Shield absorbs crash!
          this.activePowerups.delete('SHIELD');
          this.invulnerabilityTimer = 2.5; // Grace period
          soundEngine.playCrash();
          // Despawn this obstacle
          this.obstaclePool.recycle(obs);
          return;
        }

        // Crash and Game Over!
        this.handleGameOver();
        return;
      }
    }

    // If walked off train roof, restore ground to 0
    if (!onPlatform && this.currentGroundY > 0 && !hasJetpack) {
      this.currentGroundY = 0;
    }
  }

  private handleGameOver() {
    this.isRunning = false;
    soundEngine.playCrash();
    soundEngine.stopBGM();

    this.callbacks.onGameOver({
      score: Math.floor(this.currentScore),
      distance: Math.floor(this.distanceRun),
      coins: this.coinsCollected,
      obstaclesAvoided: this.obstaclesAvoided,
    });
  }

  private handleLevelWin() {
    this.isRunning = false;
    soundEngine.playVictory();
    soundEngine.stopBGM();

    this.callbacks.onLevelComplete(this.currentLevel, {
      score: Math.floor(this.currentScore),
      distance: Math.floor(this.distanceRun),
      coins: this.coinsCollected,
    });
  }

  public destroy() {
    this.stop();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputController.detach(this.renderer.domElement);
    window.removeEventListener('resize', this.handleResize.bind(this));
    if (this.renderer && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
