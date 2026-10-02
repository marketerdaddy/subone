import * as THREE from 'three';
import { Character } from '../../types/game';

export interface PlayerAnimationState {
  isGrounded: boolean;
  isJumping: boolean;
  isSliding: boolean;
  speed: number;
  hasShield?: boolean;
  hasMagnet?: boolean;
  hasJetpack?: boolean;
  laneTilt?: number;
  isIdle?: boolean;
}

/**
 * AAA Cinematic Sci-Fi Cyber Runner 3D Player Model
 * Engineered with human 7.5-head anatomical athletic runner proportions:
 * - Swept-back aerodynamic stealth helmet with luminous wrap-around cyber visor & rebreather jaw
 * - Form-fitting graphite techwear suit with dual-chevron pectoral armor & sternum conduit
 * - Low-profile faceted deltoid pauldrons and articulated forearm bracers with runner gloves
 * - Muscular runner thighs with kinetic exoskeleton struts and articulated knee guards
 * - Futuristic high-top sprint sneakers with carbon-fiber midsole and luminescent cyan treads
 */
export class PlayerModel {
  public group: THREE.Group;

  // Root & Articulated Kinematic Skeleton
  private rootGroup!: THREE.Group;
  private pelvis!: THREE.Group;
  private torso!: THREE.Group;
  private chest!: THREE.Group;
  private headGroup!: THREE.Group;
  private helmet!: THREE.Group;
  private visor!: THREE.Mesh;
  private visorHud!: THREE.Mesh;
  private spineExo!: THREE.Group;

  // Limbs
  private leftUpperArm!: THREE.Group;
  private leftForearmGroup!: THREE.Group;
  private leftHand!: THREE.Group;

  private rightUpperArm!: THREE.Group;
  private rightForearmGroup!: THREE.Group;
  private rightHand!: THREE.Group;

  private leftThigh!: THREE.Group;
  private leftCalfGroup!: THREE.Group;
  private leftFootGroup!: THREE.Group;
  private leftShoeGlow!: THREE.Mesh;

  private rightThigh!: THREE.Group;
  private rightCalfGroup!: THREE.Group;
  private rightFootGroup!: THREE.Group;
  private rightShoeGlow!: THREE.Mesh;

  // Equipment & FX
  private thrusterFlames: THREE.Mesh[] = [];
  private shieldSphere!: THREE.Mesh;
  private magnetRings: THREE.Mesh[] = [];

  // PBR Physical Materials
  private fabricMat!: THREE.MeshStandardMaterial;
  private armorMat!: THREE.MeshStandardMaterial;
  private accentMat!: THREE.MeshStandardMaterial;
  private metalMat!: THREE.MeshStandardMaterial;
  private visorMat!: THREE.MeshStandardMaterial;
  private glowMat!: THREE.MeshBasicMaterial;
  private goldAccentMat!: THREE.MeshStandardMaterial;
  private rubberMat!: THREE.MeshStandardMaterial;

  // Animation Timers & State
  private animTime: number = 0;
  private idleTime: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.initMaterials();
    this.buildCharacterHierarchy();
    this.buildEquipmentAndAuras();
  }

  private initMaterials() {
    // 1. Matte Athletic Techwear Fabric (Deep Charcoal / Graphite)
    this.fabricMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f17,
      roughness: 0.85,
      metalness: 0.12,
    });

    // 2. Primary Alloy Armor (Brushed Stealth Titanium)
    this.armorMat = new THREE.MeshStandardMaterial({
      color: 0x162032,
      roughness: 0.32,
      metalness: 0.84,
    });

    // 3. Secondary Trim / Accent Armor (Tinted per character)
    this.accentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cool cyan-tinted stealth blue
      roughness: 0.28,
      metalness: 0.88,
    });

    // 4. Dark Tungsten Structural Hardware
    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0x222c3d,
      roughness: 0.20,
      metalness: 0.94,
    });

    // 5. Polarized Cyber Glass Visor with Luminous Cyan Horizon
    this.visorMat = new THREE.MeshStandardMaterial({
      color: 0x011324,
      roughness: 0.06,
      metalness: 0.94,
      emissive: 0x00d8ff,
      emissiveIntensity: 0.42,
    });

    // 6. Restrained Cyan Neon Emissive Telemetry
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });

    // 7. Brushed Warm Amber Gold Accents
    this.goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.24,
      metalness: 0.88,
    });

    // 8. High-Traction Carbon Rubber
    this.rubberMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      roughness: 0.94,
      metalness: 0.05,
    });
  }

  public applySkin(character: Character, skinId?: string) {
    const activeSkin =
      character.skins.find((s) => s.id === (skinId || character.activeSkinId)) || character.skins[0];
    if (activeSkin && activeSkin.colorScheme) {
      // Sophisticated color application: preserve graphite base and alloy armor,
      // tint the accent plates and emissive glow gracefully
      const primaryColor = new THREE.Color(activeSkin.colorScheme.primary);
      const glowColor = new THREE.Color(activeSkin.colorScheme.glow || '#00f0ff');

      // Toned down armor accent for premium aesthetic
      this.accentMat.color.copy(primaryColor).lerp(new THREE.Color(0x162032), 0.35);
      this.glowMat.color.copy(glowColor);
      this.visorMat.emissive.copy(glowColor).multiplyScalar(0.45);

      if (this.leftShoeGlow && this.rightShoeGlow) {
        this.leftShoeGlow.material = this.glowMat;
        this.rightShoeGlow.material = this.glowMat;
      }
    }
  }

  private buildCharacterHierarchy() {
    this.rootGroup = new THREE.Group();
    this.group.add(this.rootGroup);

    // ====================================================
    // 1. PELVIS & WAIST (Center of Mass at Y=0.94m)
    // ====================================================
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.94;
    this.rootGroup.add(this.pelvis);

    // Tapered anatomical pelvis (athletic runner hip girdle)
    const pelvisGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.19, 18);
    pelvisGeo.scale(1.18, 1.0, 0.85);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.fabricMat);
    pelvisMesh.castShadow = true;
    this.pelvis.add(pelvisMesh);

    // Tactical utility belt with metallic buckle and LED status line
    const beltGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.045, 18);
    beltGeo.scale(1.20, 1.0, 0.88);
    const belt = new THREE.Mesh(beltGeo, this.metalMat);
    belt.position.y = 0.07;
    this.pelvis.add(belt);

    // Belt buckle
    const buckleGeo = new THREE.BoxGeometry(0.065, 0.04, 0.025);
    const buckle = new THREE.Mesh(buckleGeo, this.goldAccentMat);
    buckle.position.set(0, 0.07, 0.165);
    this.pelvis.add(buckle);

    // Buckle cyan diode
    const diodeGeo = new THREE.BoxGeometry(0.02, 0.015, 0.01);
    const diode = new THREE.Mesh(diodeGeo, this.glowMat);
    diode.position.set(0, 0.07, 0.178);
    this.pelvis.add(diode);

    // Twin low-profile magnetic side pouches
    [-0.19, 0.19].forEach((px) => {
      const pouchGeo = new THREE.BoxGeometry(0.045, 0.06, 0.075);
      const pouch = new THREE.Mesh(pouchGeo, this.armorMat);
      pouch.position.set(px, 0.05, 0);
      this.pelvis.add(pouch);
    });

    // ====================================================
    // 2. TORSO & CHEST (Athletic V-Taper)
    // ====================================================
    this.torso = new THREE.Group();
    this.torso.position.y = 0.09;
    this.pelvis.add(this.torso);

    // Flexible lower abdomen with segmented athletic ribs
    const abCoreGeo = new THREE.CylinderGeometry(0.18, 0.165, 0.22, 16);
    abCoreGeo.scale(1.15, 1.0, 0.85);
    const abCore = new THREE.Mesh(abCoreGeo, this.fabricMat);
    abCore.position.y = 0.11;
    this.torso.add(abCore);

    // Segmented flexible abdominal armor plates (3 tiers)
    for (let i = 0; i < 3; i++) {
      const w = 0.13 - i * 0.012;
      const abPlateGeo = new THREE.BoxGeometry(w, 0.038, 0.025);
      const abPlate = new THREE.Mesh(abPlateGeo, this.armorMat);
      abPlate.position.set(0, 0.055 + i * 0.052, 0.15);
      abPlate.rotation.x = -0.08;
      this.torso.add(abPlate);
    }

    // Chest assembly (V-taper pectorals & shoulders)
    this.chest = new THREE.Group();
    this.chest.position.y = 0.26;
    this.torso.add(this.chest);

    // Pectoral ribcage block
    const ribcageGeo = new THREE.CylinderGeometry(0.23, 0.185, 0.28, 16);
    ribcageGeo.scale(1.24, 1.0, 0.86);
    const ribcage = new THREE.Mesh(ribcageGeo, this.fabricMat);
    ribcage.position.y = 0.13;
    ribcage.castShadow = true;
    this.chest.add(ribcage);

    // Dual-chevron ballistic pectoral armor plates (Left & Right)
    [-0.095, 0.095].forEach((cx, idx) => {
      const pecGeo = new THREE.BoxGeometry(0.145, 0.17, 0.045);
      const pec = new THREE.Mesh(pecGeo, this.armorMat);
      pec.position.set(cx, 0.16, 0.135);
      pec.rotation.y = idx === 0 ? 0.14 : -0.14;
      pec.rotation.x = -0.12;
      pec.castShadow = true;
      this.chest.add(pec);

      // Angled accent trim on outer chest plate
      const trimGeo = new THREE.BoxGeometry(0.025, 0.15, 0.018);
      const trim = new THREE.Mesh(trimGeo, this.accentMat);
      trim.position.set(cx + (idx === 0 ? -0.05 : 0.05), 0.16, 0.155);
      this.chest.add(trim);
    });

    // Sleek recessed cyan telemetry sternum line (AAA high-tech conduit, not a toy circle)
    const sternumGeo = new THREE.BoxGeometry(0.014, 0.19, 0.018);
    const sternum = new THREE.Mesh(sternumGeo, this.glowMat);
    sternum.position.set(0, 0.155, 0.152);
    this.chest.add(sternum);

    // Articulated spinal exoskeleton on back
    this.spineExo = new THREE.Group();
    this.chest.add(this.spineExo);
    for (let s = 0; s < 5; s++) {
      const vertGeo = new THREE.BoxGeometry(0.055, 0.035, 0.04);
      const vert = new THREE.Mesh(vertGeo, this.metalMat);
      vert.position.set(0, 0.24 - s * 0.065, -0.135);
      this.spineExo.add(vert);
    }

    // Low-profile twin micro-thruster vector cowlings on upper back
    [-0.10, 0.10].forEach((tx) => {
      const nozzleGeo = new THREE.CylinderGeometry(0.025, 0.038, 0.12, 12);
      const nozzle = new THREE.Mesh(nozzleGeo, this.metalMat);
      nozzle.position.set(tx, 0.16, -0.155);
      nozzle.rotation.x = -0.22;
      this.chest.add(nozzle);

      // Jet exhaust particle flame (cyan pulse during sprint/jump)
      const flameGeo = new THREE.ConeGeometry(0.032, 0.26, 10);
      flameGeo.rotateX(Math.PI);
      const flame = new THREE.Mesh(flameGeo, this.glowMat);
      flame.position.set(tx, 0.06, -0.185);
      flame.visible = false;
      this.chest.add(flame);
      this.thrusterFlames.push(flame);
    });

    // ====================================================
    // 3. AERODYNAMIC CYBER HELMET & FACETED VISOR
    // ====================================================
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.31, 0);
    this.chest.add(this.headGroup);

    // Ballistic high-collar neck cowl
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.088, 0.11, 14);
    const neck = new THREE.Mesh(neckGeo, this.fabricMat);
    neck.position.y = 0.045;
    this.headGroup.add(neck);

    // Helmet assembly
    this.helmet = new THREE.Group();
    this.helmet.position.set(0, 0.155, 0.015);
    this.headGroup.add(this.helmet);

    // Aerodynamic swept-back cranium shell (chiseled speed runner silhouette)
    const domeGeo = new THREE.SphereGeometry(0.138, 24, 20);
    domeGeo.scale(1.0, 1.12, 1.25);
    const dome = new THREE.Mesh(domeGeo, this.armorMat);
    dome.castShadow = true;
    this.helmet.add(dome);

    // Faceted temporal shell plates (Left & Right)
    [-0.125, 0.125].forEach((hx, idx) => {
      const plateGeo = new THREE.BoxGeometry(0.03, 0.14, 0.18);
      const plate = new THREE.Mesh(plateGeo, this.metalMat);
      plate.position.set(hx, 0.02, -0.01);
      plate.rotation.y = idx === 0 ? 0.08 : -0.08;
      this.helmet.add(plate);

      // Low-profile flush temple comms disc
      const commGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.01, 14);
      commGeo.rotateZ(Math.PI / 2);
      const comm = new THREE.Mesh(commGeo, this.goldAccentMat);
      comm.position.set(hx * 1.12, 0.02, 0.01);
      this.helmet.add(comm);
    });

    // Armored rebreather jaw & chin guard (stealth operative chin)
    const jawGeo = new THREE.BoxGeometry(0.11, 0.08, 0.11);
    const jaw = new THREE.Mesh(jawGeo, this.armorMat);
    jaw.position.set(0, -0.065, 0.085);
    jaw.rotation.x = 0.28;
    jaw.castShadow = true;
    this.helmet.add(jaw);

    // Dual intake vents on rebreather jaw
    [-0.032, 0.032].forEach((vx) => {
      const ventGeo = new THREE.BoxGeometry(0.022, 0.014, 0.015);
      const vent = new THREE.Mesh(ventGeo, this.metalMat);
      vent.position.set(vx, -0.062, 0.138);
      vent.rotation.x = 0.28;
      this.helmet.add(vent);
    });

    // Swept High-Gloss Polarized Cyber Visor (Dominant, unmistakable sci-fi visor)
    const visorGeo = new THREE.CylinderGeometry(0.142, 0.142, 0.082, 24, 1, false, -Math.PI * 0.40, Math.PI * 0.80);
    this.visor = new THREE.Mesh(visorGeo, this.visorMat);
    this.visor.position.set(0, 0.02, 0.035);
    this.helmet.add(this.visor);

    // Luminous cyan HUD horizon beam across center of visor
    const visorHudGeo = new THREE.CylinderGeometry(0.144, 0.144, 0.010, 24, 1, false, -Math.PI * 0.32, Math.PI * 0.64);
    this.visorHud = new THREE.Mesh(visorHudGeo, this.glowMat);
    this.visorHud.position.set(0, 0.02, 0.035);
    this.helmet.add(this.visorHud);

    // Aerodynamic crown crest / airflow channeled fin
    const finGeo = new THREE.BoxGeometry(0.02, 0.038, 0.22);
    const fin = new THREE.Mesh(finGeo, this.accentMat);
    fin.position.set(0, 0.148, -0.02);
    fin.rotation.x = -0.16;
    this.helmet.add(fin);

    // ====================================================
    // 4. ARTICULATED SHOULDERS & CONTOURED ARMS
    // ====================================================
    this.leftUpperArm = this.buildArmSide(-1);
    this.chest.add(this.leftUpperArm);

    this.rightUpperArm = this.buildArmSide(1);
    this.chest.add(this.rightUpperArm);

    // ====================================================
    // 5. ATHLETIC HIPS, LEGS & FUTURISTIC SPRINT SNEAKERS
    // ====================================================
    this.leftThigh = this.buildLegSide(-1);
    this.pelvis.add(this.leftThigh);

    this.rightThigh = this.buildLegSide(1);
    this.pelvis.add(this.rightThigh);
  }

  private buildArmSide(side: -1 | 1): THREE.Group {
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(side * 0.24, 0.22, 0);

    // Faceted composite stealth pauldron (low-profile deltoid armor)
    const pauldronGeo = new THREE.BoxGeometry(0.12, 0.08, 0.13);
    const pauldron = new THREE.Mesh(pauldronGeo, this.armorMat);
    pauldron.position.set(side * 0.03, 0.02, 0);
    pauldron.rotation.z = side * -0.18;
    pauldron.castShadow = true;
    shoulderGroup.add(pauldron);

    // Pauldron accent bevel
    const pTrimGeo = new THREE.BoxGeometry(0.025, 0.07, 0.12);
    const pTrim = new THREE.Mesh(pTrimGeo, this.accentMat);
    pTrim.position.set(side * 0.085, 0.015, 0);
    shoulderGroup.add(pTrim);

    // Bicep compression techwear sleeve
    const bicepGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.24, 14);
    const bicep = new THREE.Mesh(bicepGeo, this.fabricMat);
    bicep.position.set(side * 0.01, -0.13, 0);
    bicep.castShadow = true;
    shoulderGroup.add(bicep);

    // Forearm Group (Hinged at elbow Y=-0.24m)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(side * 0.01, -0.24, 0);
    shoulderGroup.add(forearmGroup);

    if (side === -1) this.leftForearmGroup = forearmGroup;
    else this.rightForearmGroup = forearmGroup;

    // Articulated elbow guard
    const elbowGeo = new THREE.BoxGeometry(0.065, 0.055, 0.05);
    const elbow = new THREE.Mesh(elbowGeo, this.metalMat);
    elbow.position.set(0, 0, -0.035);
    forearmGroup.add(elbow);

    // Tapered ballistic gauntlet / bracer
    const gauntletGeo = new THREE.CylinderGeometry(0.058, 0.046, 0.22, 14);
    const gauntlet = new THREE.Mesh(gauntletGeo, this.armorMat);
    gauntlet.position.y = -0.11;
    gauntlet.castShadow = true;
    forearmGroup.add(gauntlet);

    // Holographic telemetry rail along forearm
    const railGeo = new THREE.BoxGeometry(0.015, 0.18, 0.015);
    const rail = new THREE.Mesh(railGeo, this.glowMat);
    rail.position.set(side * 0.048, -0.11, 0.03);
    forearmGroup.add(rail);

    // Sculpted Tactical Runner Glove with articulated sprint grip
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.23, 0);
    forearmGroup.add(handGroup);

    if (side === -1) this.leftHand = handGroup;
    else this.rightHand = handGroup;

    // Palm & Knuckle Guard
    const palmGeo = new THREE.BoxGeometry(0.065, 0.075, 0.042);
    const palm = new THREE.Mesh(palmGeo, this.rubberMat);
    palm.position.y = -0.03;
    handGroup.add(palm);

    const knuckleGeo = new THREE.BoxGeometry(0.06, 0.02, 0.028);
    const knuckle = new THREE.Mesh(knuckleGeo, this.metalMat);
    knuckle.position.set(0, -0.028, 0.022);
    handGroup.add(knuckle);

    // Articulated fingers in athletic sprint grip
    const fingersGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.06, 8);
    const fingers = new THREE.Mesh(fingersGeo, this.rubberMat);
    fingers.position.set(0, -0.08, 0.01);
    fingers.rotation.x = 0.32;
    handGroup.add(fingers);

    return shoulderGroup;
  }

  private buildLegSide(side: -1 | 1): THREE.Group {
    const thighGroup = new THREE.Group();
    thighGroup.position.set(side * 0.115, -0.09, 0);

    // Muscular runner quadriceps / thigh with compression weave
    const thighGeo = new THREE.CylinderGeometry(0.098, 0.075, 0.40, 16);
    const thigh = new THREE.Mesh(thighGeo, this.fabricMat);
    thigh.position.y = -0.20;
    thigh.castShadow = true;
    thighGroup.add(thigh);

    // Lateral kinetic exoskeleton reinforcement strut
    const strutGeo = new THREE.BoxGeometry(0.018, 0.30, 0.03);
    const strut = new THREE.Mesh(strutGeo, this.metalMat);
    strut.position.set(side * 0.088, -0.20, 0);
    thighGroup.add(strut);

    // Knee & Calf Assembly (Hinged at knee Y=-0.40m)
    const calfGroup = new THREE.Group();
    calfGroup.position.set(0, -0.40, 0);
    thighGroup.add(calfGroup);

    if (side === -1) this.leftCalfGroup = calfGroup;
    else this.rightCalfGroup = calfGroup;

    // Articulated dual-tier knee armor guard
    const kneeGeo = new THREE.BoxGeometry(0.095, 0.095, 0.085);
    const knee = new THREE.Mesh(kneeGeo, this.armorMat);
    knee.position.set(0, 0, 0.05);
    knee.castShadow = true;
    calfGroup.add(knee);

    // Knee cyan micro-status LED
    const kneeLedGeo = new THREE.BoxGeometry(0.015, 0.04, 0.01);
    const kneeLed = new THREE.Mesh(kneeLedGeo, this.glowMat);
    kneeLed.position.set(0, 0, 0.095);
    calfGroup.add(kneeLed);

    // Aerodynamic tapered calf & anterior shin guard
    const calfGeo = new THREE.CylinderGeometry(0.072, 0.055, 0.36, 14);
    const calf = new THREE.Mesh(calfGeo, this.fabricMat);
    calf.position.y = -0.18;
    calf.castShadow = true;
    calfGroup.add(calf);

    const shinPlateGeo = new THREE.BoxGeometry(0.072, 0.28, 0.038);
    const shinPlate = new THREE.Mesh(shinPlateGeo, this.metalMat);
    shinPlate.position.set(0, -0.16, 0.05);
    shinPlate.castShadow = true;
    calfGroup.add(shinPlate);

    // ====================================================
    // FUTURISTIC HIGH-TOP SPRINT SNEAKER
    // ====================================================
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.36, 0.02);
    calfGroup.add(footGroup);

    if (side === -1) this.leftFootGroup = footGroup;
    else this.rightFootGroup = footGroup;

    // High-performance athletic shoe upper
    const upperGeo = new THREE.BoxGeometry(0.10, 0.09, 0.23);
    const upper = new THREE.Mesh(upperGeo, this.fabricMat);
    upper.position.set(0, 0.035, 0.025);
    upper.castShadow = true;
    footGroup.add(upper);

    // Aerodynamic upturned sprint toe box
    const toeGeo = new THREE.BoxGeometry(0.098, 0.06, 0.09);
    const toe = new THREE.Mesh(toeGeo, this.armorMat);
    toe.position.set(0, 0.025, 0.14);
    toe.rotation.x = -0.16;
    footGroup.add(toe);

    // Carbon-fiber midsole wedge
    const soleGeo = new THREE.BoxGeometry(0.112, 0.038, 0.27);
    const sole = new THREE.Mesh(soleGeo, this.metalMat);
    sole.position.set(0, -0.024, 0.045);
    footGroup.add(sole);

    // Luminescent cyan sprint energy pods in sole
    const glowSoleGeo = new THREE.BoxGeometry(0.115, 0.012, 0.25);
    const glowSole = new THREE.Mesh(glowSoleGeo, this.glowMat);
    glowSole.position.set(0, -0.018, 0.045);
    footGroup.add(glowSole);

    if (side === -1) this.leftShoeGlow = glowSole;
    else this.rightShoeGlow = glowSole;

    // High-traction vulcanized black rubber outsole
    const outsoleGeo = new THREE.BoxGeometry(0.114, 0.018, 0.272);
    const outsole = new THREE.Mesh(outsoleGeo, this.rubberMat);
    outsole.position.set(0, -0.045, 0.045);
    footGroup.add(outsole);

    return thighGroup;
  }

  private buildEquipmentAndAuras() {
    // 1. Force Shield Holographic Energy Bubble
    const shieldGeo = new THREE.SphereGeometry(1.25, 24, 20);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.2,
      wireframe: true,
    });
    this.shieldSphere = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldSphere.position.y = 0.94;
    this.shieldSphere.visible = false;
    this.group.add(this.shieldSphere);

    // 2. Dual Concentric Coin Magnet Auras
    for (let r = 0; r < 2; r++) {
      const ringGeo = new THREE.TorusGeometry(0.85 + r * 0.25, 0.015, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.98;
      ring.visible = false;
      this.group.add(ring);
      this.magnetRings.push(ring);
    }
  }

  public updateAnimation(delta: number, state: PlayerAnimationState) {
    const { isGrounded, isJumping, isSliding, speed, hasShield, hasMagnet, hasJetpack, laneTilt, isIdle } = state;

    // ----------------------------------------------------
    // 1. SLIDE KINEMATICS (Low aerodynamic sweep)
    // ----------------------------------------------------
    if (isSliding) {
      this.rootGroup.position.y = THREE.MathUtils.lerp(this.rootGroup.position.y, -0.38, delta * 16);
      this.rootGroup.rotation.x = THREE.MathUtils.lerp(this.rootGroup.rotation.x, -0.62, delta * 16);

      // Slide limb compression
      this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, -1.25, delta * 16);
      this.leftCalfGroup.rotation.x = THREE.MathUtils.lerp(this.leftCalfGroup.rotation.x, 1.65, delta * 16);
      this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, 0.65, delta * 16);
      this.rightCalfGroup.rotation.x = THREE.MathUtils.lerp(this.rightCalfGroup.rotation.x, 0.25, delta * 16);

      this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, 0.85, delta * 16);
      this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -1.15, delta * 16);

      this.thrusterFlames.forEach((flame) => (flame.visible = false));
      return;
    }

    // Reset slide offsets
    this.rootGroup.position.y = THREE.MathUtils.lerp(this.rootGroup.position.y, 0, delta * 14);
    this.rootGroup.rotation.x = THREE.MathUtils.lerp(this.rootGroup.rotation.x, 0, delta * 14);

    // ----------------------------------------------------
    // 2. JUMP & JETPACK TUCK
    // ----------------------------------------------------
    if (isJumping || !isGrounded) {
      this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, -0.80, delta * 14);
      this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, 0.40, delta * 14);
      this.leftCalfGroup.rotation.x = THREE.MathUtils.lerp(this.leftCalfGroup.rotation.x, 1.20, delta * 14);
      this.rightCalfGroup.rotation.x = THREE.MathUtils.lerp(this.rightCalfGroup.rotation.x, 0.90, delta * 14);

      this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, -1.45, delta * 14);
      this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -1.45, delta * 14);
      this.leftForearmGroup.rotation.x = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.x, 0.75, delta * 14);
      this.rightForearmGroup.rotation.x = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.x, 0.75, delta * 14);

      this.thrusterFlames.forEach((flame) => {
        flame.scale.y = (hasJetpack ? 2.4 : 1.3) + Math.random() * 0.4;
        flame.visible = true;
      });
      return;
    }

    // ----------------------------------------------------
    // 3. IDLE PRESENTATION MODE (Showcase & Main Menu Heroic Stance)
    // ----------------------------------------------------
    if (isIdle || speed === 0) {
      this.idleTime += delta * 1.8;

      // Realistic thoracic breathing cycle
      const breath = Math.sin(this.idleTime);
      this.chest.scale.set(1 + breath * 0.012, 1 + breath * 0.010, 1 + breath * 0.016);
      this.chest.position.y = 0.26 + breath * 0.005;

      // Confident athletic stance (natural runner ready-pose)
      this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, 0.06, delta * 6);
      this.leftThigh.rotation.z = THREE.MathUtils.lerp(this.leftThigh.rotation.z, -0.07, delta * 6);
      this.leftCalfGroup.rotation.x = THREE.MathUtils.lerp(this.leftCalfGroup.rotation.x, 0.04, delta * 6);

      this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, -0.10, delta * 6);
      this.rightThigh.rotation.z = THREE.MathUtils.lerp(this.rightThigh.rotation.z, 0.07, delta * 6);
      this.rightCalfGroup.rotation.x = THREE.MathUtils.lerp(this.rightCalfGroup.rotation.x, 0.12, delta * 6);

      // Heroic athletic arms: elbows bent ~35-40 degrees, runner hands held forward
      this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, 0.16 + breath * 0.02, delta * 6);
      this.leftUpperArm.rotation.z = THREE.MathUtils.lerp(this.leftUpperArm.rotation.z, -0.16, delta * 6);
      this.leftForearmGroup.rotation.x = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.x, 0.58, delta * 6);

      this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -0.08 + breath * 0.02, delta * 6);
      this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, 0.20, delta * 6);
      this.rightForearmGroup.rotation.x = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.x, 0.65, delta * 6);

      // Subtle heroic head awareness glance
      this.headGroup.rotation.y = Math.sin(this.idleTime * 0.35) * 0.07;
      this.headGroup.rotation.x = -0.02 + Math.sin(this.idleTime * 0.5) * 0.02;

      this.thrusterFlames.forEach((flame) => (flame.visible = false));
      return;
    }

    // ----------------------------------------------------
    // 4. ORGANIC RUN CYCLE (Athletic High-Velocity Sprint)
    // ----------------------------------------------------
    const runFreq = speed * 0.52;
    this.animTime += delta * runFreq;

    const legAngle = Math.sin(this.animTime) * 0.86;
    const armAngle = -legAngle * 0.80;

    // Athletic forward pelvic lean proportional to velocity
    const sprintLean = Math.min(0.22, 0.08 + (speed / 70) * 0.14);
    this.torso.rotation.x = sprintLean;

    // Organic leg cycles with dynamic knee recovery bend
    this.leftThigh.rotation.x = legAngle;
    this.rightThigh.rotation.x = -legAngle;
    this.leftCalfGroup.rotation.x = legAngle < 0 ? Math.abs(legAngle) * 1.30 : 0.10;
    this.rightCalfGroup.rotation.x = -legAngle < 0 ? Math.abs(-legAngle) * 1.30 : 0.10;

    // Arm swing with synchronized elbow drive
    this.leftUpperArm.rotation.x = armAngle;
    this.rightUpperArm.rotation.x = -armAngle;
    this.leftForearmGroup.rotation.x = 0.50 + Math.abs(Math.sin(this.animTime)) * 0.22;
    this.rightForearmGroup.rotation.x = 0.50 + Math.abs(Math.cos(this.animTime)) * 0.22;

    // Natural vertical center-of-mass bobbing & hip sway
    this.torso.position.y = 0.09 + Math.abs(Math.sin(this.animTime * 2)) * 0.06;
    this.torso.rotation.y = Math.sin(this.animTime) * 0.07;
    this.torso.rotation.z = Math.sin(this.animTime) * 0.03;

    // Dynamic Banking Tilt on Lane Switch
    if (laneTilt !== undefined) {
      this.setBankingTilt(laneTilt);
    }

    // High-speed thruster exhaust pulses
    this.thrusterFlames.forEach((flame) => {
      flame.scale.y = 0.8 + Math.random() * 0.4;
      flame.visible = speed > 35;
    });

    // ----------------------------------------------------
    // 5. POWER-UP AURAS ANIMATION
    // ----------------------------------------------------
    if (hasShield) {
      this.shieldSphere.visible = true;
      this.shieldSphere.rotation.y += delta * 1.8;
      this.shieldSphere.rotation.x += delta * 0.9;
    } else {
      this.shieldSphere.visible = false;
    }

    if (hasMagnet) {
      this.magnetRings.forEach((r) => (r.visible = true));
      this.magnetRings[0].rotation.z += delta * 3.5;
      this.magnetRings[1].rotation.x += delta * 2.8;
    } else {
      this.magnetRings.forEach((r) => (r.visible = false));
    }
  }

  public setShieldActive(active: boolean) {
    this.shieldSphere.visible = active;
  }

  public setMagnetActive(active: boolean) {
    this.magnetRings.forEach((r) => (r.visible = active));
  }

  public setBankingTilt(leanAmount: number) {
    this.group.rotation.z = -leanAmount * 0.22;
    // Counter-steer head slightly to keep eyes level
    this.headGroup.rotation.z = leanAmount * 0.10;
  }
}
