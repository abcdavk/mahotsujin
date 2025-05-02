import { system } from "@minecraft/server";
import { magicParticles } from "../constants/magicParticles";
export class CreateParticle {
    constructor(entity, dimension, spellSelected) {
        this.lastTickPercent = 0;
        this.entity = entity;
        this.dimension = dimension;
        this.spellSelected = spellSelected;
    }
    getForwardVector(distance) {
        const { x, y, z } = this.entity.getHeadLocation();
        const { x: rotX, y: rotY } = this.entity.getRotation();
        const radYaw = rotY * (Math.PI / 180);
        const radPitch = rotX * (Math.PI / 180);
        // Forward vector
        const dx = -Math.sin(radYaw) * Math.cos(radPitch);
        const dy = -Math.sin(radPitch);
        const dz = Math.cos(radYaw) * Math.cos(radPitch);
        // Right vector
        const rightX = Math.cos(radYaw);
        const rightY = 0;
        const rightZ = Math.sin(radYaw);
        // Up vector
        const upX = Math.sin(radPitch) * Math.sin(radYaw);
        const upY = Math.cos(radPitch);
        const upZ = -Math.sin(radPitch) * Math.cos(radYaw);
        const offsetRight = 0.8;
        const offsetUp = 0.8;
        return {
            x: x + dx * distance - rightX * offsetRight + upX * offsetUp,
            y: y + dy * distance - rightY * offsetRight + upY * offsetUp,
            z: z + dz * distance - rightZ * offsetRight + upZ * offsetUp,
        };
    }
    spawnByTick(currentTick, completeTick) {
        if (this.spellSelected === undefined)
            return;
        const tickPercent = (currentTick / completeTick) * 100;
        const particles = magicParticles[this.spellSelected];
        particles.forEach((particle, index, arr) => {
            const start = particle.tickPercent;
            const end = arr[index + 1]?.tickPercent ?? 100;
            const shouldSpawn = (tickPercent >= start && this.lastTickPercent < start) ||
                (start === 0 && this.lastTickPercent === 0 && currentTick === 0);
            if (shouldSpawn && tickPercent < end) {
                const forward = this.getForwardVector(1.2);
                this.dimension.spawnParticle(particle.id, forward);
            }
        });
        this.lastTickPercent = tickPercent;
    }
    spawnLastTick(distance = 1.2) {
        const particles = magicParticles[this.spellSelected];
        const lastParticle = particles[particles.length - 1];
        const forward = this.getForwardVector(distance);
        this.dimension.spawnParticle(lastParticle.id, forward);
    }
    spawnInterval() {
        let runId = system.runInterval(() => {
            if (this.entity.isValid() === false) {
                system.clearRun(runId);
            }
            else {
                this.spawnLastTick(0);
            }
        });
    }
}
