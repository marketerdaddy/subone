import * as THREE from 'three';
import { GAME_CONSTANTS, BIOMES, generateLevelInfo } from '../../config/gameConfig';
import { BiomeConfig, BiomeType, PowerupType } from '../../types/game';
import { ObstaclePool, ObstacleType } from '../obstacles/ObstaclePool';
import { CollectiblePool } from '../collectibles/CollectiblePool';

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

  constructor(obstaclePool: ObstaclePool, collectiblePool: CollectiblePool) {
    this.group = new THREE.Group();
    this.obstaclePool = obstaclePool;
    this.collectiblePool = collectiblePool;
    this.initMaterials();
  }

  private initMaterials() {
    this.trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.railMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
    this.buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.5,
      metalness: 0.5,
    });
  }

  public setLevel(levelNumber: number) {
    this.currentLevelNumber = levelNumber;
    const levelInfo = generateLevelInfo(levelNumber);
    this.currentBiome = BIOMES[levelInfo.biome];

    // Update materials for biome
    this.trackMaterial.color.set(this.currentBiome.trackColor);
    this.railMaterial.color.set(this.currentBiome.railColor);
    this.buildingMaterial.color.set(this.currentBiome.buildingColors[0]);

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

    // 1. Build 3-Lane Track Bed
    const trackWidth = GAME_CONSTANTS.LANE_WIDTH * 3.4;
    const trackGeo = new THREE.BoxGeometry(trackWidth, 0.4, GAME_CONSTANTS.CHUNK_LENGTH);
    const trackMesh = new THREE.Mesh(trackGeo, this.trackMaterial);
    trackMesh.position.set(0, -0.2, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
    trackMesh.receiveShadow = true;
    chunkGroup.add(trackMesh);

    // Glowing Neon Rails along the 3 lanes
    [-GAME_CONSTANTS.LANE_WIDTH * 1.5, -GAME_CONSTANTS.LANE_WIDTH * 0.5, GAME_CONSTANTS.LANE_WIDTH * 0.5, GAME_CONSTANTS.LANE_WIDTH * 1.5].forEach((rx) => {
      const railGeo = new THREE.BoxGeometry(0.12, 0.1, GAME_CONSTANTS.CHUNK_LENGTH);
      const rail = new THREE.Mesh(railGeo, this.railMaterial);
      rail.position.set(rx, 0.05, zStart - GAME_CONSTANTS.CHUNK_LENGTH / 2);
      chunkGroup.add(rail);
    });

    // 2. Procedural City / Biome Scenery (Buildings, Towers, Spire Archways)
    this.buildChunkScenery(chunkGroup, zStart);

    // 3. Procedural Obstacles & Collectibles Generation
    // Never spawn obstacles in the very first safe start chunk (chunkIdx === 0)
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
    const biome = this.currentBiome;
    const bColor1 = biome.buildingColors[0];
    const bColor2 = biome.buildingColors[1] || bColor1;

    // Left and right side background scenery
    [-1, 1].forEach((side) => {
      const numBuildings = 4;
      for (let i = 0; i < numBuildings; i++) {
        const height = 15 + this.random() * 35;
        const width = 8 + this.random() * 8;
        const depth = 10 + this.random() * 8;
        const xDist = side * (10 + width / 2 + this.random() * 4);
        const zDist = zStart - (i * 15 + this.random() * 5);

        const bGeo = new THREE.BoxGeometry(width, height, depth);
        const bMat = new THREE.MeshStandardMaterial({
          color: this.random() > 0.5 ? bColor1 : bColor2,
          roughness: 0.6,
          metalness: 0.4,
        });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(xDist, height / 2 - 2, zDist);
        chunkGroup.add(building);

        // Hologram / Neon light windows on building
        if (this.random() > 0.4) {
          const winGeo = new THREE.BoxGeometry(width * 0.8, 1.2, depth * 0.8);
          const winMat = new THREE.MeshBasicMaterial({ color: biome.railColor });
          const win = new THREE.Mesh(winGeo, winMat);
          win.position.set(xDist, height * 0.6, zDist);
          chunkGroup.add(win);
        }
      }
    });

    // Overhead Archway every 2 chunks
    if (this.nextChunkIndex % 2 === 0) {
      const archGeo = new THREE.BoxGeometry(14, 1.2, 1.5);
      const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(0, 7.5, zStart - 30);
      chunkGroup.add(arch);

      // Glowing under-strip
      const archGlowGeo = new THREE.BoxGeometry(13, 0.2, 0.4);
      const archGlow = new THREE.Mesh(archGlowGeo, this.railMaterial);
      archGlow.position.set(0, 6.8, zStart - 30);
      chunkGroup.add(archGlow);
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
