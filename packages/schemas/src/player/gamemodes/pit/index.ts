/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import { GameType, GetMetadataModes, StatsifyApiModes } from "../../../metadata/GameType";
import { HypixelPitProfile, HypixelPitStatsPTL } from "@statsify/hypixel-api-client";
import { Progression } from "../../../progression";
import { add, ratio } from "@statsify/math";
import { formatTime } from "@statsify/util";
import {
  getBounty,
  getLevel,
  getLevelFormatted,
  getPres,
  getPresExpReq,
  getPresGoldReq,
} from "./util";

@GameType("overall", "PIT", "Pit")
export class Pit {
  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      additionalFields: ["this.kills", "this.playtime"],
      formatter: (exp: number) => {
        const prestige = getPres(exp);
        const level = getLevel(prestige, exp);
        return getLevelFormatted(level, prestige);
      },
    },
    historical: {
      hidden: false,
      fieldName: "EXP Gained",
      additionalFields: ["this.trueLevel"],
      formatter: Number,
    },
  })
  public exp: number;

  /**
   * Pit level including prestige (used for historical)
   */
  @Field({
    leaderboard: { enabled: false },
    historical: { enabled: false, fieldName: "Levels Gained" },
  })
  public trueLevel: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public expProgression: Progression;

  @Field()
  public goldProgression: Progression;

  @Field({
    leaderboard: { additionalFields: ["this.goldEarned"] },
    historical: { enabled: false },
  })
  public gold: number;

  @Field({
    leaderboard: { additionalFields: ["this.gold"] },
    historical: { additionalFields: [] },
  })
  public goldEarned: number;

  @Field({ leaderboard: { enabled: false }, historical: { enabled: false } })
  public currentPresGold: number;

  @Field({ historical: { enabled: false } })
  public renown: number;

  @Field({ historical: { enabled: false } })
  public bounty: number;

  @Field()
  public contractsCompleted: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field({
    leaderboard: { name: "Tier I Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier1MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Tier II Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier2MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Tier III Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier3MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Total Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public totalMysticsEnchanted: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public playtime: number;

  @Field({ historical: { enabled: false } })
  public highestStreak: number;

  @Field()
  public joins: number;

  public constructor(profile: HypixelPitProfile, data: HypixelPitStatsPTL) {
    this.exp = profile.xp ?? 0;
    this.gold = profile.cash;
    this.renown = profile.renown;
    this.bounty = getBounty(profile.bounties);

    const prestige = getPres(this.exp);
    const level = getLevel(prestige, this.exp);

    this.trueLevel = prestige * 120 + level;

    this.currentPresGold = profile[`cash_during_prestige_${prestige}`] ?? 0;

    this.expProgression = new Progression(
      this.exp - getPresExpReq(prestige - 1),
      getPresExpReq(prestige) - getPresExpReq(prestige - 1)
    );

    this.goldProgression = new Progression(
      this.currentPresGold,
      getPresGoldReq(prestige)
    );

    this.levelFormatted = getLevelFormatted(level, prestige);
    this.nextLevelFormatted = getLevelFormatted(1, prestige + 1);

    this.contractsCompleted = data.contracts_completed;

    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.assists = data.assists;

    this.tier1MysticsEnchanted = data.enchanted_tier1;
    this.tier2MysticsEnchanted = data.enchanted_tier2;
    this.tier3MysticsEnchanted = data.enchanted_tier3;

    this.totalMysticsEnchanted = add(
      this.tier1MysticsEnchanted,
      this.tier2MysticsEnchanted,
      this.tier3MysticsEnchanted
    );

    this.goldEarned = data.cash_earned;
    this.playtime = (data.playtime_minutes ?? 0) * 60 * 1000;
    this.highestStreak = data.max_streak;
    this.joins = data.joins;
  }
}

export type PitModes = StatsifyApiModes<Pit, "overall">;
export const PIT_MODES = new GameModes<PitModes>(GetMetadataModes(Pit));
