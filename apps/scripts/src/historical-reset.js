/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Redis from "ioredis";
import { ApiService, HistoricalTimes } from "@statsify/api-client";

import { SimpleIntervalJob, Task } from "toad-scheduler";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Logger } = require("@statsify/logger");
const { Player } = require("@statsify/schemas");
const { config } = require("@statsify/util");

const redis = new Redis(config("database.redisUrl"));
const api = new ApiService(config("apiClient.route"), config("apiClient.route"));
const logger = new Logger("Historical Reset");
const mongoose = require("mongoose");

mongoose.connect(config("database.mongoUri"));
class daily extends Player {}
const dailyModel = mongoose.model("daily", mongoose.Schema(daily));

function getType() {
  const date = new Date();

  return date.getDate() === 1
    ? HistoricalTimes.MONTHLY
    : date.getDay() === 1
    ? HistoricalTimes.WEEKLY
    : HistoricalTimes.DAILY;
}

function getMinute() {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
}

async function resetPlayers(minute) {
  if (!minute) {
    let lastCompletedMinute = await Number(redis.get("completedMinue"));

    if (!Number.isNaN(lastCompletedMinute) && lastCompletedMinute < minute - 1) {
      for (let i = 0; i < minute - 1; i++) {
        await resetPlayers(i);
      }
    }
  } else {
    minute = getMinute();
  }

  const players = await dailyModel
    .find({ resetMinute: minute })
    .select({ uuid: true })
    .lean()
    .exec();

  const type = getType();

  players.forEach(async ({ uuid }) => {
    const player = await api.resetPlayerHistorical(uuid, undefined, type);

    if (player) {
      logger.debug(`Successfully reset player with uuid ${uuid}`);
    } else {
      logger.error(`Could not reset player with uuid ${uuid}`);
    }
  });

  await redis.set("completedMinute", minute);
}

const task = new Task("Historical Reset", resetPlayers);
const job = new SimpleIntervalJob({ minutes: 1, runImmediately: true }, task);
job.start();
