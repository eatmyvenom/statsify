import { APIData } from '@statsify/util';

export class GeneralUtil {
  public static getChallenges({ all_time: allTime = {} }: APIData = {}) {
    let challenges = 0;

    for (const challenge of Object.values(allTime)) {
      challenges += challenge as number;
    }

    return challenges;
  }
  public static getNetworkExp(networkLevel = 1) {
    return (Math.pow((networkLevel + 2.5) * 50, 2) - 30625) / 2;
  }

  public static getNetworkLevel(networkExp = 0) {
    return networkExp ? +(Math.sqrt(networkExp * 2 + 30625) / 50 - 2.5).toFixed(2) : 1;
  }

  public static getQuests(questData: APIData = {}) {
    return Object.values(questData).reduce((p, c) => p + (c?.completions?.length ?? 0), 0);
  }
}
