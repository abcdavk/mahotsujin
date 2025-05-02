import { Dimension, Player, TicksPerSecond } from "@minecraft/server";
import { Unicode } from "../utils/unicode";
import { throwableMagicHandler } from "../systems/magicHandler";
import { ISpellRegistry } from "../utils/interfaces";

export const spellsRegistry: ISpellRegistry[] = [
  {
    id: "fire:fire_ball",
    name: `${Unicode.fire} Fire Ball`,
    damage: 5,
    range: 64,
    mana_usage: 2,
    area_effect: 4,
    crowd_controll: false,
    casting_speed: 1.0 * TicksPerSecond,
    execute: function(player: Player, dimension: Dimension) {
      throwableMagicHandler(player, dimension, this);
    }     
  },
  {
    id: "fire:fire_breath",
    name: `${Unicode.fire} Fire Breath`,
    damage: 5,
    range: 4,
    mana_usage: 0.5,
    area_effect: 4,
    crowd_controll: false,
    casting_speed: 0.5 * TicksPerSecond,
    execute: (player: Player, dimension: Dimension) => {}
  },
  {
    id: "fire:blast_vortex",
    name: `${Unicode.fire} Blast Vortex`,
    damage: 3,
    range: 4,
    mana_usage: 2,
    area_effect: 4,
    crowd_controll: true,
    casting_speed: 1.0 * TicksPerSecond,
    execute: (player: Player, dimension: Dimension) => {}
  },
];