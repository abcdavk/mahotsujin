import { TicksPerSecond } from "@minecraft/server";
export const magicWeapons = [
    {
        id: "dave:wand",
        mana_efficiency: false,
        use_duration: 1.2 * TicksPerSecond,
        range_level: 16,
    },
    {
        id: "dave:lapis_wand",
        mana_efficiency: true,
        use_duration: 1.2 * TicksPerSecond,
        range_level: 16,
    },
    {
        id: "dave:amethyst_wand",
        mana_efficiency: false,
        use_duration: 1.2 * TicksPerSecond,
        range_level: 24,
    },
    {
        id: "dave:redstone_wand",
        mana_efficiency: false,
        use_duration: 0.75 * TicksPerSecond,
        range_level: 16,
    },
    {
        id: "dave:staff",
        mana_efficiency: false,
        use_duration: 2.0 * TicksPerSecond,
        range_level: 24,
    },
    {
        id: "dave:lapis_staff",
        mana_efficiency: true,
        use_duration: 2.0 * TicksPerSecond,
        range_level: 24,
    },
    {
        id: "dave:amethyst_staff",
        mana_efficiency: false,
        use_duration: 2.0 * TicksPerSecond,
        range_level: 32,
    },
    {
        id: "dave:redstone_staff",
        mana_efficiency: false,
        use_duration: 1.34 * TicksPerSecond,
        range_level: 24,
    },
];
