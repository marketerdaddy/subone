import * as THREE from 'three';
import { GAME_CONSTANTS, BIOMES, generateLevelInfo } from '../../config/gameConfig';
import { BiomeConfig, PowerupType } from '../../types/game';
import { ObstaclePool, ObstacleType } from '../obstacles/ObstaclePool';
import { CollectiblePool } from '../collectibles/CollectiblePool';
import { ProceduralTextures } from '../textures/ProceduralTextures';

export interface TrackChunk {
  group: THREE.Group;
  chunkIndex: number;
  zStart: number;
  zEnd: number;
  active: boolean;
}

export class LevelGenerator {
  public group: THREE.Group;
  private obstaclePool: ObstaclePool;
  private collectiblePool: CollectiblePool;

  private currentLevelNumber: number = 1;
  private currentBiome: BiomeConfig = BIOMES.NEON_CITY;
  private activeChunks: TrackChunk[] = [];
  private nextChunkIndex: number = 0;
  private rngSeed: number = 12345;

  // Materials pooled per biome
  private trackMaterial!: THREE.MeshStandardMaterial;
  private railMaterial!: THREE.MeshBasicMaterial;
  private buildingMaterial!: THREE.MeshStandardMaterial;
  private guardrailMaterial!: THREE.MeshStandardMaterial;
  private neonSigns: string[] = ['NEON RUN', 'CYBERDRIVE', 'NEXUS', 'APEX 500', 'HYPERDRIVE'];

  constructor(obstaclePool: ObstaclePool, collectiblePool: CollectiblePool) {
    this.group = new THREE.Group();
    this.obstaclePool = obstaclePool;
    this.collectiblePool = collectiblePool;
    this.initMaterials();
  }

  private initMaterials() {
    this.trackMaterial = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getHighwayTrackTexture(),
      roughness: 0.35,
      metalness: 0.5,
    });
    this.railMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });
    this.buildingMaterial = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getBuildingTexture(215),
      roughness: 0.4,
      metalness: 0.5,
    });
    this.guardrailMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
  }

  public setLevel(levelNumber: number) {
    this.currentLevelNumber = levelNumber;
    const levelInfo = generateLevelInfo(levelNumber);
    this.currentBiome = BIOMES[levelInfo.biome] || BIOMES.NEON_CITY;

    // Keep rich cyber palette active
    this.railMaterial.color.set(this.currentBiome.railColor || 0x00f0ff);

    // Initialize deterministic PRNG seed based on level
    this.rngSeed = (levelNumber * 7919 + 65537) % 2147483647;

    this.reset();
  }

  // Fast seeded pseudo random number generator
  private random(): number {
    this.rngSeed = (this.rngSeed * 16807) % 2147483647;
    return (this.rngSeed - 1) / 2147483646;
  }

  public reset() {
    // Clear existing chunks and objects
    for (const chunk of this.activeChunks) {
      this.group.remove(chunk.group);
    }
    this.activeChunks = [];
    this.nextChunkIndex = 0;
    this.obstaclePool.clearAll();
    this.collectiblePool.clearAll();

    // Spawn initial visible chunks ahead of starting point (starting at z=0, running forward into negative Z)
    for (let i = 0; i < GAME_CONSTANTS.VISIBLE_CHUNKS; i++) {
      this.spawnChunk();
    }
  }

  public update(playerZ: number) {
    // Check if player has progressed enough to spawn the next chunk ahead
    const furthestZ = -this.nextChunkIndex * GAME_CONSTANTS.CHUNK_LENGTH;
    if (playerZ < furthestZ + (GAME_CONSTANTS.VISIBLE_CHUNKS - 2) * GAME_CONSTANTS.CHUNK_LENGTH) {
      this.spawnChunk();
    }

    // Remove old chunks that are behind player
    const thresholdZ = playerZ + GAME_CONSTANTS.CHUNK_LENGTH;
    while (this.activeChunks.length > 0 && this.activeChunks[0].zEnd > thresholdZ) {
      const oldChunk = this.activeChunks.shift();
      if (oldChunk) {
        this.group.remove(oldChunk.group);
      }
    }
  }

  private spawnChunk() {
    const chunkIdx = this.nextChunkIndex++;
    const zStart = -chunkIdx * GAME_CONSTANTS.CHUNK_LENGTH;
    const zEnd = zStart - GAME_CONSTANTS.CHUNK_LENGTH;

    const chunkGroup = new THREE.Group();

    // 1. Build 3-Lane Track Bed with High-Res Asphalt Texture
    const trackWidth = GAME_CONSTANTS.LANE_WIDTH * 3.4;
    const trackGeo = new THREE.BoxGeometry(trackWidth, 0.4, GAME_CONSTANTS.CHUNK_LENGTH);
    const trackMesh = new THREE.Mesh(trackGeo, this.trackMaterial);
    trackMesh.position.set(0, -0.2, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
    trackMesh.receiveShadow = true;
    chunkGroup.add(trackMesh);

    // Glowing Neon Rails along the 3 lanes
    [-GAME_CONSTANTS.LANE_WIDTH * 1.5, -GAME_CONSTANTS.LANE_WIDTH * 0.5, GAME_CONSTANTS.LANE_WIDTH * 0.5, GAME_CONSTANTS.LANE_WIDTH * 1.5].forEach((rx) => {
      const railGeo = new THREE.BoxGeometry(0.12, 0.12, GAME_CONSTANTS.CHUNK_LENGTH);
      const rail = new THREE.Mesh(railGeo, this.railMaterial);
      rail.position.set(rx, 0.06, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
      chunkGroup.add(rail);
    });

    // Outer Guardrails / Crash Barriers on Highway Edges
    [-trackWidth / 2, trackWidth / 2].forEach((bx) => {
      const barrierGeo = new THREE.BoxGeometry(0.2, 0.8, GAME_CONSTANTS.CHUNK_LENGTH);
      const barrier = new THREE.Mesh(barrierGeo, this.guardrailMaterial);
      barrier.position.set(bx, 0.3, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
      chunkGroup.add(barrier);

      // Neon Top Strip on Guardrail
      const stripGeo = new THREE.BoxGeometry(0.08, 0.08, GAME_CONSTANTS.CHUNK_LENGTH);
      const strip = new THREE.Mesh(stripGeo, this.railMaterial);
      strip.position.set(bx, 0.72, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
      chunkGroup.add(strip);
    });

    // 2. Procedural City Scenery (Textured High-Rise Skyscrapers, Neon Billboards, Gantries)
    this.buildChunkScenery(chunkGroup, zStart);

    // 3. Procedural Obstacles & Collectibles Generation
    if (chunkIdx > 0) {
      this.populateChunkContent(zStart);
    }

    this.group.add(chunkGroup);

    this.activeChunks.push({
      group: chunkGroup,
      chunkIndex: chunkIdx,
      zStart,
      zEnd,
      active: true,
    });
  }

  private buildChunkScenery(chunkGroup: THREE.Group, zStart: number) {
    // Left and right side background scenery with textured skyscrapers
    [-1, 1].forEach((side) => {
      const numBuildings = 4;
      for (let i = 0; i < numBuildings; i++) {
        const height = 35 + this.random() * 50;
        const width = 12 + this.random() * 8;
        const depth = 14 + this.random() * 10;
        const xDist = side * (8.5 + width / 2 + this.random() * 4);
        const zDist = zStart - (i * 15 + this.random() * 4);

        // Main Skyscraper Body
        const bGeo = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(bGeo, this.buildingMaterial);
        building.position.set(xDist, height / 2 - 2, zDist);
        chunkGroup.add(building);

        // Rooftop Antenna / Beacon Spire
        const spireH = 8 + this.random() * 12;
        const spireGeo = new THREE.CylinderGeometry(0.15, 0.4, spireH, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(xDist, height + spireH / 2 - 2, zDist);
        chunkGroup.add(spire);

        // Blinking Red/Cyan Aircraft Warning Beacon at tip
        const beaconGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(xDist, height + spireH - 2, zDist);
        chunkGroup.add(beacon);

        // Holographic Cyberpunk Billboard Sign attached to select buildings
        if (i % 2 === 0 && this.random() > 0.25) {
          const signIdx = Math.floor(this.random() * this.neonSigns.length);
          const signText = this.neonSigns[signIdx];
          const signColor = this.random() > 0.5 ? '#00f0ff' : '#ec4899';
          const signTex = ProceduralTextures.getNeonSignTexture(signText, signColor);

          const signGeo = new THREE.PlaneGeometry(8, 4);
          const signMat = new THREE.MeshBasicMaterial({
            map: signTex,
            transparent: true,
            side: THREE.DoubleSide,
          });
          const billboard = new THREE.Mesh(signGeo, signMat);
          // Face toward track center
          const signX = side > 0 ? xDist - width / 2 - 0.2 : xDist + width / 2 + 0.2;
          billboard.position.set(signX, 10 + this.random() * 16, zDist);
          billboard.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          chunkGroup.add(billboard);
        }
      }
    });

    // Overhead Cyber Highway Gantry / Digital Sign every 2 chunks
    if (this.nextChunkIndex % 2 === 0) {
      const gantryGroup = new THREE.Group();
      gantryGroup.position.set(0, 0, zStart - 30);

      // Support pillars
      [-5.5, 5.5].forEach((px) => {
        const pGeo = new THREE.CylinderGeometry(0.3, 0.35, 8.5, 8);
        const pMesh = new THREE.Mesh(pGeo, this.guardrailMaterial);
        pMesh.position.set(px, 4.25, 0);
        gantryGroup.add(pMesh);
      });

      // Overhead crossbeam
      const beamGeo = new THREE.BoxGeometry(11.8, 1.4, 1.2);
      const beamMesh = new THREE.Mesh(beamGeo, this.guardrailMaterial);
      beamMesh.position.set(0, 8.0, 0);
      gantryGroup.add(beamMesh);

      // Overhead Digital Signboard
      const signTex = ProceduralTextures.getNeonSignTexture('NEXUS HIGHWAY', '#00f0ff');
      const signGeo = new THREE.PlaneGeometry(8.5, 2.0);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 8.0, 0.62);
      gantryGroup.add(sign);

      // Under-gantry glowing hazard tripwire
      const tripGeo = new THREE.BoxGeometry(11, 0.15, 0.15);
      const tripMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const trip = new THREE.Mesh(tripGeo, tripMat);
      trip.position.set(0, 7.2, 0);
      gantryGroup.add(trip);

      chunkGroup.add(gantryGroup);
    }
  }

  private populateChunkContent(zStart: number) {
    const levelInfo = generateLevelInfo(this.currentLevelNumber);
    const lanes = [-1, 0, 1]; // Left, Center, Right

    // Pattern segments per 60m chunk: e.g. 2 segments at z=-18 and z=-42
    const zOffsets = [18, 42];

    for (const zOff of zOffsets) {
      const segmentZ = zStart - zOff;
      const patternRoll = this.random();

      // ALWAYS ensure at least 1 valid open path (never block all 3 lanes without jump/slide solution!)
      if (patternRoll < 0.2) {
        // Pattern: COIN_ARCH or COIN_LINE in one lane, safe hurdles in other
        const safeLane = lanes[Math.floor(this.random() * lanes.length)];
        this.spawnCoinLine(safeLane, segmentZ - 10, 8);
      } else if (patternRoll < 0.4) {
        // Pattern: SINGLE_OBSTACLE + Coins in adjacent lane
        const obstacleLane = lanes[Math.floor(this.random() * lanes.length)];
        const otherLanes = lanes.filter((l) => l !== obstacleLane);
        const coinLane = otherLanes[Math.floor(this.random() * otherLanes.length)];

        const typeRoll = this.random();
        const obsType: ObstacleType = typeRoll < 0.4 ? 'HURDLE' : typeRoll < 0.7 ? 'HIGH_BARRIER' : 'PILLAR';
        this.obstaclePool.getObstacle(obsType, obstacleLane, segmentZ);
        this.spawnCoinLine(coinLane, segmentZ - 6, 6);
      } else if (patternRoll < 0.65) {
        // Pattern: DOUBLE_OBSTACLE (1 Guaranteed Safe Lane!)
        const safeLane = lanes[Math.floor(this.random() * lanes.length)];
        const blockedLanes = lanes.filter((l) => l !== safeLane);

        for (const lane of blockedLanes) {
          const type: ObstacleType = this.random() > 0.5 ? 'HURDLE' : 'HIGH_BARRIER';
          this.obstaclePool.getObstacle(type, lane, segmentZ);
        }
        // Reward player with coins in the safe lane
        this.spawnCoinLine(safeLane, segmentZ - 6, 7);
      } else if (patternRoll < 0.85) {
        // Pattern: SUBWAY TRAIN / BUS (Moving or stationary) + Jump Ramp
        const trainLane = lanes[Math.floor(this.random() * lanes.length)];
        const isMoving = this.random() < levelInfo.movingObstacleChance;
        this.obstaclePool.getObstacle('TRAIN', trainLane, segmentZ, isMoving);

        // Put a ramp in front of train if player wants to run on top!
        if (this.random() > 0.5) {
          this.obstaclePool.getObstacle('RAMP', trainLane, segmentZ + 11);
          // High altitude coins on train roof
          for (let k = 0; k < 5; k++) {
            this.collectiblePool.getCoin(trainLane, segmentZ - k * 2.5, 4.0);
          }
        }
      } else {
        // Pattern: POWERUP SEQUENCE
        const safeLane = lanes[Math.floor(this.random() * lanes.length)];
        const powerupTypes: PowerupType[] = ['MAGNET', 'SHIELD', 'SPEED_BOOST', 'MULTIPLIER', 'JETPACK', 'TIME_FREEZE'];
        const chosenPowerup = powerupTypes[Math.floor(this.random() * powerupTypes.length)];
        this.collectiblePool.getPowerup(chosenPowerup, safeLane, segmentZ);

        // Flanking coins
        const otherLanes = lanes.filter((l) => l !== safeLane);
        for (const ol of otherLanes) {
          this.spawnCoinLine(ol, segmentZ - 5, 5);
        }
      }
    }
  }

  private spawnCoinLine(lane: number, startZ: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.collectiblePool.getCoin(lane, startZ - i * 2.2, 0.8);
    }
  }
}
