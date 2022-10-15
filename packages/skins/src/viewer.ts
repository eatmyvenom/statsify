/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/*
 * Using bundling gives weird results with type checking,
 * it is therefore disabled for this file, be assured all
 * the types here are correct :)!
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  AmbientLight,
  CanvasTexture,
  DepthTexture,
  EffectComposer,
  FXAAShader,
  FloatType,
  FullScreenQuad,
  Group,
  NearestFilter,
  PerspectiveCamera,
  PointLight,
  RenderPass,
  Scene,
  ShaderPass,
  Texture,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
} from "bundle";
import { BackEquipment, PlayerObject } from "./model";
import { Canvas } from "canvas";
import {
  ModelType,
  RemoteImage,
  TextureSource,
  inferModelType,
  isTextureSource,
  loadCapeToCanvas,
  loadEarsToCanvas,
  loadEarsToCanvasFromSkin,
  loadImage,
  loadSkinToCanvas,
} from "./utils";
import {
  createCanvas,
  // @ts-ignore No d.ts file for this
} from "node-canvas-webgl";

export interface LoadOptions {
  /**
   * Whether to make the object visible after the texture is loaded.
   *
   * @defaultValue `true`
   */
  makeVisible?: boolean;
}

export interface SkinLoadOptions extends LoadOptions {
  /**
   * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
   *
   * When set to `"auto-detect"`, the model will be inferred from the skin texture.
   *
   * @defaultValue `"auto-detect"`
   */
  model?: ModelType | "auto-detect";

  /**
   * Whether to display the ears drawn on the skin texture.
   *
   * - `true` - Display the ears drawn on the skin texture.
   * - `"load-only"` - Loads the ear texture, but do not make them visible.
   *   You can make them visible later by setting `PlayerObject.ears.visible` to `true`.
   * - `false` - Do not load or show the ears.
   *
   * @defaultValue `false`
   */
  ears?: boolean | "load-only";
}

export interface CapeLoadOptions extends LoadOptions {
  /**
   * The equipment (`"cape"` or `"elytra"`) to show when the cape texture is loaded.
   *
   * If `makeVisible` is set to false, this option will have no effect.
   *
   * @defaultValue `"cape"`
   */
  backEquipment?: BackEquipment;
}

export interface EarsLoadOptions extends LoadOptions {
  /**
   * The type of the provided ear texture.
   *
   * - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
   * - `"skin"` means the provided texture is a skin texture with ears, and we will use its ear part.
   *
   * @defaultValue `"standalone"`
   */
  textureType?: "standalone" | "skin";
}

export interface SkinViewerOptions {
  /**
   * The canvas where the renderer draws its output.
   *
   * @defaultValue If unspecified, a new canvas element will be created.
   */
  canvas?: Canvas;

  /**
   * The CSS width of the canvas.
   */
  width?: number;

  /**
   * The CSS height of the canvas.
   */
  height?: number;

  /**
   * The pixel ratio of the canvas.
   *
   * When set to `"match-device"`, the current device pixel ratio will be used,
   * and it will be automatically updated when the device pixel ratio changes.
   *
   * @defaultValue `"match-device"`
   */
  pixelRatio?: number | "match-device";

  /**
   * The skin texture of the player.
   *
   * @defaultValue If unspecified, the skin will be invisible.
   */
  skin?: RemoteImage | TextureSource;

  /**
   * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
   *
   * When set to `"auto-detect"`, the model will be inferred from the skin texture.
   *
   * If the `skin` option is not specified, this option will have no effect.
   *
   * @defaultValue `"auto-detect"`
   */
  model?: ModelType | "auto-detect";

  /**
   * The cape texture of the player.
   *
   * @defaultValue If unspecified, the cape will be invisible.
   */
  cape?: RemoteImage | TextureSource;

  /**
   * The ear texture of the player.
   *
   * When set to `"current-skin"`, the ears drawn on the current skin texture (as is specified in the `skin` option) will be shown.
   *
   * To use an individual ear texture, you have to specify the `textureType` and the `source` option.
   * `source` is the texture to use, and `textureType` can be either `"standalone"` or `"skin"`:
   *   - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
   *   - `"skin"` means the provided texture is a skin texture with ears, and we will show its ear part.
   *
   * @defaultValue If unspecified, the ears will be invisible.
   */
  ears?:
    | "current-skin"
    | {
        textureType: "standalone" | "skin";
        source: RemoteImage | TextureSource;
      };

  /**
   * Whether to preserve the buffers until manually cleared or overwritten.
   *
   * @defaultValue `false`
   */
  preserveDrawingBuffer?: boolean;

  /**
   * Camera vertical field of view, in degrees.
   *
   * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
   *
   * @defaultValue `50`
   *
   * @see {@link SkinViewer.adjustCameraDistance}
   */
  fov?: number;

  /**
   * Zoom ratio of the player.
   *
   * This value affects the distance between the object and the camera.
   * When set to `1.0`, the top edge of the player's head coincides with the edge of the canvas.
   *
   * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
   *
   * @defaultValue `0.9`
   *
   * @see {@link SkinViewer.adjustCameraDistance}
   */
  zoom?: number;

  cameraLightIntensity?: number;
  globalLightIntensity?: number;
}

/**
 * The SkinViewer renders the player on a canvas.
 */
export class SkinViewer {
  /**
   * The canvas where the renderer draws its output.
   */
  public readonly canvas: HTMLCanvasElement;

  public readonly scene: Scene;

  public readonly camera: PerspectiveCamera;

  public readonly renderer: WebGLRenderer;

  /**
   * The player object.
   */
  public readonly playerObject: PlayerObject;

  /**
   * A group that wraps the player object.
   * It is used to center the player in the world.
   */
  public readonly playerWrapper: Group;

  public readonly globalLight: AmbientLight;
  public readonly cameraLight: PointLight;

  public readonly composer: EffectComposer;
  public readonly renderPass: RenderPass;
  public readonly fxaaPass: ShaderPass;

  public readonly skinCanvas: Canvas;
  public readonly capeCanvas: Canvas;
  public readonly earsCanvas: Canvas;
  private skinTexture: Texture | null = null;
  private capeTexture: Texture | null = null;
  private earsTexture: Texture | null = null;

  private _disposed = false;
  private _zoom: number;

  public constructor(options: SkinViewerOptions = {}) {
    this.canvas = options.canvas === undefined ? createCanvas() : options.canvas;

    this.skinCanvas = createCanvas();
    this.capeCanvas = createCanvas();
    this.earsCanvas = createCanvas();

    this.globalLight = new AmbientLight(0xffffff, options.globalLightIntensity ?? 1);
    this.cameraLight = new PointLight(0xffffff, options.cameraLightIntensity ?? 0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.camera.add(this.cameraLight);
    this.scene.add(this.camera);
    this.scene.add(this.globalLight);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: options.preserveDrawingBuffer === true, // default: false
    });

    this.renderer.setClearColor(0, 0);

    let renderTarget;
    if (this.renderer.capabilities.isWebGL2) {
      // Use float precision depth if possible
      // see https://github.com/bs-community/skinview3d/issues/111
      renderTarget = new WebGLRenderTarget(0, 0, {
        depthTexture: new DepthTexture(0, 0, FloatType),
      });
    }
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.fxaaPass);

    this.playerObject = new PlayerObject();
    this.playerObject.name = "player";
    this.playerObject.skin.visible = false;
    this.playerObject.cape.visible = false;
    this.playerWrapper = new Group();
    this.playerWrapper.add(this.playerObject);
    this.scene.add(this.playerWrapper);

    if (options.skin !== undefined) {
      this.loadSkin(options.skin, {
        model: options.model,
        ears: options.ears === "current-skin",
      });
    }
    if (options.cape !== undefined) {
      this.loadCape(options.cape);
    }
    if (options.ears !== undefined && options.ears !== "current-skin") {
      this.loadEars(options.ears.source, {
        textureType: options.ears.textureType,
      });
    }
    if (options.width !== undefined) {
      this.width = options.width;
    }
    if (options.height !== undefined) {
      this.height = options.height;
    }
    this.camera.position.z = 1;
    this._zoom = options.zoom === undefined ? 0.9 : options.zoom;
    this.fov = options.fov === undefined ? 50 : options.fov;
  }

  /**
   * Renders the scene to the canvas.
   * This method does not change the animation progress.
   */
  public render(): void {
    this.composer.render();
  }

  public setSize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.updateComposerSize();
  }

  public dispose(): void {
    this._disposed = true;

    this.renderer.dispose();
    this.resetSkin();
    this.resetCape();
    this.resetEars();
    (this.fxaaPass.fsQuad as FullScreenQuad).dispose();
  }

  public loadSkin(empty: null): void;
  public loadSkin<S extends TextureSource | RemoteImage>(
    source: S,
    options?: SkinLoadOptions
  ): S extends TextureSource ? void : Promise<void>;

  public loadSkin(
    source: TextureSource | RemoteImage | null,
    options: SkinLoadOptions = {}
  ): void | Promise<void> {
    if (source === null) {
      this.resetSkin();
    } else if (isTextureSource(source)) {
      loadSkinToCanvas(this.skinCanvas, source);
      this.recreateSkinTexture();

      this.playerObject.skin.modelType =
        options.model === undefined || options.model === "auto-detect"
          ? inferModelType(this.skinCanvas)
          : options.model;

      if (options.makeVisible !== false) {
        this.playerObject.skin.visible = true;
      }

      if (options.ears === true || options.ears == "load-only") {
        loadEarsToCanvasFromSkin(this.earsCanvas, source);
        this.recreateEarsTexture();
        if (options.ears === true) {
          this.playerObject.ears.visible = true;
        }
      }
    } else {
      return loadImage(source).then((image) => this.loadSkin(image, options));
    }
  }

  public resetSkin(): void {
    this.playerObject.skin.visible = false;
    this.playerObject.skin.map = null;
    if (this.skinTexture !== null) {
      this.skinTexture.dispose();
      this.skinTexture = null;
    }
  }

  public loadCape(empty: null): void;
  public loadCape<S extends TextureSource | RemoteImage>(
    source: S,
    options?: CapeLoadOptions
  ): S extends TextureSource ? void : Promise<void>;

  public loadCape(
    source: TextureSource | RemoteImage | null,
    options: CapeLoadOptions = {}
  ): void | Promise<void> {
    if (source === null) {
      this.resetCape();
    } else if (isTextureSource(source)) {
      loadCapeToCanvas(this.capeCanvas, source);
      this.recreateCapeTexture();

      if (options.makeVisible !== false) {
        this.playerObject.backEquipment =
          options.backEquipment === undefined ? "cape" : options.backEquipment;
      }
    } else {
      return loadImage(source).then((image) => this.loadCape(image, options));
    }
  }

  public resetCape(): void {
    this.playerObject.backEquipment = null;
    this.playerObject.cape.map = null;
    this.playerObject.elytra.map = null;
    if (this.capeTexture !== null) {
      this.capeTexture.dispose();
      this.capeTexture = null;
    }
  }

  public loadEars(empty: null): void;
  public loadEars<S extends TextureSource | RemoteImage>(
    source: S,
    options?: EarsLoadOptions
  ): S extends TextureSource ? void : Promise<void>;

  public loadEars(
    source: TextureSource | RemoteImage | null,
    options: EarsLoadOptions = {}
  ): void | Promise<void> {
    if (source === null) {
      this.resetEars();
    } else if (isTextureSource(source)) {
      if (options.textureType === "skin") {
        loadEarsToCanvasFromSkin(this.earsCanvas, source);
      } else {
        loadEarsToCanvas(this.earsCanvas, source);
      }
      this.recreateEarsTexture();

      if (options.makeVisible !== false) {
        this.playerObject.ears.visible = true;
      }
    } else {
      return loadImage(source).then((image) => this.loadEars(image, options));
    }
  }

  public resetEars(): void {
    this.playerObject.ears.visible = false;
    this.playerObject.ears.map = null;
    if (this.earsTexture !== null) {
      this.earsTexture.dispose();
      this.earsTexture = null;
    }
  }

  public get disposed(): boolean {
    return this._disposed;
  }

  public get width(): number {
    return this.renderer.getSize(new Vector2()).width;
  }

  public set width(newWidth: number) {
    this.setSize(newWidth, this.height);
  }

  public get height(): number {
    return this.renderer.getSize(new Vector2()).height;
  }

  public set height(newHeight: number) {
    this.setSize(this.width, newHeight);
  }

  public adjustCameraDistance(): void {
    let distance = 4.5 + 16.5 / Math.tan(((this.fov / 180) * Math.PI) / 2) / this.zoom;

    // limit distance between 10 ~ 256 (default min / max distance of OrbitControls)
    if (distance < 10) {
      distance = 10;
    } else if (distance > 256) {
      distance = 256;
    }

    this.camera.position.multiplyScalar(distance / this.camera.position.length());
    this.camera.updateProjectionMatrix();
  }

  public resetCameraPose(): void {
    this.camera.position.set(0, 0, 1);
    this.camera.rotation.set(0, 0, 0);
    this.adjustCameraDistance();
  }

  public get fov(): number {
    return this.camera.fov;
  }

  public set fov(value: number) {
    this.camera.fov = value;
    this.adjustCameraDistance();
  }

  public get zoom(): number {
    return this._zoom;
  }

  public set zoom(value: number) {
    this._zoom = value;
    this.adjustCameraDistance();
  }

  private updateComposerSize(): void {
    this.composer.setSize(this.width, this.height);
    const pixelRatio = this.renderer.getPixelRatio();
    this.composer.setPixelRatio(pixelRatio);
    this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.width * pixelRatio);
    this.fxaaPass.material.uniforms["resolution"].value.y =
      1 / (this.height * pixelRatio);
  }

  private recreateSkinTexture(): void {
    if (this.skinTexture !== null) {
      this.skinTexture.dispose();
    }
    this.skinTexture = new CanvasTexture(this.skinCanvas as unknown as HTMLCanvasElement);
    this.skinTexture.magFilter = NearestFilter;
    this.skinTexture.minFilter = NearestFilter;
    this.playerObject.skin.map = this.skinTexture as any;
  }

  private recreateCapeTexture(): void {
    if (this.capeTexture !== null) {
      this.capeTexture.dispose();
    }
    this.capeTexture = new CanvasTexture(this.capeCanvas as unknown as HTMLCanvasElement);
    this.capeTexture.magFilter = NearestFilter;
    this.capeTexture.minFilter = NearestFilter;
    this.playerObject.cape.map = this.capeTexture as any;
    this.playerObject.elytra.map = this.capeTexture as any;
  }

  private recreateEarsTexture(): void {
    if (this.earsTexture !== null) {
      this.earsTexture.dispose();
    }
    this.earsTexture = new CanvasTexture(this.earsCanvas as unknown as HTMLCanvasElement);
    this.earsTexture.magFilter = NearestFilter;
    this.earsTexture.minFilter = NearestFilter;
    this.playerObject.ears.map = this.earsTexture as any;
  }

  private draw(): void {
    this.render();
  }
}
