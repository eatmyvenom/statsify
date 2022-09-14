/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "bundle.ts",
  output: {
    file: "bundles/bundle.js",
    format: "commonjs",
    name: "skinview3d",
    sourcemap: true,
    compact: false,
  },
  plugins: [typescript(), resolve()],
};
