import { TicksPerSecond } from "@minecraft/server";
import { Unicode } from "../utils/unicode";
export const spellsRegistry = [
    {
        id: "fire:fire_ball",
        name: `${Unicode.fire} Fire Ball`,
        damage: 5,
        range: 64,
        holdable: false,
        mana_usage: 2,
        area_effect: 4,
        crowd_controll: false,
        casting_speed: 1.0 * TicksPerSecond,
        execute: function (player, dimension) {
            const entityTarget = player.getEntitiesFromViewDirection({ maxDistance: this.range })?.[0]?.entity;
            const blockTarget = !entityTarget
                ? player.getBlockFromViewDirection({ maxDistance: this.range })?.block
                : null;
            const viewDir = player.getViewDirection();
            const origin = {
                x: player.location.x + viewDir.x * 2.0,
                y: player.getHeadLocation().y,
                z: player.location.z + viewDir.z * 2.0,
            };
            const projectile = dimension.spawnEntity("fire:fireball", origin);
            let targetPos;
            if (entityTarget) {
                targetPos = entityTarget.location;
            }
            else if (blockTarget) {
                targetPos = blockTarget.location;
            }
            else {
                // Tidak ada target: arahkan berdasarkan viewDir
                targetPos = {
                    x: origin.x + viewDir.x,
                    y: origin.y + viewDir.y,
                    z: origin.z + viewDir.z,
                };
            }
            const dx = targetPos.x - origin.x;
            const dy = targetPos.y - origin.y;
            const dz = targetPos.z - origin.z;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (length === 0)
                return;
            const speed = 2;
            const impulse = {
                x: (dx / length) * speed,
                y: (dy / length) * speed,
                z: (dz / length) * speed,
            };
            projectile.applyImpulse(impulse);
        }
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
        execute: (player, dimension) => { }
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
        execute: (player, dimension) => { }
    },
];
