/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Image,
  // @ts-ignore No d.ts file for this
} from "node-canvas-webgl";

export type RemoteImage =
  | string
  | {
      src: string;
      /** @defaultvalue "anonymous" */
      crossOrigin?: string | null;
      referrerPolicy?: string;
    };

export async function loadImage(source: RemoteImage): Promise<HTMLImageElement> {
  const image = Image();
  return new Promise((resolve, reject) => {
    image.addEventListener("load", (): void => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    if (typeof source === "string") {
      image.src = source;
    } else {
      if (source.crossOrigin !== undefined) {
        image.crossOrigin = source.crossOrigin;
      }
      if (source.referrerPolicy !== undefined) {
        image.referrerPolicy = source.referrerPolicy;
      }
      image.src = source.src;
    }
  });
}
