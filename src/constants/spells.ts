import { Dimension, Player, TicksPerSecond } from "@minecraft/server";
import { Unicode } from "../utils/unicode";
import { holdableMagicHandler, throwableMagicHandler } from "../systems/magicHandler";
import { IProjectileSetting, ISpellRegistry } from "../utils/interfaces";

export const spellsRegistry: ISpellRegistry[] = [
  {
    id: "fire:fireball",
    name: `${Unicode.fire} Fire Ball`,
    damage: 5,
    range: 24,
    mana_usage: 2,
    area_effect: 6,
    crowd_control: false,
    casting_speed: 1.0 * TicksPerSecond,
    execute: function(player: Player, dimension: Dimension) {
      const projectileSetting: IProjectileSetting = {
        icon: "magma",
        rgba: [1, 0.5, 0, 0.5]
      }
      throwableMagicHandler(player, dimension, projectileSetting, this);
    }
  },
  {
    id: "fire:fire_breath",
    name: `${Unicode.fire} Fire Breath`,
    damage: 1,
    range: 4,
    mana_usage: 0.5,
    area_effect: 4,
    crowd_control: false,
    casting_speed: 0.5 * TicksPerSecond,
    execute: function(player: Player, dimension: Dimension) {
      const holdSetting = {
        holdDuration: 3 * TicksPerSecond,
        rgba: [1, 0.6, 0, 0.1],
        speed: 4,
        particle_maxAge: 1,
        screenShake: true
      }
      
      holdableMagicHandler(player, dimension, holdSetting, this);
    }
  },
  {
    id: "fire:blast_vortex",
    name: `${Unicode.fire} Blast Vortex`,
    damage: 3,
    range: 4,
    mana_usage: 2,
    area_effect: 4,
    crowd_control: true,
    casting_speed: 2.0 * TicksPerSecond,
    execute: function(player: Player, dimension: Dimension) {}
  },
];