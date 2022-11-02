/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelPitBounty } from "@statsify/hypixel-api-client";
import { romanNumeral } from "@statsify/util";

const xpMap = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];

const prestiges = [
  100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000,
  1200, 1400, 1600, 1800, 2000, 2400, 2800, 3200, 3600, 4000, 4500, 5000, 7500, 10_000,
  10_100, 10_100, 10_100, 10_100, 10_100, 20_000, 30_000, 40_000, 50_000, 75_000, 100_000,
  125_000, 150_000, 175_000, 200_000, 300_000, 500_000, 1_000_000, 5_000_000, 10_000_000,
];

const presRequirements = [
  [65_950, 10_000],
  [138_510, 20_000],
  [217_680, 20_000],
  [303_430, 20_000],
  [395_760, 30_000],
  [494_700, 35_000],
  [610_140, 40_000],
  [742_040, 45_000],
  [906_930, 50_000],
  [1_104_780, 60_000],
  [1_368_580, 70_000],
  [1_698_330, 80_000],
  [2_094_030, 90_000],
  [2_555_680, 100_000],
  [3_083_280, 125_000],
  [3_676_830, 150_000],
  [4_336_330, 175_000],
  [5_127_730, 200_000],
  [6_051_030, 250_000],
  [7_106_230, 300_000],
  [8_293_330, 350_000],
  [9_612_330, 400_000],
  [11_195_130, 500_000],
  [13_041_730, 600_000],
  [15_152_130, 700_000],
  [17_526_330, 800_000],
  [20_164_330, 900_000],
  [23_132_080, 1_000_000],
  [26_429_580, 1_000_000],
  [31_375_830, 1_000_000],
  [37_970_830, 1_000_000],
  [44_631_780, 1_000_000],
  [51_292_730, 1_000_000],
  [57_953_680, 1_000_000],
  [64_614_630, 1_000_000],
  [71_275_580, 2_000_000],
  [84_465_580, 2_000_000],
  [104_250_580, 2_000_000],
  [130_630_580, 2_000_000],
  [163_605_580, 2_000_000],
  [213_068_080, 2_000_000],
  [279_018_080, 2_000_000],
  [361_455_580, 2_000_000],
  [460_380_580, 2_000_000],
  [575_793_080, 2_000_000],
  [707_693_080, 2_000_000],
  [905_543_080, 2_000_000],
  [1_235_293_080, 2_000_000],
  [1_894_793_080, 2_000_000],
  [5_192_293_080, 2_000_000],
  [11_787_293_080, 2_000_000],
];

const prestigecolors = ["7", "9", "e", "6", "c", "5", "d", "f", "b", "1", "0", "3"];

const levelColors = [
  "7",
  "9",
  "3",
  "2",
  "a",
  "e",
  "l§6",
  "l§c",
  "l§4",
  "l§5",
  "l§d",
  "l§f",
  "l§b",
];

export const getPres = (xp: number): number => {
  for (const [i, [expNeeded]] of presRequirements.entries()) {
    if (xp <= expNeeded) {
      return i;
    }
  }

  return 0;
};

export const getPresExpReq = (pres: number) =>
  pres > -1 ? presRequirements[pres][0] : 0;

export const getPresGoldReq = (pres: number) =>
  pres > -1 ? presRequirements[pres][1] : 0;

export const getLevel = (pres: number, xp: number) => {
  let level = 120;

  for (let xpRemaining = presRequirements[pres][0]; xpRemaining > xp; ) {
    level -= 1;
    xpRemaining -= Math.ceil((xpMap[Math.floor(level / 10)] * prestiges[pres]) / 100);
  }

  return level ?? 0;
};

export const getLevelColor = (level: number) =>
  levelColors[Math.floor(level / 10)] ?? "7";

export const getPresColor = (pres: number) =>
  pres == 0 ? prestigecolors[0] : prestigecolors[Math.floor((pres + 5) / 5)];

export const getBounty = (bounties: HypixelPitBounty[]) =>
  bounties ? bounties.reduce((p, c) => p + c.amount, 0) : 0;

export const getLevelFormatted = (level: number, prestige: number) => {
  const presColor = getPresColor(prestige);
  const levelColor = getLevelColor(level);

  return `§${presColor}[${
    prestige > 0 ? `§e${romanNumeral(prestige)}§${presColor}-` : ""
  }§${levelColor}${level}§r§${presColor}]`;
};
