import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../config/gameConfig';

export type ObstacleType = 'HURDLE' | 'HIGH_BARRIER' | 'TRAIN' | 'RAMP' | 'PILLAR';

export interface ObstacleInstance {
  mesh: THREE.Group;
  type: ObstacleType;
  lane: number;
  z: number;
  active: boolean;
  box: THREE.Box3;
  isMoving: boolean;
  moveSpeed: number;
  requiresSlide: boolean;
  requiresJump: boolean;
  canClimb: boolean;
}

export class ObstaclePool {
  public group: THREE.Group;
  public obstacles: ObstacleInstance[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  public getObstacle(type: ObstacleType, lane: number, z: number, isMoving: boolean = false): ObstacleInstance {
    // Check for inactive obstacle in pool
    let inst = this.obstacles.find((o) => !o.active && o.type === type);
    if (!inst) {
      const mesh = this.createObstacleMesh(type);
      inst = {
        mesh,
        type,
        lane,
        z,
        active: true,
        box: new THREE.Box3(),
        isMoving,
        moveSpeed: isMoving ? 8 : 0,
        requiresSlide: type === 'HIGH_BARRIER',
        requiresJump: type === 'HURDLE',
        canClimb: type === 'RAMP' || type === 'TRAIN',
      };
      this.obstacles.push(inst);
      this.group.add(mesh);
    }

    inst.active = true;
    inst.lane = lane;
    inst.z = z;
    inst.isMoving = isMoving;
    inst.moveSpeed = isMoving ? 10 : 0;
    inst.mesh.visible = true;
    inst.mesh.position.set(GAME_CONSTANTS.LANES[lane + 1], 0, z);
    inst.box.setFromObject(inst.mesh);

    return inst;
  }

  public recycle(inst: ObstacleInstance) {
    inst.active = false;
    inst.mesh.visible = false;
  }

  public update(delta: number, playerZ: number) {
    for (const inst of this.obstacles) {
      if (!inst.active) continue;

      if (inst.isMoving) {
        // Move towards player along Z
        inst.z += inst.moveSpeed * delta;
        inst.mesh.position.z = inst.z;
      }

      // Update bounding box
      inst.box.setFromObject(inst.mesh);

      // Despawn once well behind player
      if (inst.z > playerZ + 20) {
        this.recycle(inst);
      }
    }
  }

  public clearAll() {
    for (const inst of this.obstacles) {
      this.recycle(inst);
    }
  }

  private createObstacleMesh(type: ObstacleType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'HURDLE') {
      // Low jump barrier with hazard stripes
      const frameGeo = new THREE.BoxGeometry(2.3, 0.9, 0.35);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.6,
        roughness: 0.4,
      });
      const hurdle = new THREE.Mesh(frameGeo, frameMat);
      hurdle.position.y = 0.45;
      hurdle.castShadow = true;
      group.add(hurdle);

      // Warning glow bar
      const glowGeo = new THREE.BoxGeometry(2.1, 0.15, 0.38);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = 0.65;
      group.add(glow);

      // Stands
      [-0.95, 0.95].forEach((x) => {
        const standGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.9, 8);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.set(x, 0.45, 0);
        group.add(stand);
      });
    } else if (type === 'HIGH_BARRIER') {
      // High laser archway / barrier that player must slide under
      const crossbarGeo = new THREE.BoxGeometry(2.5, 0.8, 0.4);
      const crossbarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
      const bar = new THREE.Mesh(crossbarGeo, crossbarMat);
      bar.position.y = 2.4; // High clearance
      bar.castShadow = true;
      group.add(bar);

      // Glowing laser line under bar
      const laserGeo = new THREE.BoxGeometry(2.3, 0.08, 0.08);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.y = 1.95;
      group.add(laser);

      // Side pillars
      [-1.15, 1.15].forEach((x) => {
        const pillarGeo = new THREE.CylinderGeometry(0.12, 0.16, 2.8, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 1.4, 0);
        group.add(pillar);
      });
    } else if (type === 'TRAIN') {
      // Futuristic cyber subway monorail car
      const trainGeo = new THREE.BoxGeometry(2.4, 3.2, 14);
      const trainMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
        metalness: 0.7,
      });
      const trainBody = new THREE.Mesh(trainGeo, trainMat);
      trainBody.position.y = 1.6;
      trainBody.castShadow = true;
      group.add(trainBody);

      // Train roof platform (where player can run!)
      const roofGeo = new THREE.BoxGeometry(2.35, 0.15, 13.8);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 3.25;
      group.add(roof);

      // Train front windshield & headlights
      const windshieldGeo = new THREE.BoxGeometry(2.1, 0.9, 0.3);
      const windshieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
      windshield.position.set(0, 2.2, 7.05);
      group.add(windshield);

      // Glowing neon side trim lines
      [-1.22, 1.22].forEach((x) => {
        const stripeGeo = new THREE.BoxGeometry(0.06, 0.15, 13.5);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(x, 1.5, 0);
        group.add(stripe);
      });
    } else if (type === 'RAMP') {
      // Incline ramp to run up onto trains
      const rampGeo = new THREE.BoxGeometry(2.2, 0.2, 6.5);
      const rampMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const ramp = new THREE.Mesh(rampGeo, rampMat);
      ramp.position.set(0, 1.5, 0);
      ramp.rotation.x = 0.45; // Incline
      ramp.castShadow = true;
      group.add(ramp);
    } else {
      // PILLAR: Solid high-tech blocker
      const pGeo = new THREE.BoxGeometry(1.8, 4.5, 1.4);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const pillar = new THREE.Mesh(pGeo, pMat);
      pillar.position.y = 2.25;
      pillar.castShadow = true;
      group.add(pillar);

      // Neon warning cross
      const crossGeo = new THREE.BoxGeometry(1.4, 0.25, 1.45);
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.y = 2.25;
      group.add(cross);
    }

    return group;
  }
}
