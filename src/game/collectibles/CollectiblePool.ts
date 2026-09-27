import * as THREE from 'three';
import { GAME_CONSTANTS, POWERUPS } from '../../config/gameConfig';
import { PowerupType } from '../../types/game';

export interface CoinInstance {
  mesh: THREE.Mesh;
  lane: number;
  z: number;
  y: number;
  active: boolean;
  isBeingAttracted: boolean;
}

export interface PowerupItemInstance {
  group: THREE.Group;
  type: PowerupType;
  lane: number;
  z: number;
  active: boolean;
}

export class CollectiblePool {
  public group: THREE.Group;
  public coins: CoinInstance[] = [];
  public powerupItems: PowerupItemInstance[] = [];

  private coinGeometry: THREE.CylinderGeometry;
  private coinMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // Reusable coin geometry & glowing gold material
    this.coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16);
    this.coinGeometry.rotateZ(Math.PI / 2); // face forward/side
    this.coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.35,
    });
  }

  public getCoin(lane: number, z: number, y: number = 0.8): CoinInstance {
    let inst = this.coins.find((c) => !c.active);
    if (!inst) {
      const mesh = new THREE.Mesh(this.coinGeometry, this.coinMaterial);
      mesh.castShadow = true;
      inst = {
        mesh,
        lane,
        z,
        y,
        active: true,
        isBeingAttracted: false,
      };
      this.coins.push(inst);
      this.group.add(mesh);
    }

    inst.active = true;
    inst.lane = lane;
    inst.z = z;
    inst.y = y;
    inst.isBeingAttracted = false;
    inst.mesh.visible = true;
    inst.mesh.position.set(GAME_CONSTANTS.LANES[lane + 1], y, z);

    return inst;
  }

  public getPowerup(type: PowerupType, lane: number, z: number, y: number = 1.2): PowerupItemInstance {
    let inst = this.powerupItems.find((p) => !p.active && p.type === type);
    if (!inst) {
      const group = this.createPowerupMesh(type);
      inst = {
        group,
        type,
        lane,
        z,
        active: true,
      };
      this.powerupItems.push(inst);
      this.group.add(group);
    }

    inst.active = true;
    inst.lane = lane;
    inst.z = z;
    inst.group.visible = true;
    inst.group.position.set(GAME_CONSTANTS.LANES[lane + 1], y, z);

    return inst;
  }

  private createPowerupMesh(type: PowerupType): THREE.Group {
    const group = new THREE.Group();
    const config = POWERUPS[type];
    const colorHex = parseInt(config.color.replace('#', '0x'), 16);

    // Glowing core crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.65, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);

    // Orbiting particle rings
    const ringGeo = new THREE.TorusGeometry(0.9, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    group.add(ring);

    return group;
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    hasMagnet: boolean,
    magnetRangeBonus: number,
    onCollectCoin: () => void,
    onCollectPowerup: (type: PowerupType) => void
  ) {
    const magnetRadius = GAME_CONSTANTS.MAGNET_BASE_RADIUS + magnetRangeBonus;

    // Coins animation & magnet physics
    for (const c of this.coins) {
      if (!c.active) continue;

      // Spin coin
      c.mesh.rotation.y += delta * 4;

      // Check magnet attraction
      const distToPlayer = c.mesh.position.distanceTo(playerPos);

      if (hasMagnet && distToPlayer < magnetRadius) {
        c.isBeingAttracted = true;
      }

      if (c.isBeingAttracted) {
        // Smoothly zoom coin into player
        c.mesh.position.lerp(playerPos, delta * 14);
      }

      // Check collection threshold
      if (distToPlayer < 1.3) {
        c.active = false;
        c.mesh.visible = false;
        onCollectCoin();
        continue;
      }

      // Despawn if player passed coin
      if (c.mesh.position.z > playerPos.z + 15) {
        c.active = false;
        c.mesh.visible = false;
      }
    }

    // Powerups animation
    for (const p of this.powerupItems) {
      if (!p.active) continue;

      // Float & rotate
      p.group.rotation.y += delta * 2.5;
      p.group.position.y = 1.2 + Math.sin(Date.now() * 0.005) * 0.2;

      const dist = p.group.position.distanceTo(playerPos);
      if (dist < 1.4) {
        p.active = false;
        p.group.visible = false;
        onCollectPowerup(p.type);
        continue;
      }

      if (p.group.position.z > playerPos.z + 15) {
        p.active = false;
        p.group.visible = false;
      }
    }
  }

  public clearAll() {
    for (const c of this.coins) {
      c.active = false;
      c.mesh.visible = false;
    }
    for (const p of this.powerupItems) {
      p.active = false;
      p.group.visible = false;
    }
  }
}
