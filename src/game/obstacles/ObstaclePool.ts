import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../config/gameConfig';
import { ProceduralTextures } from '../textures/ProceduralTextures';

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

  // Reusable PBR Materials
  private hazardMat!: THREE.MeshStandardMaterial;
  private industrialMetalMat!: THREE.MeshStandardMaterial;
  private trainBodyMat!: THREE.MeshStandardMaterial;
  private cyanGlowMat!: THREE.MeshBasicMaterial;
  private redLaserMat!: THREE.MeshBasicMaterial;
  private yellowBeaconMat!: THREE.MeshBasicMaterial;
  private headlightMat!: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.initMaterials();
  }

  private initMaterials() {
    const chevronTex = ProceduralTextures.getHazardChevronTexture();

    this.hazardMat = new THREE.MeshStandardMaterial({
      map: chevronTex,
      roughness: 0.4,
      metalness: 0.3,
    });

    this.industrialMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8,
    });

    this.trainBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.85,
    });

    this.cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.redLaserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    this.yellowBeaconMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }

  public getObstacle(type: ObstacleType, lane: number, z: number, isMoving: boolean = false): ObstacleInstance {
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
        moveSpeed: isMoving ? 10 : 0,
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
    inst.moveSpeed = isMoving ? 12 : 0;
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

      // Despawn once behind player
      if (inst.z > playerZ + 25) {
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
      // 1. High-Tech Cyber Road Barrier
      const mainBarGeo = new THREE.BoxGeometry(2.35, 0.55, 0.22);
      const mainBar = new THREE.Mesh(mainBarGeo, this.hazardMat);
      mainBar.position.y = 0.5;
      mainBar.castShadow = true;
      group.add(mainBar);

      // Upper warning rail with flashing LED beacons
      const topRailGeo = new THREE.BoxGeometry(2.45, 0.12, 0.26);
      const topRail = new THREE.Mesh(topRailGeo, this.industrialMetalMat);
      topRail.position.y = 0.82;
      group.add(topRail);

      // Left & right amber beacon lights
      [-0.95, 0.95].forEach((x) => {
        const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.14, 10);
        const beacon = new THREE.Mesh(beaconGeo, this.yellowBeaconMat);
        beacon.position.set(x, 0.94, 0);
        group.add(beacon);
      });

      // Lower Laser Tripwire
      const laserGeo = new THREE.BoxGeometry(2.2, 0.06, 0.06);
      const laser = new THREE.Mesh(laserGeo, this.cyanGlowMat);
      laser.position.y = 0.15;
      group.add(laser);

      // Heavy Industrial Base Pylons
      [-0.95, 0.95].forEach((x) => {
        const pylonGeo = new THREE.BoxGeometry(0.24, 0.8, 0.35);
        const pylon = new THREE.Mesh(pylonGeo, this.industrialMetalMat);
        pylon.position.set(x, 0.4, 0);
        pylon.castShadow = true;
        group.add(pylon);
      });
    } else if (type === 'HIGH_BARRIER') {
      // 2. High-Voltage Laser Archway (Must Slide Under)
      // Overhead heavy frame
      const frameGeo = new THREE.BoxGeometry(2.5, 0.7, 0.45);
      const frame = new THREE.Mesh(frameGeo, this.industrialMetalMat);
      frame.position.y = 2.45;
      frame.castShadow = true;
      group.add(frame);

      // Digital Warning Sign on Frame
      const signGeo = new THREE.BoxGeometry(2.2, 0.35, 0.48);
      const signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.y = 2.45;
      group.add(sign);

      // Crackling Overhead Laser Barrier (Top hazard section)
      const laserGridGeo = new THREE.BoxGeometry(2.3, 0.5, 0.08);
      const laserGrid = new THREE.Mesh(laserGridGeo, this.redLaserMat);
      laserGrid.position.y = 1.95;
      group.add(laserGrid);

      // Side Support Towers
      [-1.18, 1.18].forEach((x) => {
        const towerGeo = new THREE.BoxGeometry(0.28, 2.8, 0.45);
        const tower = new THREE.Mesh(towerGeo, this.industrialMetalMat);
        tower.position.set(x, 1.4, 0);
        tower.castShadow = true;
        group.add(tower);

        // Tower LED neon strip
        const ledGeo = new THREE.BoxGeometry(0.06, 2.6, 0.48);
        const led = new THREE.Mesh(ledGeo, this.cyanGlowMat);
        led.position.set(x + (x > 0 ? -0.12 : 0.12), 1.4, 0);
        group.add(led);
      });
    } else if (type === 'TRAIN') {
      // 3. Futuristic Maglev Bullet Train
      const trainLen = 14.5;
      const trainWidth = 2.4;
      const trainHeight = 3.3;

      // Aerodynamic Train Body
      const bodyGeo = new THREE.BoxGeometry(trainWidth, trainHeight, trainLen);
      const trainBody = new THREE.Mesh(bodyGeo, this.trainBodyMat);
      trainBody.position.y = trainHeight / 2;
      trainBody.castShadow = true;
      trainBody.receiveShadow = true;
      group.add(trainBody);

      // Sloped Aerodynamic Nose on front (+Z facing oncoming player)
      const noseGeo = new THREE.ConeGeometry(1.6, 2.2, 4);
      noseGeo.rotateX(Math.PI / 2);
      noseGeo.rotateZ(Math.PI / 4);
      const nose = new THREE.Mesh(noseGeo, this.trainBodyMat);
      nose.position.set(0, 1.4, trainLen / 2 + 0.6);
      group.add(nose);

      // High-Intensity Dual LED Headlights
      [-0.7, 0.7].forEach((x) => {
        const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16);
        lightGeo.rotateX(Math.PI / 2);
        const light = new THREE.Mesh(lightGeo, this.headlightMat);
        light.position.set(x, 1.2, trainLen / 2 + 1.2);
        group.add(light);
      });

      // Illuminated Passenger Window Strip (Both sides)
      [-trainWidth / 2 - 0.02, trainWidth / 2 + 0.02].forEach((x) => {
        const winGeo = new THREE.BoxGeometry(0.04, 0.55, trainLen - 2);
        const win = new THREE.Mesh(winGeo, this.cyanGlowMat);
        win.position.set(x, 2.1, 0);
        group.add(win);
      });

      // Glowing Neon Lower Racing Stripe
      [-trainWidth / 2 - 0.02, trainWidth / 2 + 0.02].forEach((x) => {
        const stripeGeo = new THREE.BoxGeometry(0.04, 0.12, trainLen);
        const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshBasicMaterial({ color: 0xec4899 }));
        stripe.position.set(x, 0.7, 0);
        group.add(stripe);
      });

      // Rooftop Catwalk Platform (Where player runs!)
      const catwalkGeo = new THREE.BoxGeometry(trainWidth - 0.2, 0.12, trainLen - 0.2);
      const catwalk = new THREE.Mesh(catwalkGeo, this.hazardMat);
      catwalk.position.y = trainHeight + 0.06;
      group.add(catwalk);
    } else if (type === 'RAMP') {
      // 4. Incline Ramp with Directional Chevrons
      const rampGeo = new THREE.BoxGeometry(2.3, 0.2, 6.8);
      const ramp = new THREE.Mesh(rampGeo, this.hazardMat);
      ramp.position.set(0, 1.6, 0);
      ramp.rotation.x = 0.44; // Perfect slope
      ramp.castShadow = true;
      ramp.receiveShadow = true;
      group.add(ramp);

      // Glowing Cyan Side Rail Guides
      [-1.15, 1.15].forEach((x) => {
        const railGeo = new THREE.BoxGeometry(0.08, 0.2, 6.8);
        const rail = new THREE.Mesh(railGeo, this.cyanGlowMat);
        rail.position.set(x, 1.7, 0);
        rail.rotation.x = 0.44;
        group.add(rail);
      });
    } else {
      // 5. Heavy Security Pylon (PILLAR)
      const pylonGeo = new THREE.CylinderGeometry(0.9, 1.1, 4.6, 8);
      const pylon = new THREE.Mesh(pylonGeo, this.industrialMetalMat);
      pylon.position.y = 2.3;
      pylon.castShadow = true;
      group.add(pylon);

      // Pulsing Red Warning Band
      const bandGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.4, 8);
      const band = new THREE.Mesh(bandGeo, this.redLaserMat);
      band.position.y = 2.5;
      group.add(band);
    }

    return group;
  }
}
