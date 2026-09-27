import * as THREE from 'three';
import { Character, CharacterSkin } from '../../types/game';

export class PlayerModel {
  public group: THREE.Group;
  private torso!: THREE.Mesh;
  private head!: THREE.Mesh;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private jetpackGroup!: THREE.Group;
  private shieldSphere!: THREE.Mesh;
  private magnetRing!: THREE.Mesh;
  private thrusterFlames: THREE.Mesh[] = [];

  // Material references for skin updates
  private primaryMat!: THREE.MeshStandardMaterial;
  private secondaryMat!: THREE.MeshStandardMaterial;
  private accentMat!: THREE.MeshStandardMaterial;
  private glowMat!: THREE.MeshBasicMaterial;

  private runCycle: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.initMaterials();
    this.buildCharacter();
    this.buildAccessories();
  }

  private initMaterials() {
    this.primaryMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.3,
      metalness: 0.4,
    });
    this.secondaryMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    this.accentMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.8,
    });
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
  }

  public applySkin(character: Character, skinId?: string) {
    const activeSkin = character.skins.find((s) => s.id === (skinId || character.activeSkinId)) || character.skins[0];
    if (activeSkin && activeSkin.colorScheme) {
      this.primaryMat.color.set(activeSkin.colorScheme.primary);
      this.secondaryMat.color.set(activeSkin.colorScheme.secondary);
      this.accentMat.color.set(activeSkin.colorScheme.accent);
      this.glowMat.color.set(activeSkin.colorScheme.glow);
    }
  }

  private buildCharacter() {
    // Character root
    const bodyRoot = new THREE.Group();
    bodyRoot.name = 'bodyRoot';

    // Torso (Jacket & Cyber vest)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, this.primaryMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    bodyRoot.add(this.torso);

    // Torso chestplate / glowing core
    const coreGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const core = new THREE.Mesh(coreGeo, this.accentMat);
    core.position.set(0, 0.1, 0.24);
    this.torso.add(core);

    // Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, this.secondaryMat);
    neck.position.y = 0.5;
    this.torso.add(neck);

    const headGeo = new THREE.BoxGeometry(0.42, 0.46, 0.44);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 });
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 0.35;
    this.head.castShadow = true;
    neck.add(this.head);

    // Cyber Hair / Headgear
    const hairGeo = new THREE.BoxGeometry(0.46, 0.25, 0.48);
    const hair = new THREE.Mesh(hairGeo, this.secondaryMat);
    hair.position.set(0, 0.18, -0.02);
    this.head.add(hair);

    // Cyber Visor / Glasses
    const visorGeo = new THREE.BoxGeometry(0.38, 0.12, 0.1);
    const visor = new THREE.Mesh(visorGeo, this.glowMat);
    visor.position.set(0, 0.05, 0.23);
    this.head.add(visor);

    // Shoulders & Arms
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 0.35, 0);
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.22);
    const leftArmMesh = new THREE.Mesh(armGeo, this.primaryMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.torso.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 0.35, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, this.primaryMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.torso.add(this.rightArm);

    // Legs
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.9, 0);
    const legGeo = new THREE.BoxGeometry(0.24, 0.85, 0.26);
    const leftLegMesh = new THREE.Mesh(legGeo, this.secondaryMat);
    leftLegMesh.position.y = -0.42;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    // Shoe
    const shoeGeo = new THREE.BoxGeometry(0.26, 0.18, 0.42);
    const leftShoe = new THREE.Mesh(shoeGeo, this.accentMat);
    leftShoe.position.set(0, -0.8, 0.08);
    this.leftLeg.add(leftShoe);
    bodyRoot.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.9, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, this.secondaryMat);
    rightLegMesh.position.y = -0.42;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    // Shoe
    const rightShoe = new THREE.Mesh(shoeGeo, this.accentMat);
    rightShoe.position.set(0, -0.8, 0.08);
    this.rightLeg.add(rightShoe);
    bodyRoot.add(this.rightLeg);

    this.group.add(bodyRoot);
  }

  private buildAccessories() {
    // Jetpack on back
    this.jetpackGroup = new THREE.Group();
    this.jetpackGroup.position.set(0, 0, -0.32);

    const packGeo = new THREE.BoxGeometry(0.5, 0.55, 0.22);
    const packMesh = new THREE.Mesh(packGeo, this.secondaryMat);
    this.jetpackGroup.add(packMesh);

    // Thruster nozzles
    [-0.16, 0.16].forEach((x) => {
      const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.2, 8);
      const nozzle = new THREE.Mesh(nozzleGeo, this.accentMat);
      nozzle.position.set(x, -0.32, 0);
      this.jetpackGroup.add(nozzle);

      // Flame
      const flameGeo = new THREE.ConeGeometry(0.1, 0.45, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.x = Math.PI;
      flame.position.set(x, -0.55, 0);
      flame.visible = false;
      this.thrusterFlames.push(flame);
      this.jetpackGroup.add(flame);
    });

    this.jetpackGroup.visible = false;
    this.torso.add(this.jetpackGroup);

    // Shield Forcefield Bubble
    const shieldGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    this.shieldSphere = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldSphere.position.y = 1.2;
    this.shieldSphere.visible = false;
    this.group.add(this.shieldSphere);

    // Magnet Pulsing Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    this.magnetRing = new THREE.Mesh(ringGeo, ringMat);
    this.magnetRing.rotation.x = -Math.PI / 2;
    this.magnetRing.position.y = 0.1;
    this.magnetRing.visible = false;
    this.group.add(this.magnetRing);
  }

  public updateAnimation(
    delta: number,
    state: {
      isGrounded: boolean;
      isJumping: boolean;
      isSliding: boolean;
      speed: number;
      hasShield: boolean;
      hasMagnet: boolean;
      hasJetpack: boolean;
      laneTilt: number;
    }
  ) {
    // Update power-up visual accessories
    this.shieldSphere.visible = state.hasShield;
    if (state.hasShield) {
      this.shieldSphere.rotation.y += delta * 2;
      this.shieldSphere.rotation.x += delta * 1.5;
    }

    this.magnetRing.visible = state.hasMagnet;
    if (state.hasMagnet) {
      this.magnetRing.rotation.z += delta * 3;
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      this.magnetRing.scale.set(pulse, pulse, pulse);
    }

    this.jetpackGroup.visible = state.hasJetpack;
    this.thrusterFlames.forEach((flame) => {
      flame.visible = state.hasJetpack;
      if (state.hasJetpack) {
        const flicker = 0.8 + Math.random() * 0.4;
        flame.scale.set(flicker, flicker, flicker);
      }
    });

    // Character rotation & banking tilt
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, -state.laneTilt * 0.25, delta * 12);

    if (state.isSliding) {
      // Slide Crouch pose: crouch torso back, legs extended forward, height reduced
      this.torso.position.y = 0.6;
      this.torso.rotation.x = -0.55;
      this.leftLeg.position.y = 0.35;
      this.rightLeg.position.y = 0.35;
      this.leftLeg.rotation.x = -1.2;
      this.rightLeg.rotation.x = -1.1;
      this.leftArm.rotation.x = 0.6;
      this.rightArm.rotation.x = 0.6;
    } else if (state.isJumping || state.hasJetpack) {
      // Jump / Fly Pose
      this.torso.position.y = 1.35;
      this.torso.rotation.x = 0.15;
      this.leftArm.rotation.x = -2.2;
      this.rightArm.rotation.x = -2.2;
      this.leftLeg.rotation.x = 0.6;
      this.rightLeg.rotation.x = 0.3;
    } else {
      // Standard running animation cycle
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.runCycle * 2)) * 0.08;
      this.torso.rotation.x = 0.12; // forward lean

      this.runCycle += delta * (state.speed * 0.65);

      const armAngle = Math.sin(this.runCycle) * 0.85;
      const legAngle = Math.sin(this.runCycle) * 0.95;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      this.leftLeg.position.y = 0.9;
      this.rightLeg.position.y = 0.9;
      this.leftLeg.rotation.x = -legAngle;
      this.rightLeg.rotation.x = legAngle;
    }
  }
}
