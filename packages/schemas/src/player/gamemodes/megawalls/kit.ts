import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class MegaWallsKit {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public finalKills: number;

  @Field()
  public finalDeaths: number;

  @Field()
  public fkdr: number;

  @Field({ leaderboard: { enabled: false } })
  public assists: number;

  @Field({ leaderboard: { enabled: false } })
  public timePlayed: number;

  @Field({ leaderboard: { enabled: false } })
  public witherDamage: number;

  @Field({ leaderboard: { enabled: false } })
  public witherKills: number;

  public constructor(data: APIData, kit: string) {
    kit = kit ? `${kit}_` : kit;

    this.wins = data[`${kit}wins`];
    this.losses = data[`${kit}losses`];
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data[`${kit}kills`];
    this.deaths = data[`${kit}deaths`];
    this.kdr = ratio(this.kills, this.deaths);

    this.finalKills = data[`${kit}final_kills`];
    this.finalDeaths = data[`${kit}final_deaths`];
    this.fkdr = ratio(this.finalKills, this.finalDeaths);

    this.assists = data[`${kit}assists`];
    this.timePlayed = data[`${kit}time_played`];
    this.witherDamage = data[`${kit}wither_damage`];
    this.witherKills = data[`${kit}wither_kills`];
  }
}
