import { Dimension, Player, Vector3 } from "@minecraft/server";
import { ISpellRegistry } from "../utils/interfaces";

export function throwableMagicHandler(player: Player, dimension: Dimension, spellReg: ISpellRegistry) {
  const entityTarget = player.getEntitiesFromViewDirection({ maxDistance: spellReg.range })?.[0]?.entity;
  const blockTarget = !entityTarget 
    ? player.getBlockFromViewDirection({ maxDistance: spellReg.range })?.block 
    : null;

  const viewDir = player.getViewDirection();
  const origin: Vector3 = {
    x: player.location.x + viewDir.x * 2.0,
    y: player.getHeadLocation().y + 4,
    z: player.location.z + viewDir.z * 2.0,
  };
  
  const projectile = dimension.spawnEntity(spellReg.id, origin);

  let targetPos: Vector3;
  if (entityTarget) {
    targetPos = entityTarget.location;
  } else if (blockTarget) {
    targetPos = blockTarget.location;
  } else {
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

  if (length === 0) return;

  const speed = 2;
  const impulse: Vector3 = {
    x: (dx / length) * speed,
    y: (dy / length) * speed,
    z: (dz / length) * speed,
  };

  projectile.applyImpulse(impulse);
}