/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, Image } from "canvas";

export type TextureCanvas = Canvas;
export type TextureSource = Image | TextureCanvas;
export type ModelType = "default" | "slim";

export function isTextureSource(value: unknown): value is TextureSource {
  return (
    value instanceof Image ||
    value instanceof Canvas ||
    (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap)
  );
}
