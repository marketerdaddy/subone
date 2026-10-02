import * as THREE from 'three';

/**
 * High-performance procedural canvas texture generator for AAA cyberpunk visuals.
 * Generates rich, sharp, glowing textures on the fly without network dependencies.
 */
export class ProceduralTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Skyscraper Facade: Realistic high-rise building with illuminated window grids,
   * architectural panels, and glowing neon strips.
   */
  public static getBuildingTexture(primaryHue: number = 220): THREE.CanvasTexture {
    const key = `building_${primaryHue}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep obsidian metallic facade base
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#050811');
    grad.addColorStop(0.6, '#080d1a');
    grad.addColorStop(1, '#0a1020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Sleek architectural vertical mullions & structural ribbing
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    // Secondary architectural division bands
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let y = 0; y <= 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Sparse, refined vertical slit windows (AAA cinematic architectural lighting)
    const rows = 32;
    const cols = 16;
    const winW = 12;
    const winH = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 10 + c * 32;
        const y = 8 + r * 32;

        // Controlled sparsity: only ~12% of windows illuminated
        const rand = Math.random();
        if (rand > 0.88) {
          if (rand > 0.95) {
            ctx.fillStyle = '#38bdf8'; // Soft cyan
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
          } else if (rand > 0.92) {
            ctx.fillStyle = '#0ea5e9'; // Ice blue
            ctx.shadowColor = '#0369a1';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = '#1e293b'; // Dim interior ambient
            ctx.shadowBlur = 0;
          }
          ctx.fillRect(x, y, winW, winH);
          ctx.shadowBlur = 0;
        } else {
          // Dark tinted reflective glass
          ctx.fillStyle = '#070b14';
          ctx.fillRect(x, y, winW, winH);
        }
      }
    }

    // Controlled horizontal high-tech neon datum lines
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(0, 320, 512, 3);
    ctx.fillRect(0, 704, 512, 3);
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Cyberpunk Neon Billboard Sign (e.g. "NEON RUN", "CYBERDRIVE", "NEXUS")
   */
  public static getNeonSignTexture(signText: string, colorHex: string = '#38bdf8'): THREE.CanvasTexture {
    const key = `sign_${signText}_${colorHex}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Dark glass backing
    ctx.fillStyle = 'rgba(7, 11, 22, 0.92)';
    ctx.fillRect(0, 0, 512, 256);

    // Glowing border frame
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 8;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 18;
    ctx.strokeRect(10, 10, 492, 236);

    // High-tech typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 52px "Arial Black", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 24;
    ctx.fillText(signText, 256, 110);

    // Sub-label
    ctx.font = '800 20px sans-serif';
    ctx.fillStyle = colorHex;
    ctx.shadowBlur = 10;
    ctx.fillText('⚡ APEX HIGHWAY // SPEED ACTIVE ⚡', 256, 175);
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Wet Reflective Cyber Highway Track Bed with directional neon speed arrows
   */
  public static getHighwayTrackTexture(): THREE.CanvasTexture {
    const key = 'highway_track';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Dark sleek asphalt
    ctx.fillStyle = '#090d18';
    ctx.fillRect(0, 0, 512, 1024);

    // Asphalt noise / wet sheen
    ctx.fillStyle = '#101626';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 1024;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Outer glowing border lines (Lane limits)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.strokeRect(4, 0, 504, 1024);

    // 3 Lanes Dividers (Dashed neon lines)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 30]);
    // Lane divider 1
    ctx.beginPath();
    ctx.moveTo(170, 0);
    ctx.lineTo(170, 1024);
    ctx.stroke();

    // Lane divider 2
    ctx.beginPath();
    ctx.moveTo(342, 0);
    ctx.lineTo(342, 1024);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Directional Speed Chevrons in Center Lane (>>>)
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 14;
    for (let y = 80; y < 1024; y += 180) {
      ctx.beginPath();
      ctx.moveTo(236, y);
      ctx.lineTo(256, y - 25);
      ctx.lineTo(276, y);
      ctx.lineTo(266, y + 10);
      ctx.lineTo(256, y - 5);
      ctx.lineTo(246, y + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Industrial Hazard Chevrons (Yellow & Black diagonal warning stripes)
   */
  public static getHazardChevronTexture(): THREE.CanvasTexture {
    const key = 'hazard_chevrons';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal black stripes
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    const stripeW = 40;
    for (let i = -256; i < 512; i += stripeW * 2) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeW, 0);
      ctx.lineTo(i + stripeW + 256, 256);
      ctx.lineTo(i + 256, 256);
      ctx.closePath();
    }
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }
}
