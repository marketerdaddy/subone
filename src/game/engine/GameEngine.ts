import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GAME_CONSTANTS, BIOMES, generateLevelInfo, CHARACTERS, POWERUPS } from '../../config/gameConfig';
import { Character, PowerupType, ActivePowerup, GameSettings } from '../../types/game';
import { PlayerModel } from '../player/PlayerModel';
import { ObstaclePool } from '../obstacles/ObstaclePool';
import { CollectiblePool } from '../collectibles/CollectiblePool';
import { LevelGenerator } from '../levels/LevelGenerator';
import { InputController, InputAction } from '../controls/InputController';
import { soundEngine } from '../../services/audio/soundEngine';
import { ProceduralTextures } from '../textures/ProceduralTextures';

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
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private postProcessingEnabled: boolean = false;
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private characterKeyLight!: THREE.DirectionalLight;
  private characterFillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private speedStreaks!: THREE.Points;
  private streakPositions!: Float32Array;
  private clock!: THREE.Clock;
  private animationFrameId: number | null = null;
  private readonly boundHandleResize = () => this.handleResize();

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

  // Camera Dynamics & Impact Shake
  private cameraShakeIntensity: number = 0;
  private cameraShakeDuration: number = 0;
  private readonly cameraShakeDecay: number = 4.5;
  private wasGroundedLastFrame: boolean = true;

  // Adaptive Quality & Runtime FPS Monitoring
  private frameCount: number = 0;
  private fpsTimer: number = 0;
  private currentFps: number = 60;
  private lowFpsDuration: number = 0;
  private adaptiveCooldown: number = 0;
  private isAutoDowngraded: boolean = false;

  // 3D Character Showcase Pedestal & Presentation
  private showcasePedestal!: THREE.Group;
  private showcaseBackdrop!: THREE.Group;
  private pedestalOuterRing!: THREE.Mesh;
  private pedestalInnerRing!: THREE.Mesh;
  private showcaseParticles!: THREE.Points;
  private showcaseTime: number = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.initScene();
    this.initEntities();
    this.initShowcase();
    this.initInput();
    this.animate();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060f);
    this.scene.fog = new THREE.FogExp2(0x04060f, 0.003);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 240);
    this.camera.position.set(0, 3.8, 6.2);
    this.camera.lookAt(0, 1.4, -8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 1. Dynamic Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    this.scene.add(this.ambientLight);

    // 2. Global Directional Sunlight
    this.sunLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    this.sunLight.position.set(10, 25, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    // 3. Cinematic Character Key Light (Three-point setup for showcase)
    this.characterKeyLight = new THREE.DirectionalLight(0xfff8f0, 2.8);
    this.characterKeyLight.position.set(2.5, 5.0, 5.0);
    this.characterKeyLight.castShadow = false;
    this.scene.add(this.characterKeyLight);
    this.scene.add(this.characterKeyLight.target);

    // 4. Warm Character Fill Light (Brings out front armor and chest details)
    this.characterFillLight = new THREE.DirectionalLight(0xfff0e0, 1.6);
    this.characterFillLight.position.set(-3.0, 4.0, 4.0);
    this.scene.add(this.characterFillLight);
    this.scene.add(this.characterFillLight.target);

    // 5. Bright Cyan Rim / Back-Kicker (Silhouettes character against dark city)
    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 3.2);
    this.rimLight.position.set(-3.0, 4.0, -4.0);
    this.scene.add(this.rimLight);
    this.scene.add(this.rimLight.target);

    // 5. Streaming Speed Particles System
    const streakCount = 120;
    const streakGeo = new THREE.BufferGeometry();
    this.streakPositions = new Float32Array(streakCount * 3);
    for (let i = 0; i < streakCount; i++) {
      this.streakPositions[i * 3] = (Math.random() - 0.5) * 16;
      this.streakPositions[i * 3 + 1] = 0.5 + Math.random() * 8;
      this.streakPositions[i * 3 + 2] = -Math.random() * 80;
    }
    streakGeo.setAttribute('position', new THREE.BufferAttribute(this.streakPositions, 3));
    const streakMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.speedStreaks = new THREE.Points(streakGeo, streakMat);
    this.scene.add(this.speedStreaks);

    // 6. Optional Cinematic Post-Processing Pipeline
    try {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.4, // Subtle neon glow intensity
        0.35, // Glow radius
        0.82 // Bloom threshold (only bright neons trigger bloom)
      );
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
    } catch {
      this.composer = null;
    }

    this.clock = new THREE.Clock();

    window.addEventListener('resize', this.boundHandleResize);
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

  private initShowcase() {
    this.showcasePedestal = new THREE.Group();
    this.scene.add(this.showcasePedestal);

    // 1. Sleek dark tungsten pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.3, 1.45, 0.18, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.85,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.09;
    baseMesh.receiveShadow = true;
    this.showcasePedestal.add(baseMesh);

    // 2. Beveled metallic trim
    const trimGeo = new THREE.TorusGeometry(1.32, 0.025, 8, 36);
    trimGeo.rotateX(Math.PI / 2);
    const trimMesh = new THREE.Mesh(
      trimGeo,
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.9,
      })
    );
    this.showcasePedestal.add(trimMesh);

    // 3. Concentric rotating holographic rings
    const outerRingGeo = new THREE.TorusGeometry(1.15, 0.016, 8, 36);
    outerRingGeo.rotateX(Math.PI / 2);
    this.pedestalOuterRing = new THREE.Mesh(outerRingGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    this.pedestalOuterRing.position.y = 0.01;
    this.showcasePedestal.add(this.pedestalOuterRing);

    const innerRingGeo = new THREE.TorusGeometry(0.85, 0.014, 8, 32);
    innerRingGeo.rotateX(Math.PI / 2);
    this.pedestalInnerRing = new THREE.Mesh(innerRingGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    this.pedestalInnerRing.position.y = 0.02;
    this.showcasePedestal.add(this.pedestalInnerRing);

    // 4. Floating atmospheric dust motes around character
    const moteCount = 50;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 3.5;
      motePos[i * 3 + 1] = Math.random() * 2.6;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    this.showcaseParticles = new THREE.Points(moteGeo, moteMat);
    this.showcasePedestal.add(this.showcaseParticles);

    // 5. Ground uplight spotlight onto character
    const spot = new THREE.SpotLight(0x38bdf8, 2.8, 6, Math.PI / 4, 0.45, 1);
    spot.position.set(0, 0.05, 0.2);
    spot.target.position.set(0, 1.0, 0);
    this.showcasePedestal.add(spot);
    this.showcasePedestal.add(spot.target);

    // 6. Cinematic City Backdrop Towers framing character in portrait showcase
    this.showcaseBackdrop = new THREE.Group();
    this.scene.add(this.showcaseBackdrop);

    const bMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getBuildingTexture(215),
      roughness: 0.35,
      metalness: 0.65,
    });

    const towers = [
      { x: -5.6, y: 12, z: -17, w: 6.5, h: 26, d: 8 },
      { x: 5.6, y: 13, z: -17, w: 6.5, h: 28, d: 8 },
      { x: -9.2, y: 15, z: -25, w: 8.5, h: 32, d: 9 },
      { x: 9.2, y: 16, z: -25, w: 8.5, h: 35, d: 9 },
    ];

    towers.forEach((t) => {
      const bGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(t.x, t.y, t.z);
      this.showcaseBackdrop.add(bMesh);

      // Rooftop antenna spire
      const spireGeo = new THREE.CylinderGeometry(0.1, 0.25, 7, 6);
      const spire = new THREE.Mesh(spireGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      spire.position.set(t.x, t.y + t.h / 2 + 3.5, t.z);
      this.showcaseBackdrop.add(spire);

      // Warning beacon
      const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      beacon.position.set(t.x, t.y + t.h / 2 + 7, t.z);
      this.showcaseBackdrop.add(beacon);
    });

    // Holographic Cyberpunk Billboard Sign positioned above the skyline
    const signTex = ProceduralTextures.getNeonSignTexture('NEXUS RUN', '#00f0ff');
    const signGeo = new THREE.PlaneGeometry(8.5, 2.4);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide });
    const billboard = new THREE.Mesh(signGeo, signMat);
    billboard.position.set(0, 8.2, -18);
    this.showcaseBackdrop.add(billboard);
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

    if (this.showcasePedestal) this.showcasePedestal.visible = false;
    if (this.showcaseBackdrop) this.showcaseBackdrop.visible = false;
    this.camera.fov = 70;
    this.camera.updateProjectionMatrix();
    this.playerModel.group.rotation.set(0, 0, 0);

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

  public triggerCameraShake(intensity: number, duration: number) {
    this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, intensity);
    this.cameraShakeDuration = Math.max(this.cameraShakeDuration, duration);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.showcasePedestal) this.showcasePedestal.visible = true;
    if (this.showcaseBackdrop) this.showcaseBackdrop.visible = true;
    this.playerModel.group.position.set(0, 0.02, 0);
    this.playerModel.group.rotation.set(0, 0, 0);
    // Restore showcase atmosphere
    this.scene.background = new THREE.Color(0x04060f);
    this.scene.fog = new THREE.FogExp2(0x04060f, 0.003);
    this.ambientLight.color.set(0x38bdf8);
    this.ambientLight.intensity = 1.2;
    soundEngine.stopBGM();
  }

  public applyQualitySettings(quality: GameSettings['graphicsQuality']) {
    this.isAutoDowngraded = false;
    this.adaptiveCooldown = 6.0; // Grace period after manual settings change
    this.lowFpsDuration = 0;

    if (quality === 'low') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
      this.postProcessingEnabled = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = true;
      this.postProcessingEnabled = false;
    } else if (quality === 'high') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.postProcessingEnabled = this.composer !== null;
    } else {
      // Ultra
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.renderer.shadowMap.enabled = true;
      this.postProcessingEnabled = this.composer !== null;
    }
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  private triggerPowerup(type: PowerupType) {
    const config = POWERUPS[type];
    const duration = config.duration + (type === 'SHIELD' ? this.selectedCharacter.ability.shieldDurationBonus : 0);
    this.activePowerups.set(type, { remainingTime: duration, duration });
    soundEngine.playPowerup();
  }

  private checkAdaptiveQuality() {
    if (this.adaptiveCooldown > 0) {
      this.adaptiveCooldown -= 1.0;
      return;
    }

    // If FPS drops below 32 for over 3 seconds on devices with post-processing enabled
    if (this.currentFps < 32 && (this.postProcessingEnabled || this.renderer.shadowMap.enabled)) {
      this.lowFpsDuration += 1.0;
      if (this.lowFpsDuration >= 3.0 && !this.isAutoDowngraded) {
        console.warn(`[GameEngine] Adaptive Quality: Throttling post-processing and shadows to restore smooth framerate (FPS: ${Math.round(this.currentFps)})`);
        this.postProcessingEnabled = false;
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        this.isAutoDowngraded = true;
        this.adaptiveCooldown = 15.0; // 15 second hysteresis
        this.lowFpsDuration = 0;
      }
    } else {
      this.lowFpsDuration = 0;
    }
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Runtime FPS calculation
    this.frameCount++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 1.0) {
      this.currentFps = this.frameCount / this.fpsTimer;
      this.frameCount = 0;
      this.fpsTimer = 0;
      this.checkAdaptiveQuality();
    }

    if (!this.isRunning || this.isPaused) {
      if (!this.isRunning) {
        this.updateShowcase(delta);
      }
      this.renderFrame();
      return;
    }

    this.updateGameplay(delta);
    this.renderFrame();
  };

  private renderFrame() {
    if (this.postProcessingEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateShowcase(delta: number) {
    this.showcaseTime += delta;
    if (this.showcasePedestal) this.showcasePedestal.visible = true;

    // Rotate holographic rings in opposing directions
    if (this.pedestalOuterRing) this.pedestalOuterRing.rotation.z += delta * 0.45;
    if (this.pedestalInnerRing) this.pedestalInnerRing.rotation.z -= delta * 0.65;

    // Drifting atmospheric dust motes
    if (this.showcaseParticles) {
      const pos = this.showcaseParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += delta * 0.22;
        if (pos[i + 1] > 2.8) pos[i + 1] = 0.05;
      }
      this.showcaseParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Position character at pedestal center
    this.playerModel.group.position.set(0, 0.02, 0);

    // Gentle character presentation rotation
    this.playerModel.group.rotation.y = Math.sin(this.showcaseTime * 0.35) * 0.22;

    // Organic idle breathing & posture
    this.playerModel.updateAnimation(delta, {
      isGrounded: true,
      isJumping: false,
      isSliding: false,
      speed: 0,
      isIdle: true,
    });

    // Cinematic camera: full-body portrait framing (helmet to sneakers)
    // Character height ~1.95m, center ~0.97m. Camera at Y=0.97, Z=4.8, fov=38 covers full body.
    const camX = Math.sin(this.showcaseTime * 0.18) * 0.18;
    const camY = 0.97 + Math.sin(this.showcaseTime * 0.28) * 0.025;
    const camZ = 4.8;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 0.90, 0);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 38, delta * 6);
    this.camera.updateProjectionMatrix();

    // Three-point lighting: key from front-right, fill from front-left, rim from back-left
    this.characterKeyLight.position.set(2.4, 4.0, 3.5);
    this.characterKeyLight.target.position.set(0, 0.90, 0);
    this.characterFillLight.position.set(-2.8, 3.5, 3.5);
    this.characterFillLight.target.position.set(0, 0.90, 0);
    this.rimLight.position.set(-2.0, 3.5, -3.0);
    this.rimLight.target.position.set(0, 1.0, 0);
  }

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

    // 6. Cinematic Third-Person Camera Follow
    const camTargetZ = this.playerZ + 5.6;
    const camTargetY = Math.max(2.6, this.playerY * 0.7 + 2.6);
    const camTargetX = this.playerX * 0.35;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camTargetX, delta * 12);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camTargetY, delta * 12);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camTargetZ, delta * 16);
    this.camera.lookAt(this.playerX * 0.2, this.playerY * 0.5 + 1.2, this.playerZ - 14);

    // Apply Subtle Camera Shake
    if (this.cameraShakeDuration > 0) {
      this.cameraShakeDuration -= delta;
      const shakeX = (Math.random() - 0.5) * 2 * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * 2 * this.cameraShakeIntensity;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * this.cameraShakeDecay);
    }

    // Dynamic Banking Roll on Lane Switch
    const targetRoll = -laneTilt * 0.045;
    this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, targetRoll, delta * 12);

    // Speed-responsive FOV kick
    const speedRatio = Math.min(1.0, (effectiveSpeed - GAME_CONSTANTS.BASE_SPEED) / (GAME_CONSTANTS.MAX_SPEED - GAME_CONSTANTS.BASE_SPEED));
    const targetFOV = (hasSpeedBoost ? 84 : 70) + speedRatio * 8;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, delta * 6);
    this.camera.updateProjectionMatrix();

    // Check Landing Feedback Shake
    if (!this.wasGroundedLastFrame && this.isGrounded) {
      this.triggerCameraShake(0.06, 0.12);
    }
    this.wasGroundedLastFrame = this.isGrounded;

    // 6b. Position Character Key Light & Rim Light to follow runner
    if (this.characterKeyLight) {
      this.characterKeyLight.position.set(this.playerX + 3.5, this.playerY + 7.5, this.playerZ + 5);
      this.characterKeyLight.target.position.set(this.playerX, this.playerY + 1.2, this.playerZ);
    }
    if (this.rimLight) {
      this.rimLight.position.set(this.playerX - 4.5, this.playerY + 5.5, this.playerZ - 8);
      this.rimLight.target.position.set(this.playerX, this.playerY + 1.0, this.playerZ);
    }

    // 6c. Stream Speed Streak Particles past player
    if (this.speedStreaks && this.streakPositions) {
      const posAttr = this.speedStreaks.geometry.attributes.position as THREE.BufferAttribute;
      const count = this.streakPositions.length / 3;
      for (let i = 0; i < count; i++) {
        // Move towards camera to simulate forward flight
        this.streakPositions[i * 3 + 2] += distanceDelta * 1.6;
        if (this.streakPositions[i * 3 + 2] > this.playerZ + 8) {
          this.streakPositions[i * 3 + 2] = this.playerZ - 70 - Math.random() * 30;
          this.streakPositions[i * 3] = this.playerX + (Math.random() - 0.5) * 16;
          this.streakPositions[i * 3 + 1] = 0.5 + Math.random() * 8;
        }
      }
      posAttr.needsUpdate = true;
    }

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
          this.triggerCameraShake(0.24, 0.28);
          // Despawn this obstacle
          this.obstaclePool.recycle(obs);
          return;
        }

        // Crash and Game Over!
        this.triggerCameraShake(0.38, 0.45);
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
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.boundHandleResize);

    if (this.inputController && this.renderer?.domElement) {
      this.inputController.detach(this.renderer.domElement);
    }

    // Traverse and dispose all scene geometries and materials
    if (this.scene) {
      this.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      this.scene.clear();
    }

    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement?.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
