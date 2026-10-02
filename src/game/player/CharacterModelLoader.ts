import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedCharacter {
  scene: THREE.Group;
  mixer?: THREE.AnimationMixer;
  animations: THREE.AnimationClip[];
}

/**
 * Clean asset-loader architecture for GLB/GLTF humanoid runner characters.
 * Provides caching, automatic shadow mapping enablement, and animation mixer creation.
 */
export class CharacterModelLoader {
  private static loader = new GLTFLoader();
  private static cache = new Map<string, THREE.Group>();
  private static animationsCache = new Map<string, THREE.AnimationClip[]>();

  public static async loadModel(url: string): Promise<LoadedCharacter | null> {
    try {
      if (this.cache.has(url)) {
        const cachedModel = this.cache.get(url)!;
        const clonedScene = cachedModel.clone(true) as THREE.Group;
        const anims = this.animationsCache.get(url) || [];
        const mixer = anims.length > 0 ? new THREE.AnimationMixer(clonedScene) : undefined;
        return { scene: clonedScene, mixer, animations: anims };
      }

      return await new Promise<LoadedCharacter | null>((resolve) => {
        this.loader.load(
          url,
          (gltf) => {
            const model = gltf.scene;

            // Configure shadow casting and receiving for all meshes
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            this.cache.set(url, model);
            this.animationsCache.set(url, gltf.animations || []);

            const cloned = model.clone(true) as THREE.Group;
            const mixer = gltf.animations && gltf.animations.length > 0 ? new THREE.AnimationMixer(cloned) : undefined;
            resolve({ scene: cloned, mixer, animations: gltf.animations || [] });
          },
          undefined,
          (error) => {
            console.warn(`[CharacterModelLoader] Model at ${url} could not be loaded, using procedural character.`, error);
            resolve(null);
          }
        );
      });
    } catch (err) {
      console.warn(`[CharacterModelLoader] Error loading ${url}`, err);
      return null;
    }
  }

  public static clearCache() {
    this.cache.clear();
    this.animationsCache.clear();
  }
}
