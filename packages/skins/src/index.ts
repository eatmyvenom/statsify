/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, loadImage } from "canvas";
import { PlayerObject } from "./model";
import { SkinViewer } from "./viewer";
import {
  createCanvas as createGlCanvas,
  loadImage as loadWebGlImage,
  // @ts-ignore No d.ts file for this
} from "node-canvas-webgl";

// @ts-ignore overwriting
global.window = {};

// @ts-ignore overwriting
global.navigator = { userAgent: "" };

// @ts-ignore overwriting
global.devicePixelRatio = 1;

const radians = (deg: number) => (deg * Math.PI) / 180;

const convertFromSkiaImage = (skia: any) => loadWebGlImage(skia._data);

export interface renderSkinOptions {
  slim: boolean;
  fov?: number;
  zoom?: number;
  transformer?: (player: PlayerObject) => void;
}

const defaultTransformer = (player: PlayerObject) => {
  player.rotateX(radians(30));
  player.rotateY(radians(30));
  player.rotateZ(radians(0));

  player.skin.leftArm.rotateZ(radians(10));
  player.skin.leftArm.position.z = 0.1;

  player.skin.rightArm.rotateZ(radians(-10));
  player.skin.rightArm.position.z = 0.1;

  player.skin.leftLeg.position.x = 2;
  player.skin.rightLeg.position.x = -2;

  player.skin.head.position.z = 0.1;
};

/**
 *
 * @param {Image} skin
 * @param {boolean} slim
 * @returns {Promise<Buffer>}
 */
export const renderSkin = async (
  skin: any,
  { slim, fov = 30, zoom = 0.82, transformer }: renderSkinOptions
) => {
  const canvas = createGlCanvas(1, 1);

  const skinView = new SkinViewer({
    canvas,
    width: 600,
    height: 800,
    fov,
    zoom,
    cameraLightIntensity: 0.1,
  });

  skinView.playerObject.resetJoints();
  if (transformer) transformer(skinView.playerObject);
  else defaultTransformer(skinView.playerObject);

  await skinView.loadSkin(await convertFromSkiaImage(skin), {
    model: slim ? "slim" : "default",
  });

  skinView.adjustCameraDistance();
  skinView.render();

  const buffer = canvas.toBuffer();

  const croppedCanvas = new Canvas(380, 640);
  const ctx = croppedCanvas.getContext("2d");

  const skinRender = await loadImage(buffer);

  ctx.drawImage(
    skinRender,
    120,
    65,
    croppedCanvas.width,
    croppedCanvas.height,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  return croppedCanvas.toBuffer();
};
