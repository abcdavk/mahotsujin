import { TicksPerSecond } from "@minecraft/server";
import { Unicode } from "../utils/unicode";
export const spellsRegistry = [
    {
        id: "fire:fire_ball",
        name: `${Unicode.fire} Fire Ball`,
        damage: 5,
        range: 8,
        holdable: false,
        mana_usage: 2,
        area_effect: 4,
        crowd_controll: false,
        casting_speed: 1.0 * TicksPerSecond,
    },
    {
        id: "fire:fire_breath",
        name: `${Unicode.fire} Fire Breath`,
        damage: 5,
        range: 4,
        holdable: true,
        mana_usage: 0.5,
        area_effect: 4,
        crowd_controll: false,
        casting_speed: 0.5 * TicksPerSecond,
    },
    {
        id: "fire:blast_vortex",
        name: `${Unicode.fire} Blast Vortex`,
        damage: 3,
        range: 4,
        holdable: false,
        mana_usage: 2,
        area_effect: 4,
        crowd_controll: true,
        casting_speed: 1.0 * TicksPerSecond,
    },
];
