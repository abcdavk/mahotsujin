import { Dimension, Player } from "@minecraft/server";

export interface ISpellRegistry {
  id: string;
  name: string;
  damage: number;
  range: number;
  mana_usage: number;
  area_effect: number;
  crowd_control: boolean;
  casting_speed: number;
  execute: (player: Player, dimension: Dimension) => void;
}

export interface IProjectileSetting {
  icon: string,
  rgba: [number, number, number, number]
}